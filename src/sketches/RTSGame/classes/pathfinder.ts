import type p5 from 'p5';

export class Pathfinder {
	baseCenter: p5.Vector;
	baseHalfWidth: number;
	baseHalfHeight: number;
	wallThickness: number;
	gateWidth: number;

	constructor(
		p: p5,
		baseCenter: p5.Vector,
		baseHalfWidth: number,
		baseHalfHeight: number,
		wallThickness: number,
		gateWidth: number
	) {
		this.baseCenter = baseCenter;
		this.baseHalfWidth = baseHalfWidth;
		this.baseHalfHeight = baseHalfHeight;
		this.wallThickness = wallThickness;
		this.gateWidth = gateWidth;
	}

	isInsideBase(pos: p5.Vector): boolean {
		return (
			pos.x > this.baseCenter.x - this.baseHalfWidth &&
			pos.x < this.baseCenter.x + this.baseHalfWidth &&
			pos.y > this.baseCenter.y - this.baseHalfHeight &&
			pos.y < this.baseCenter.y + this.baseHalfHeight
		);
	}

	getGatePosition(p: p5): p5.Vector {
		// A point just beyond the bottom wall.
		return p.createVector(
			this.baseCenter.x,
			this.baseCenter.y + this.baseHalfHeight + this.wallThickness + 5
		);
	}

	getEntryGate(p: p5): p5.Vector {
		// A point just inside the bottom wall.
		return p.createVector(
			this.baseCenter.x,
			this.baseCenter.y + this.baseHalfHeight - this.wallThickness - 5
		);
	}

	calculatePathForUnit(
		p: p5,
		unitPos: p5.Vector,
		finalTarget: p5.Vector
	): p5.Vector[] {
		// If the unit is inside but its final destination is outside, send it via the gate.
		if (this.isInsideBase(unitPos) && !this.isInsideBase(finalTarget)) {
			return [this.getGatePosition(p), finalTarget.copy()];
		}
		// If the unit is outside and its destination is inside, route it through the entry gate.
		if (!this.isInsideBase(unitPos) && this.isInsideBase(finalTarget)) {
			return [this.getEntryGate(p), finalTarget.copy()];
		}
		// Otherwise, no extra waypoint is needed.
		return [finalTarget.copy()];
	}
}
