import type p5 from 'p5';
import p5Obj from 'p5';
import { Unit } from './unit';
import { resolveCircleCollisions } from '../../../utils/collisions';
import { Pathfinder } from './pathfinder';

// --- Helper types for the base walls and lasers:
interface Laser {
	start: p5.Vector;
	end: p5.Vector;
	timer: number;
}

interface Rect {
	x: number;
	y: number;
	w: number;
	h: number;
}

export class RTSGame {
	private pathfinder: Pathfinder;

	// Unit groups
	playerUnitGroups: Unit[][];
	enemyUnits: Unit[];
	activeGroup: number | null;
	enemyWave: number;
	lasers: Laser[];

	// Laser settings
	private readonly laserRange = 150;
	private readonly laserDamage = 10;
	private readonly laserCooldownTime = 60; // frames

	// Base (hollow structure) settings:
	protected baseCenter: p5.Vector;
	protected baseHalfWidth: number;
	protected baseHalfHeight: number;
	protected wallThickness: number;
	protected gateWidth: number;
	// An array of wall segments making up the base.
	private baseWalls: Rect[];

	constructor(p: p5) {
		this.activeGroup = null;
		this.playerUnitGroups = [];
		this.lasers = [];

		// --- Define the base structure parameters ---
		// Center the base in the middle of the canvas.
		this.baseCenter = p.createVector(p.width / 2, p.height / 2);
		// Set half-dimensions (so full size is twice these values).
		this.baseHalfWidth = 100;
		this.baseHalfHeight = 75;
		this.wallThickness = 10;
		this.gateWidth = 40; // The gap in the bottom wall.
		this.baseWalls = this.createBaseWalls();

		this.pathfinder = new Pathfinder(
			p,
			this.baseCenter,
			this.baseHalfWidth,
			this.baseHalfHeight,
			this.wallThickness,
			this.gateWidth
		);

		// --- Spawn player units inside the base interior ---
		const group1: Unit[] = [];
		const group2: Unit[] = [];
		const totalPlayerUnits = 5;
		// Define a margin inset from the walls so player units spawn comfortably inside.
		const spawnMargin = 20;
		const minX = this.baseCenter.x - this.baseHalfWidth + spawnMargin;
		const maxX = this.baseCenter.x + this.baseHalfWidth - spawnMargin;
		const minY = this.baseCenter.y - this.baseHalfHeight + spawnMargin;
		const maxY = this.baseCenter.y + this.baseHalfHeight - spawnMargin;
		for (let i = 0; i < totalPlayerUnits; i++) {
			// Randomly position the player unit inside the base's interior.
			const x = p.random(minX, maxX);
			const y = p.random(minY, maxY);
			const unit = new Unit(p, x, y, 'player');
			// Split into two groups.
			if (i < Math.ceil(totalPlayerUnits / 2)) {
				group1.push(unit);
			} else {
				group2.push(unit);
			}
		}
		this.playerUnitGroups.push(group1, group2);

		// --- Initialize enemy units ---
		this.enemyWave = 1;
		this.enemyUnits = [];
		this.spawnEnemyWave(p);
	}

	/**
	 * Creates an array of wall segments that form a hollow base.
	 * The base has four walls; the bottom wall has a gap (gate).
	 */
	private createBaseWalls(): Rect[] {
		const walls: Rect[] = [];
		const cx = this.baseCenter.x;
		const cy = this.baseCenter.y;
		const bw = this.baseHalfWidth;
		const bh = this.baseHalfHeight;
		const wt = this.wallThickness;
		const gw = this.gateWidth;

		// Top wall: spans full width.
		walls.push({ x: cx - bw, y: cy - bh, w: bw * 2, h: wt });

		// Left wall: spans full height.
		walls.push({ x: cx - bw, y: cy - bh, w: wt, h: bh * 2 });

		// Right wall: spans full height.
		walls.push({ x: cx + bw - wt, y: cy - bh, w: wt, h: bh * 2 });

		// Bottom wall: split into two segments (left and right) to leave a gate in the center.
		const leftSegmentWidth = bw - gw / 2;
		const rightSegmentWidth = bw - gw / 2;
		// Left bottom segment.
		walls.push({ x: cx - bw, y: cy + bh - wt, w: leftSegmentWidth, h: wt });
		// Right bottom segment.
		walls.push({
			x: cx + gw / 2,
			y: cy + bh - wt,
			w: rightSegmentWidth,
			h: wt,
		});

		return walls;
	}

	/**
	 * Spawns a new enemy wave.
	 * Enemies are spawned in the upper part of the canvas.
	 */
	spawnEnemyWave(p: p5) {
		const enemyCount = 4 + this.enemyWave;
		for (let i = 0; i < enemyCount; i++) {
			let x = p.width / 2 + p.random(-100, 100);
			let y = 50 + p.random(0, 50);
			this.enemyUnits.push(new Unit(p, x, y, 'enemy'));
		}
	}

	/**
	 * Updates the game state:
	 * - Moves units,
	 * - Checks collisions (including wall collisions),
	 * - Processes laser firing (blocked by base walls),
	 * - Handles melee, and enemy wave spawning.
	 */
	update(p: p5) {
		// (1) Update units.
		this.playerUnitGroups.forEach((group) => {
			group.forEach((unit) => unit.update(p));
		});
		this.enemyUnits.forEach((unit) => unit.update(p));

		// (2) Resolve unit collisions.
		const allUnits = this.playerUnitGroups.flat().concat(this.enemyUnits);
		resolveCircleCollisions(p, allUnits);

		// (3) --- LASER SHOOTING ---
		// For every player unit with a ready cooldown, check for an enemy within range.
		this.playerUnitGroups.flat().forEach((unit) => {
			if (unit.laserCooldown <= 0) {
				for (let enemy of this.enemyUnits) {
					const d = p.dist(
						unit.position.x,
						unit.position.y,
						enemy.position.x,
						enemy.position.y
					);
					if (d < this.laserRange) {
						// Before “firing” the laser, ensure there is no wall blocking the line.
						if (this.isLaserBlocked(p, unit.position, enemy.position)) {
							continue; // Skip this enemy if the laser path is blocked.
						}
						// Damage enemy and show laser beam.
						enemy.health -= this.laserDamage;
						this.lasers.push({
							start: unit.position.copy(),
							end: enemy.position.copy(),
							timer: 10,
						});
						unit.laserCooldown = this.laserCooldownTime;
						break; // Only fire at one enemy per update.
					}
				}
			}
		});

		// (4) Decrement laser timers.
		this.lasers = this.lasers.filter((laser) => {
			laser.timer--;
			return laser.timer > 0;
		});

		// (5) --- BASE WALL COLLISIONS ---
		// For each unit check against each wall segment.
		allUnits.forEach((unit) => {
			this.baseWalls.forEach((wall) => {
				// Compute the closest point on the wall rectangle to the unit’s center.
				const closestX = p.constrain(unit.position.x, wall.x, wall.x + wall.w);
				const closestY = p.constrain(unit.position.y, wall.y, wall.y + wall.h);
				const d = p.dist(unit.position.x, unit.position.y, closestX, closestY);
				if (d < unit.radius) {
					const overlap = unit.radius - d;
					let dir = p.createVector(
						unit.position.x - closestX,
						unit.position.y - closestY
					);
					if (dir.mag() === 0) {
						dir = p.createVector(1, 0);
					}
					dir.normalize().mult(overlap);
					unit.position.add(dir);
				}
			});
		});

		// (6) --- MELEE DAMAGE WHEN UNITS ARE VERY CLOSE ---
		const attackRange = 20;
		const meleeDamage = 0.5;
		this.playerUnitGroups.flat().forEach((playerUnit) => {
			this.enemyUnits.forEach((enemyUnit) => {
				const d = p.dist(
					playerUnit.position.x,
					playerUnit.position.y,
					enemyUnit.position.x,
					enemyUnit.position.y
				);
				if (d < attackRange) {
					playerUnit.health -= meleeDamage;
					enemyUnit.health -= meleeDamage;
				}
			});
		});

		// (7) Remove dead units.
		this.playerUnitGroups = this.playerUnitGroups.map((group) =>
			group.filter((unit) => unit.health > 0)
		);
		this.enemyUnits = this.enemyUnits.filter((unit) => unit.health > 0);

		// (8) If all enemies are gone, spawn a new wave.
		if (this.enemyUnits.length === 0) {
			this.enemyWave++;
			this.spawnEnemyWave(p);
		}
	}

	// (existing code for spawnEnemyWave, update, display, etc.)

	/**
	 * Displays the game elements including the base walls, units, lasers, and UI.
	 */
	display(p: p5) {
		// Draw a grassy background.
		p.background(34, 139, 34);

		// --- Draw the base walls ---
		p.push();
		p.fill(100, 100, 100);
		this.baseWalls.forEach((wall) => {
			p.rect(wall.x, wall.y, wall.w, wall.h);
		});
		p.pop();

		// Display units.
		this.playerUnitGroups.forEach((group) => {
			group.forEach((unit) => unit.display(p));
		});
		this.enemyUnits.forEach((unit) => unit.display(p));

		// Draw laser beams.
		p.push();
		p.strokeWeight(2);
		p.stroke(255, 0, 0);
		this.lasers.forEach((laser) => {
			p.line(laser.start.x, laser.start.y, laser.end.x, laser.end.y);
		});
		p.pop();

		// Highlight active group.
		if (this.activeGroup !== null) {
			const activeUnits = this.playerUnitGroups[this.activeGroup];
			activeUnits.forEach((unit) => {
				p.push();
				p.strokeWeight(2);
				p.stroke(255, 255, 0);
				p.noFill();
				p.ellipse(unit.position.x, unit.position.y, (unit.radius + 5) * 2);
				p.pop();
			});
		}

		// Display UI info.
		p.fill(255);
		p.noStroke();
		p.textSize(12);
		p.text(
			'Press 1 or 2 to toggle unit group. Active Group: ' +
				(this.activeGroup !== null ? this.activeGroup + 1 : 'All'),
			10,
			20
		);
		p.text('Wave: ' + this.enemyWave, p.width - 80, 20);
	}

	/**
	 * Issues an order for units to move in formation (a circle around the target).
	 * If a unit is inside the base and its final order is outside,
	 * the path goes first through the gate then to the final target.
	 */
	private issueFormationOrder(p: p5, units: Unit[], target: p5.Vector) {
		const unitCount = units.length;
		if (unitCount === 0) return;
		if (unitCount === 1) {
			// For a single unit, calculate the full path using the Pathfinder.
			const path = this.pathfinder.calculatePathForUnit(
				p,
				units[0].position,
				target
			);
			units[0].setPath(path);
			return;
		}
		const formationRadius = Math.max(40, unitCount * 10);
		const angleStep = p.TWO_PI / unitCount;
		for (let i = 0; i < unitCount; i++) {
			const angle = i * angleStep;
			const offset = p
				.createVector(p.cos(angle), p.sin(angle))
				.mult(formationRadius);
			// Calculate each unit’s final position as an offset from the target.
			const unitFinalTarget = p5Obj.Vector.add(target, offset);
			const path = this.pathfinder.calculatePathForUnit(
				p,
				units[i].position,
				unitFinalTarget
			);
			units[i].setPath(path);
		}
	}

	/**
	 * On mouse press, orders units to move. If a group is active,
	 * only that group receives formation orders.
	 */
	handleMousePressed(p: p5) {
		const target = p.createVector(p.mouseX, p.mouseY);
		if (this.activeGroup !== null) {
			this.issueFormationOrder(
				p,
				this.playerUnitGroups[this.activeGroup],
				target
			);
		} else {
			this.playerUnitGroups.forEach((group) => {
				this.issueFormationOrder(p, group, target);
			});
		}
	}

	/**
	 * Toggles active player groups when key "1" or "2" is pressed.
	 */
	handleKeyPressed(p: p5) {
		if (p.key === '1') {
			this.activeGroup = this.activeGroup === 0 ? null : 0;
		} else if (p.key === '2') {
			this.activeGroup = this.activeGroup === 1 ? null : 1;
		}
	}

	// --------------------------
	// Helper Methods for Laser Blocking
	// --------------------------

	/**
	 * Checks if a line (laser from start to end) intersects any base wall.
	 */
	private isLaserBlocked(p: p5, start: p5.Vector, end: p5.Vector): boolean {
		for (let wall of this.baseWalls) {
			if (this.lineIntersectsRect(p, start, end, wall)) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Checks if a line segment from p1 to p2 intersects the given rectangle.
	 * We do this by checking if the line intersects any of the rectangle’s sides.
	 */
	private lineIntersectsRect(
		p: p5,
		p1: p5.Vector,
		p2: p5.Vector,
		rect: Rect
	): boolean {
		// First, get rectangle corners.
		const topLeft = p.createVector(rect.x, rect.y);
		const topRight = p.createVector(rect.x + rect.w, rect.y);
		const bottomLeft = p.createVector(rect.x, rect.y + rect.h);
		const bottomRight = p.createVector(rect.x + rect.w, rect.y + rect.h);

		// Check each side.
		if (
			this.lineIntersectsLine(p, p1, p2, topLeft, topRight) ||
			this.lineIntersectsLine(p, p1, p2, topRight, bottomRight) ||
			this.lineIntersectsLine(p, p1, p2, bottomRight, bottomLeft) ||
			this.lineIntersectsLine(p, p1, p2, bottomLeft, topLeft)
		) {
			return true;
		}
		return false;
	}

	/**
	 * Determines if two line segments (p1 to p2 and p3 to p4) intersect.
	 * (Uses standard line intersection math.)
	 */
	private lineIntersectsLine(
		p: p5,
		p1: p5.Vector,
		p2: p5.Vector,
		p3: p5.Vector,
		p4: p5.Vector
	): boolean {
		// Calculate the denominators.
		const denominator =
			(p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);
		// If denominator is 0, lines are parallel.
		if (denominator === 0) return false;

		const ua =
			((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) /
			denominator;
		const ub =
			((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) /
			denominator;

		return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
	}
}
