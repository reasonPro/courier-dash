import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { LandingPreloader } from "../app/components/landing/LandingPreloader";

describe("LandingPreloader", () => {
  it("exposes localized loading status and hides the decorative spinner", () => {
    const markup = renderToStaticMarkup(
      createElement(LandingPreloader, { label: "Localized loading" }),
    );

    expect(markup).toContain('role="status"');
    expect(markup).toContain('aria-live="polite"');
    expect(markup).toContain('aria-atomic="true"');
    expect(markup).toContain("Localized loading");
    expect(markup).toContain("Courier");
    expect(markup).toContain("Dash");
    expect(markup).toContain('aria-hidden="true"');
    expect(markup).toContain("landing-preloader-spinner");
    expect(markup).not.toContain("landing-preloader-segment");
  });
});
