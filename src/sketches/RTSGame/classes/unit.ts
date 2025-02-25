import type p5 from "p5";
import p5Obj from "p5";

/**
 * A Unit represents a mobile actor in our RTS game.
 * Player units (blue) and enemy units (red) will move, have health, and fight one another.
 */
export class Unit {
	position: p5.Vector;
	target: p5.Vector | null;
	speed: number;
	health: number;
	team: "player" | "enemy";
	radius: number;

	constructor(p: p5, x: number, y: number, team: "player" | "enemy") {
		this.position = p.createVector(x, y);
		this.target = null;
		// Give player units a slightly higher speed than enemy units
		this.speed = team === "player" ? 2 : 1.5;
		this.health = 100;
		this.team = team;
		this.radius = 10;
	}

	/**
	 * Sets a new destination (target) for the unit.
	 */
	setTarget(target: p5.Vector) {
		this.target = target.copy();
	}

	/**
	 * Moves this unit toward its target if defined.
	 * For enemy units, if there is no target the unit will pick a random destination.
	 */
	update(p: p5) {
		if (this.target) {
			let direction = p5Obj.Vector.sub(this.target, this.position);
			let distance = direction.mag();
			if (distance < this.speed) {
				// Snap to target and clear it.
				this.position = this.target.copy();
				this.target = null;
			} else {
				direction.normalize().mult(this.speed);
				this.position.add(direction);
			}
		}

		// Enemy units wander: if no target is set, pick a new one.
		if (this.team === "enemy" && !this.target) {
			// Constrain enemy movement primarily to the upper half of the canvas.
			this.target = p.createVector(p.random(p.width), p.random(p.height / 2));
		}
	}

	/**
	 * Renders the unit as a circle with a simple health bar above.
	 */
	display(p: p5) {
		p.push();
		// Draw the unit.
		p.noStroke();
		if (this.team === "player") {
			p.fill(0, 0, 255); // Blue for player units
		} else {
			p.fill(255, 0, 0); // Red for enemy units
		}
		p.ellipse(this.position.x, this.position.y, this.radius * 2);

		// Draw a health bar above the unit.
		let barWidth = this.radius * 2;
		let barHeight = 4;
		let healthPercentage = this.health / 100;
		p.fill(0, 255, 0);
		p.rect(
			this.position.x - this.radius,
			this.position.y - this.radius - 10,
			barWidth * healthPercentage,
			barHeight
		);
		p.stroke(0);
		p.noFill();
		p.rect(
			this.position.x - this.radius,
			this.position.y - this.radius - 10,
			barWidth,
			barHeight
		);
		p.pop();
	}
}
