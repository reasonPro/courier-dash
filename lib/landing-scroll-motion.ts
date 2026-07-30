type LandingTransformTarget = {
  style: {
    transform: string;
  };
};

export type LandingScrollLayers = {
  mesh: LandingTransformTarget | null;
  map: LandingTransformTarget | null;
  foreground: LandingTransformTarget | null;
};

type LandingScrollMotionOptions = {
  layers: LandingScrollLayers;
  reducedMotion: boolean;
  getScrollY: () => number;
  requestFrame: (callback: FrameRequestCallback) => number;
  cancelFrame: (frame: number) => void;
  addScrollListener: (listener: () => void) => void;
  removeScrollListener: (listener: () => void) => void;
};

export function getLandingLayerTransforms(scroll: number) {
  return {
    mesh: `translate3d(0, ${scroll * 0.035}px, 0)`,
    map: `translate3d(${Math.sin(scroll / 560) * 12}px, ${scroll * -0.055}px, 0)`,
    foreground: `translate3d(0, ${scroll * -0.11}px, 0)`,
  };
}

export function applyLandingLayerTransforms(
  layers: LandingScrollLayers,
  scroll: number,
) {
  const transforms = getLandingLayerTransforms(scroll);

  if (layers.mesh) layers.mesh.style.transform = transforms.mesh;
  if (layers.map) layers.map.style.transform = transforms.map;
  if (layers.foreground) {
    layers.foreground.style.transform = transforms.foreground;
  }
}

export function startLandingScrollMotion({
  layers,
  reducedMotion,
  getScrollY,
  requestFrame,
  cancelFrame,
  addScrollListener,
  removeScrollListener,
}: LandingScrollMotionOptions): () => void {
  if (reducedMotion) return () => undefined;

  let isActive = true;
  let frame = 0;

  const updateLayers = () => {
    if (!isActive) {
      frame = 0;
      return;
    }

    applyLandingLayerTransforms(layers, getScrollY());
    frame = 0;
  };

  const onScroll = () => {
    if (!frame) frame = requestFrame(updateLayers);
  };

  updateLayers();
  addScrollListener(onScroll);

  return () => {
    isActive = false;
    removeScrollListener(onScroll);
    cancelFrame(frame);
  };
}
