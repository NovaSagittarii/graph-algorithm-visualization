/**
 * Constrains x between min and max
 * @param {number} x
 * @param {number} min
 * @param {number} max
 */
export function constrain(x, min, max) {
  return Math.min(Math.max(x, min), max);
}
