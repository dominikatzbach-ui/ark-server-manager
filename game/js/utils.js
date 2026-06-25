// Shared math & geometry helpers used across all modules.
const Utils = (() => {
  /** Axis-Aligned Bounding Box collision */
  function aabb(a, b) {
    return (
      a.x < b.x + b.w &&
      a.x + a.w > b.x &&
      a.y < b.y + b.h &&
      a.y + a.h > b.y
    );
  }

  /** Circle vs circle collision */
  function circleCollide(ax, ay, ar, bx, by, br) {
    const dx = ax - bx;
    const dy = ay - by;
    return dx * dx + dy * dy < (ar + br) * (ar + br);
  }

  /** Linear interpolation */
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  /** Clamp n between lo and hi */
  function clamp(n, lo, hi) {
    return Math.max(lo, Math.min(hi, n));
  }

  /** Random float in [min, max) */
  function randFloat(min, max) {
    return min + Math.random() * (max - min);
  }

  /** Random integer in [min, max] */
  function randInt(min, max) {
    return Math.floor(randFloat(min, max + 1));
  }

  /** Point on a quadratic Bézier curve at t ∈ [0,1] */
  function bezierPoint(p0, p1, p2, t) {
    const mt = 1 - t;
    return {
      x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
      y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y,
    };
  }

  /** Angle (radians) from point a to point b */
  function angleTo(ax, ay, bx, by) {
    return Math.atan2(by - ay, bx - ax);
  }

  /** Distance between two points */
  function dist(ax, ay, bx, by) {
    const dx = ax - bx;
    const dy = ay - by;
    return Math.sqrt(dx * dx + dy * dy);
  }

  return { aabb, circleCollide, lerp, clamp, randFloat, randInt, bezierPoint, angleTo, dist };
})();
