import { Rect } from './types';

export function rectsOverlap(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

// Returns the minimum translation vector to push `mover` out of `solid`.
// Returns null if no overlap.
export function resolveOverlap(
  mover: Rect,
  solid: Rect
): { dx: number; dy: number } | null {
  if (!rectsOverlap(mover, solid)) return null;

  const overlapX =
    Math.min(mover.x + mover.w, solid.x + solid.w) -
    Math.max(mover.x, solid.x);
  const overlapY =
    Math.min(mover.y + mover.h, solid.y + solid.h) -
    Math.max(mover.y, solid.y);

  // Push along the axis of least penetration
  if (overlapX <= overlapY) {
    const dx =
      mover.x + mover.w / 2 < solid.x + solid.w / 2 ? -overlapX : overlapX;
    return { dx, dy: 0 };
  } else {
    const dy =
      mover.y + mover.h / 2 < solid.y + solid.h / 2 ? -overlapY : overlapY;
    return { dx: 0, dy };
  }
}
