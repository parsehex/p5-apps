import type p5 from 'p5';
import p5Obj from 'p5';
import { WallSegment } from './Base';
import PF from 'pathfinding';

export class Pathfinder {
	baseCenter: p5.Vector;
	baseHalfWidth: number;
	baseHalfHeight: number;
	wallThickness: number;
	gateWidth: number;
	grid: PF.Grid;
	finder: PF.AStarFinder;
	gridSize: number;
	gridWidth: number;
	gridHeight: number;

	constructor(
		p: p5,
		baseCenter: p5.Vector,
		baseHalfWidth: number,
		baseHalfHeight: number,
		wallThickness: number,
		gateWidth: number,
		gridSize: number = 10 // Size of each grid cell in pixels
	) {
		this.baseCenter = baseCenter;
		this.baseHalfWidth = baseHalfWidth;
		this.baseHalfHeight = baseHalfHeight;
		this.wallThickness = wallThickness;
		this.gateWidth = gateWidth;
		this.gridSize = gridSize;

		// Calculate grid dimensions based on canvas size
		this.gridWidth = Math.ceil(p.width / gridSize);
		this.gridHeight = Math.ceil(p.height / gridSize);

		// Initialize the grid
		this.grid = new PF.Grid(this.gridWidth, this.gridHeight);

		// Initialize the pathfinder
		this.finder = new PF.AStarFinder({
			// diagonalMovement: true,
			// allowDiagonal: true,
			// dontCrossCorners: true,
			// heuristic: PF.Heuristic.manhattan,
		});

		// Mark walls as obstacles in the grid
		this.markWallsOnGrid(p);
	}

	getGatePosition(p: p5): p5.Vector {
		// A point just beyond the bottom wall.
		return p.createVector(
			this.baseCenter.x,
			this.baseCenter.y + this.baseHalfHeight + this.wallThickness + 5
		);
	}

	// Convert pixel coordinates to grid coordinates
	private pixelToGrid(pos: p5.Vector): { x: number; y: number } {
		return {
			x: Math.floor(pos.x / this.gridSize),
			y: Math.floor(pos.y / this.gridSize),
		};
	}

	// Convert grid coordinates to pixel coordinates
	private gridToPixel(gridX: number, gridY: number): p5.Vector {
		// return {
		// 	x: (gridX + 0.5) * this.gridSize,
		// 	y: (gridY + 0.5) * this.gridSize,
		// } as p5.Vector;
		return new p5Obj.Vector(
			(gridX + 0.5) * this.gridSize,
			(gridY + 0.5) * this.gridSize
		);
	}

	// Mark wall segments as obstacles on the grid
	private markWallsOnGrid(_p: p5) {
		// Create walls based on the base dimensions
		const walls: WallSegment[] = [];
		const cx = this.baseCenter.x;
		const cy = this.baseCenter.y;
		const bw = this.baseHalfWidth;
		const bh = this.baseHalfHeight;
		const wt = this.wallThickness;
		const gw = this.gateWidth;

		// Top wall
		walls.push({ x: cx - bw, y: cy - bh, w: bw * 2, h: wt });
		// Left wall
		walls.push({ x: cx - bw, y: cy - bh, w: wt, h: bh * 2 });
		// Right wall
		walls.push({ x: cx + bw - wt, y: cy - bh, w: wt, h: bh * 2 });
		// Bottom wall segments
		const leftSegmentWidth = bw - gw / 2;
		walls.push({ x: cx - bw, y: cy + bh - wt, w: leftSegmentWidth, h: wt });
		walls.push({
			x: cx + gw / 2,
			y: cy + bh - wt,
			w: bw - gw / 2,
			h: wt,
		});

		// Mark each wall segment as unwalkable in the grid
		for (const wall of walls) {
			const startX = Math.floor(wall.x / this.gridSize);
			const startY = Math.floor(wall.y / this.gridSize);
			const endX = Math.ceil((wall.x + wall.w) / this.gridSize);
			const endY = Math.ceil((wall.y + wall.h) / this.gridSize);

			for (let x = startX; x < endX; x++) {
				for (let y = startY; y < endY; y++) {
					// Ensure we're within grid bounds
					if (x >= 0 && y >= 0 && x < this.gridWidth && y < this.gridHeight) {
						this.grid.setWalkableAt(x, y, false);
					}
				}
			}
		}
	}

	isInsideBase(pos: p5.Vector): boolean {
		return (
			pos.x > this.baseCenter.x - this.baseHalfWidth &&
			pos.x < this.baseCenter.x + this.baseHalfWidth &&
			pos.y > this.baseCenter.y - this.baseHalfHeight &&
			pos.y < this.baseCenter.y + this.baseHalfHeight
		);
	}

	// Find a path between two points using A* algorithm
	calculatePathForUnit(
		p: p5,
		unitPos: p5.Vector,
		finalTarget: p5.Vector
	): p5.Vector[] {
		// Convert positions to grid coordinates
		const startGrid = this.pixelToGrid(unitPos);
		const endGrid = this.pixelToGrid(finalTarget);

		// Ensure start and end are within grid bounds
		if (
			startGrid.x < 0 ||
			startGrid.x >= this.gridWidth ||
			startGrid.y < 0 ||
			startGrid.y >= this.gridHeight ||
			endGrid.x < 0 ||
			endGrid.x >= this.gridWidth ||
			endGrid.y < 0 ||
			endGrid.y >= this.gridHeight
		) {
			// Return direct path if out of bounds
			return [finalTarget.copy()];
		}

		// Check if start or end is a wall
		const gridClone = this.grid.clone();
		gridClone.setWalkableAt(startGrid.x, startGrid.y, true);
		gridClone.setWalkableAt(endGrid.x, endGrid.y, true);

		// Find path using A*
		const gridPath = this.finder.findPath(
			startGrid.x,
			startGrid.y,
			endGrid.x,
			endGrid.y,
			gridClone
		);

		// If no path found, try to return a simplified alternative
		if (!gridPath || gridPath.length === 0) {
			if (this.isInsideBase(unitPos) && !this.isInsideBase(finalTarget)) {
				// Inside to outside: go through gate
				const gatePos = p.createVector(
					this.baseCenter.x,
					this.baseCenter.y + this.baseHalfHeight + 5
				);
				return [gatePos, finalTarget.copy()];
			} else if (
				!this.isInsideBase(unitPos) &&
				this.isInsideBase(finalTarget)
			) {
				// Outside to inside: go through gate
				const entryGate = p.createVector(
					this.baseCenter.x,
					this.baseCenter.y + this.baseHalfHeight - this.wallThickness - 5
				);
				return [entryGate, finalTarget.copy()];
			}
			return [finalTarget.copy()];
		}

		// Convert grid path to pixel coordinates
		const pixelPath = gridPath.map((point) =>
			this.gridToPixel(point[0], point[1])
		);

		// Simplify the path (remove unnecessary waypoints)
		return this.simplifyPath(p, pixelPath);
	}

	// Simplify the path by removing unnecessary waypoints
	private simplifyPath(p: p5, path: p5.Vector[]): p5.Vector[] {
		if (path.length <= 2) return path;

		const simplified: p5.Vector[] = [path[0]];
		let currentIndex = 0;

		while (currentIndex < path.length - 1) {
			let furthestVisible = currentIndex + 1;

			// Find the furthest point that can be directly reached
			for (let i = currentIndex + 2; i < path.length; i++) {
				if (this.canDirectlyTravel(p, path[currentIndex], path[i])) {
					furthestVisible = i;
				}
			}

			simplified.push(path[furthestVisible]);
			currentIndex = furthestVisible;
		}

		return simplified;
	}

	// Check if there's a clear line of sight between two points
	private canDirectlyTravel(p: p5, from: p5.Vector, to: p5.Vector): boolean {
		// Sample points along the line
		const distance = p5Obj.Vector.dist(from, to);
		const steps = Math.ceil(distance / (this.gridSize / 2));

		for (let i = 1; i < steps; i++) {
			const t = i / steps;
			const x = from.x + t * (to.x - from.x);
			const y = from.y + t * (to.y - from.y);

			const gridPos = this.pixelToGrid(p.createVector(x, y));

			// Check if this point is walkable
			if (!this.grid.isWalkableAt(gridPos.x, gridPos.y)) {
				return false;
			}
		}

		return true;
	}

	// Visualize the grid and path (useful for debugging)
	visualizeGrid(p: p5, path?: p5.Vector[]) {
		// Draw grid cells
		p.push();
		p.noFill();
		p.stroke(50, 50);

		for (let x = 0; x < this.gridWidth; x++) {
			for (let y = 0; y < this.gridHeight; y++) {
				const pixelX = x * this.gridSize;
				const pixelY = y * this.gridSize;

				if (!this.grid.isWalkableAt(x, y)) {
					p.fill(100, 100);
					p.rect(pixelX, pixelY, this.gridSize, this.gridSize);
				} else {
					p.noFill();
					p.rect(pixelX, pixelY, this.gridSize, this.gridSize);
				}
			}
		}

		// Draw path if provided
		if (path && path.length > 0) {
			p.stroke(0, 0, 255);
			p.strokeWeight(2);

			for (let i = 0; i < path.length - 1; i++) {
				p.line(path[i].x, path[i].y, path[i + 1].x, path[i + 1].y);
			}

			// Draw waypoints
			p.noStroke();
			p.fill(0, 0, 255);
			for (let i = 0; i < path.length; i++) {
				p.ellipse(path[i].x, path[i].y, 8, 8);
			}
		}

		p.pop();
	}
}
