/**
 * Returns a random integer between min and max, inclusive.
 * This can be a more convenient version over p.random, especially for array indexing.
 *
 * @param {number} min - The minimum integer.
 * @param {number} max - The maximum integer.
 * @returns {number} - A random integer between min and max.
 */
export function randomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Linearly interpolates between two numbers based on the amount.
 * Note: P5 provides a lerp() function, but this may be useful for non-p5 contexts.
 *
 * @param {number} start - The start value.
 * @param {number} stop - The stop value.
 * @param {number} amt - The amount between 0.0 and 1.0.
 * @returns {number} - The interpolated value.
 */
export function lerpValue(start: number, stop: number, amt: number): number {
	return start + (stop - start) * amt;
}

/**
 * Clamps a given number between a minimum and maximum value.
 *
 * @param {number} num - The number to clamp.
 * @param {number} min - The minimum value.
 * @param {number} max - The maximum value.
 * @returns {number} - The clamped number.
 */
export function clamp(num: number, min: number, max: number): number {
	return Math.max(min, Math.min(num, max));
}
