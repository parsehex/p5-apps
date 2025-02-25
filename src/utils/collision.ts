import type p5 from "p5";
import p5Obj from "p5";

/**
 * Determines if two circular objects are colliding.
 * Useful for detecting interactions between actors like units or particles.
 *
 * @param {p5.Vector} pos1 - The position of the first circle.
 * @param {number} radius1 - The radius of the first circle.
 * @param {p5.Vector} pos2 - The position of the second circle.
 * @param {number} radius2 - The radius of the second circle.
 * @returns {boolean} - True if the circles are colliding.
 */
export function circlesCollide(
	pos1: p5.Vector,
	radius1: number,
	pos2: p5.Vector,
	radius2: number
): boolean {
	const d = pos1.dist(pos2);
	return d < (radius1 + radius2);
}

/**
 * Determines if a point is inside a circle.
 *
 * @param {p5.Vector} point - The point to check.
 * @param {p5.Vector} circlePos - The position of the circle.
 * @param {number} radius - The radius of the circle.
 * @returns {boolean} - True if the point is inside the circle.
 */
export function pointInCircle(
	point: p5.Vector,
	circlePos: p5.Vector,
	radius: number
): boolean {
	return point.dist(circlePos) < radius;
}

/**
 * Determines if a point is inside a rectangle.
 *
 * @param {p5.Vector} point - The point to check.
 * @param {p5.Vector} rectPos - The top-left position of the rectangle.
 * @param {number} rectWidth - The width of the rectangle.
 * @param {number} rectHeight - The height of the rectangle.
 * @returns {boolean} - True if the point is inside the rectangle.
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
 *
 * @param {p5.Vector} pos1 - The top-left position of the first rectangle.
 * @param {number} width1 - The width of the first rectangle.
 * @param {number} height1 - The height of the first rectangle.
 * @param {p5.Vector} pos2 - The top-left position of the second rectangle.
 * @param {number} width2 - The width of the second rectangle.
 * @param {number} height2 - The height of the second rectangle.
 * @returns {boolean} - True if the rectangles are colliding.
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

/**
 * Determines if a line segment intersects with a circle.
 *
 * @param {p5.Vector} p1 - Start point of the line.
 * @param {p5.Vector} p2 - End point of the line.
 * @param {p5.Vector} circlePos - Center of the circle.
 * @param {number} radius - Radius of the circle.
 * @returns {boolean} - True if the line intersects the circle.
 */
export function lineIntersectsCircle(
	p1: p5.Vector,
	p2: p5.Vector,
	circlePos: p5.Vector,
	radius: number
): boolean {
	const d = p5Obj.Vector.sub(p2, p1);
	const f = p5Obj.Vector.sub(p1, circlePos);

	const a = d.dot(d);
	const b = 2 * f.dot(d);
	const c = f.dot(f) - radius * radius;

	let discriminant = b * b - 4 * a * c;
	if (discriminant < 0) {
		return false; // No intersection
	}

	discriminant = Math.sqrt(discriminant);
	const t1 = (-b - discriminant) / (2 * a);
	const t2 = (-b + discriminant) / (2 * a);

	return t1 >= 0 && t1 <= 1 || t2 >= 0 && t2 <= 1;
}

/**
 * Resolves overlapping between circular objects by pushing them apart.
 * Each object is displaced by half the overlap amount along the line connecting them.
 *
 * @param p - The p5 instance.
 * @param objects - An array of objects with a position (p5.Vector) and a radius.
 */
export function resolveCircleCollisions(
	p: p5,
	objects: { position: p5.Vector; radius: number }[]
): void {
	for (let i = 0; i < objects.length; i++) {
		for (let j = i + 1; j < objects.length; j++) {
			if (
				circlesCollide(
					objects[i].position,
					objects[i].radius,
					objects[j].position,
					objects[j].radius
				)
			) {
				let d = objects[i].position.dist(objects[j].position);
				if (d === 0) {
					// Avoid division by zero by nudging one object randomly.
					objects[i].position.x += p.random(-1, 1);
					objects[i].position.y += p.random(-1, 1);
					d = objects[i].position.dist(objects[j].position);
				}
				// Determine how far they overlap.
				const overlap = objects[i].radius + objects[j].radius - d;
				// Calculate the normalized vector from object[j] to object[i].
				const displacement = p5Obj.Vector.sub(
					objects[i].position,
					objects[j].position
				)
					.normalize()
					.mult(overlap / 2);
				// Push each object away by half the overlap.
				objects[i].position.add(displacement);
				objects[j].position.sub(displacement);
			}
		}
	}
}
