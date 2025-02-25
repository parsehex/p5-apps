import type p5 from "p5";
import p5Obj from "p5";

/**
 * Determines if two circular objects are colliding.
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
 */
export function pointInCircle(
	point: p5.Vector,
	circlePos: p5.Vector,
	radius: number
): boolean {
	return point.dist(circlePos) < radius;
}

/**
 * Determines if a line segment intersects with a circle.
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

	return (t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1);
}

/**
 * Resolves overlapping between circular objects by pushing them apart.
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
