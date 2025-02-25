import type p5 from "p5";

/**
 * Determines if a point is inside a rectangle.
 */
export function pointInRect(
	point: p5.Vector,
	rectPos: p5.Vector,
	rectWidth: number,
	rectHeight: number
): boolean {
	return (
		point.x >= rectPos.x &&
		point.x <= rectPos.x + rectWidth &&
		point.y >= rectPos.y &&
		point.y <= rectPos.y + rectHeight
	);
}

/**
 * Determines if two rectangles are colliding.
 */
export function rectsCollide(
	pos1: p5.Vector,
	width1: number,
	height1: number,
	pos2: p5.Vector,
	width2: number,
	height2: number
): boolean {
	return (
		pos1.x < pos2.x + width2 &&
		pos1.x + width1 > pos2.x &&
		pos1.y < pos2.y + height2 &&
		pos1.y + height1 > pos2.y
	);
}
