import { constrain } from './math';

/**
 * @typedef {Object} Vector2Like
 * @property {number} x - x coordinate of the vector
 * @property {number} y - y coordinate of the vector

/**
 * Utility class mainly for dealing with coordinates.
 */
class Vector2 {
  /**
   *
   * @param {number} x defaults to 0
   * @param {number} y defaults to 0
   */
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  /**
   * @returns a vector2 with random x and y values in the range of [0,1]
   */
  static random() {
    return new Vector2(Math.random(), Math.random());
  }

  /**
   * Sets the value
   * @param {Vector2Like} newValue
   */
  set(newValue) {
    this.x = newValue.x;
    this.y = newValue.y;
  }

  clone() {
    return new Vector2(this.x, this.y);
  }

  /**
   * Adds delta to itself
   * @param {Vector2Like} delta
   * @return {Vector2} itself
   */
  add(delta) {
    this.x += delta.x;
    this.y += delta.y;
    return this;
  }

  /**
   * Scales itself by a constant
   * @param {number} k scalar multiple
   * @return {Vector2} itself
   */
  multiply(k) {
    this.x *= k;
    this.y *= k;
    return this;
  }

  /**
   * @returns vector2 magnitude
   */
  magnitude() {
    return Math.hypot(this.x, this.y);
  }

  /**
   * @returns vector2 angle
   */
  angle() {
    return Math.atan2(this.y, this.x);
  }

  /**
   * Returns the distance of two vectors if they were treated as points (magnitude of their difference)
   * @param {Vector2Like} u
   * @param {Vector2Like} v
   */
  static dist(u, v) {
    return Math.hypot(u.x - v.x, u.y - v.y);
  }

  /**
   * Applies a repulsive force (for a tick) away from a point if it is too close and an attractive
   * force to that point if it is too far
   * @param {Vector2Like} source location to be repulsed/attracted to
   * @param {number} spacing what is the goal distance from location
   * @param {number} strength how powerful is the repulsion/attraction force
   * @param {Vector2Like} u vector2 to apply to (itself by default, but you might want to accumulate impulses)
   */
  repulse(source, spacing, strength, u = this) {
    const a = Math.atan2(source.y - this.y, source.x - this.x); // + random(-0.4,0.4);
    const dist = Math.hypot(source.y - this.y, source.x - this.x);
    const d =
      constrain(Math.pow(spacing - dist, 3) / 1000000, -1, 1) * strength;
    u.x -= Math.cos(a) * d;
    u.y -= Math.sin(a) * d;
  }
}

export default Vector2;
