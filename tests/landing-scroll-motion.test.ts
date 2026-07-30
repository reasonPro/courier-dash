import { readFileSync } from "node:fs";

import { describe, expect, it, vi } from "vitest";

import {
  applyLandingLayerTransforms,
  getLandingLayerTransforms,
  startLandingScrollMotion,
} from "../lib/landing-scroll-motion";

function createLayer() {
  return { style: { transform: "" } };
}

function createMotionHarness(initialScroll = 0) {
  const layers = {
    mesh: createLayer(),
    map: createLayer(),
    foreground: createLayer(),
  };
  const frames = new Map<number, FrameRequestCallback>();
  let nextFrame = 1;
  let scrollY = initialScroll;
  let scrollListener: (() => void) | null = null;

  const requestFrame = vi.fn((callback: FrameRequestCallback) => {
    const frame = nextFrame++;
    frames.set(frame, callback);
    return frame;
  });
  const cancelFrame = vi.fn((frame: number) => frames.delete(frame));
  const addScrollListener = vi.fn((listener: () => void) => {
    scrollListener = listener;
  });
  const removeScrollListener = vi.fn((listener: () => void) => {
    if (scrollListener === listener) scrollListener = null;
  });

  return {
    layers,
    frames,
    requestFrame,
    cancelFrame,
    addScrollListener,
    removeScrollListener,
    getScrollY: () => scrollY,
    setScrollY: (nextScroll: number) => {
      scrollY = nextScroll;
    },
    fireScroll: () => scrollListener?.(),
  };
}

describe("landing scroll motion", () => {
  it.each([0, 560, 1_120])(
    "keeps the existing transform formulas and order at scrollY=%s",
    (scroll) => {
      expect(getLandingLayerTransforms(scroll)).toEqual({
        mesh: `translate3d(0, ${scroll * 0.035}px, 0)`,
        map: `translate3d(${Math.sin(scroll / 560) * 12}px, ${scroll * -0.055}px, 0)`,
        foreground: `translate3d(0, ${scroll * -0.11}px, 0)`,
      });
    },
  );

  it("updates only the three layer transforms directly", () => {
    const harness = createMotionHarness(560);

    const dispose = startLandingScrollMotion({
      ...harness,
      reducedMotion: false,
    });

    expect(harness.layers.mesh.style.transform).toBe(
      "translate3d(0, 19.6px, 0)",
    );
    expect(harness.layers.map.style.transform).toBe(
      `translate3d(${Math.sin(1) * 12}px, -30.8px, 0)`,
    );
    expect(harness.layers.foreground.style.transform).toBe(
      "translate3d(0, -61.6px, 0)",
    );
    expect(harness.requestFrame).not.toHaveBeenCalled();

    dispose();
  });

  it("handles layer refs that are still null", () => {
    expect(() =>
      applyLandingLayerTransforms(
        { mesh: null, map: null, foreground: null },
        560,
      ),
    ).not.toThrow();
  });

  it("keeps at most one animation frame pending across scroll events", () => {
    const harness = createMotionHarness();
    const dispose = startLandingScrollMotion({
      ...harness,
      reducedMotion: false,
    });

    harness.setScrollY(1_120);
    harness.fireScroll();
    harness.fireScroll();
    harness.fireScroll();

    expect(harness.requestFrame).toHaveBeenCalledOnce();
    expect(harness.frames.size).toBe(1);

    const [[frame, callback]] = [...harness.frames.entries()];
    harness.frames.delete(frame);
    callback(0);

    expect(harness.layers.mesh.style.transform).toBe(
      "translate3d(0, 39.2px, 0)",
    );

    harness.fireScroll();
    expect(harness.requestFrame).toHaveBeenCalledTimes(2);
    dispose();
  });

  it("removes the listener, cancels a pending frame, and blocks late updates", () => {
    const harness = createMotionHarness();
    const dispose = startLandingScrollMotion({
      ...harness,
      reducedMotion: false,
    });

    harness.setScrollY(560);
    harness.fireScroll();
    const [[frame, callback]] = [...harness.frames.entries()];
    const transformBeforeCleanup = harness.layers.mesh.style.transform;

    dispose();

    expect(harness.removeScrollListener).toHaveBeenCalledOnce();
    expect(harness.cancelFrame).toHaveBeenCalledWith(frame);
    expect(harness.frames.size).toBe(0);

    callback(0);
    expect(harness.layers.mesh.style.transform).toBe(transformBeforeCleanup);
    harness.fireScroll();
    expect(harness.requestFrame).toHaveBeenCalledOnce();
  });

  it("does not initialize parallax, listeners, or frames for reduced motion", () => {
    const harness = createMotionHarness(560);

    const dispose = startLandingScrollMotion({
      ...harness,
      reducedMotion: true,
    });

    expect(harness.layers.mesh.style.transform).toBe("");
    expect(harness.layers.map.style.transform).toBe("");
    expect(harness.layers.foreground.style.transform).toBe("");
    expect(harness.addScrollListener).not.toHaveBeenCalled();
    expect(harness.requestFrame).not.toHaveBeenCalled();

    dispose();
    expect(harness.removeScrollListener).not.toHaveBeenCalled();
    expect(harness.cancelFrame).not.toHaveBeenCalled();
  });

  it("removes the inherited root scroll variables and keeps passive listening", () => {
    const contentSource = readFileSync(
      new URL(
        "../app/components/landing/LandingPageContent.tsx",
        import.meta.url,
      ),
      "utf8",
    );
    const stylesSource = readFileSync(
      new URL("../app/globals.css", import.meta.url),
      "utf8",
    );
    const legacyVariables = [
      "--night-slow-y",
      "--night-map-x",
      "--night-map-y",
      "--night-fast-y",
    ];

    for (const variable of legacyVariables) {
      expect(contentSource).not.toContain(variable);
      expect(stylesSource).not.toContain(variable);
    }

    expect(contentSource).not.toContain("style.setProperty");
    expect(contentSource).toContain('{ passive: true }');
  });
});
