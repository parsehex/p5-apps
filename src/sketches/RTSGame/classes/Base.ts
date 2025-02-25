import type p5 from 'p5';

export interface WallSegment {
	x: number;
	y: number;
	w: number;
	h: number;
}

export class Base {
	center: p5.Vector;
	halfWidth: number;
	halfHeight: number;
	wallThickness: number;
	gateWidth: number;
	walls: WallSegment[];

	constructor(
		p: p5,
		center?: p5.Vector,
		halfWidth: number = 100,
		halfHeight: number = 75,
		wallThickness: number = 10,
		gateWidth: number = 40
	) {
		// Center defaults to the canvas center.
		this.center = center ? center : p.createVector(p.width / 2, p.height / 2);
		this.halfWidth = halfWidth;
		this.halfHeight = halfHeight;
		this.wallThickness = wallThickness;
		this.gateWidth = gateWidth;
		this.walls = this.createWalls(p);
	}

	private createWalls(p: p5): WallSegment[] {
		const walls: WallSegment[] = [];
		const cx = this.center.x;
		const cy = this.center.y;
		const bw = this.halfWidth;
		const bh = this.halfHeight;
		const wt = this.wallThickness;
		const gw = this.gateWidth;

		// Top wall: spans the full width.
		walls.push({ x: cx - bw, y: cy - bh, w: bw * 2, h: wt });

		// Left wall: spans the full height.
		walls.push({ x: cx - bw, y: cy - bh, w: wt, h: bh * 2 });

		// Right wall: spans the full height.
		walls.push({ x: cx + bw - wt, y: cy - bh, w: wt, h: bh * 2 });

		// Bottom wall: split into two segments, leaving a gap (gate) in the center.
		const leftSegmentWidth = bw - gw / 2;
		const rightSegmentWidth = bw - gw / 2;
		walls.push({ x: cx - bw, y: cy + bh - wt, w: leftSegmentWidth, h: wt });
		walls.push({
			x: cx + gw / 2,
			y: cy + bh - wt,
			w: rightSegmentWidth,
			h: wt,
		});

		return walls;
	}
}
