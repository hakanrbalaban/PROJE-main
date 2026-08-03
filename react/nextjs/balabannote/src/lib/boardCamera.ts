export type BoardCamera = {
  x: number;
  y: number;
  zoom: number;
};

export const DEFAULT_CAMERA: BoardCamera = { x: 0, y: 0, zoom: 1 };

export const MIN_ZOOM = 0.15;
export const MAX_ZOOM = 4;

export function clampZoom(z: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));
}

/** Screen (stage CSS px) → world board coordinates */
export function screenToWorld(
  cam: BoardCamera,
  sx: number,
  sy: number,
): { x: number; y: number } {
  return {
    x: (sx - cam.x) / cam.zoom,
    y: (sy - cam.y) / cam.zoom,
  };
}

/** Keep the world point under (sx,sy) fixed while changing zoom */
export function zoomAt(
  cam: BoardCamera,
  sx: number,
  sy: number,
  nextZoom: number,
): BoardCamera {
  const z = clampZoom(nextZoom);
  const world = screenToWorld(cam, sx, sy);
  return {
    zoom: z,
    x: sx - world.x * z,
    y: sy - world.y * z,
  };
}

export function panBy(cam: BoardCamera, dx: number, dy: number): BoardCamera {
  return { ...cam, x: cam.x + dx, y: cam.y + dy };
}

export function resetCamera(): BoardCamera {
  return { ...DEFAULT_CAMERA };
}
