import type p5 from 'p5';
import p5Obj from 'p5';
import { Unit } from './unit';
import { resolveCircleCollisions } from '../../../utils/collisions';
import { Pathfinder } from './pathfinder';
import { Base } from './Base';

// Helper type for showing laser effects.
interface Laser {
	start: p5.Vector;
	end: p5.Vector;
	timer: number;
}

export class MiniBattles {
	private pathfinder: Pathfinder;
	private base: Base; // Now the base is managed by its own class

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

	constructor(p: p5) {
		this.activeGroup = null;
		this.playerUnitGroups = [];
		this.lasers = [];

		// Initialize the base.
		this.base = new Base(p);

		this.pathfinder = new Pathfinder(
			p,
			this.base.center,
			this.base.halfWidth,
			this.base.halfHeight,
			this.base.wallThickness,
			this.base.gateWidth
		);

		// --- Spawn player units inside the base interior ---
		const group1: Unit[] = [];
		const group2: Unit[] = [];
		const totalPlayerUnits = 5;
		const spawnMargin = 20;
		const minX = this.base.center.x - this.base.halfWidth + spawnMargin;
		const maxX = this.base.center.x + this.base.halfWidth - spawnMargin;
		const minY = this.base.center.y - this.base.halfHeight + spawnMargin;
		const maxY = this.base.center.y + this.base.halfHeight - spawnMargin;
		for (let i = 0; i < totalPlayerUnits; i++) {
			const x = p.random(minX, maxX);
			const y = p.random(minY, maxY);
			const unit = new Unit(p, x, y, 'player');
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

	// Main update method reorganized into clear phases.
	update(p: p5) {
		this.updateUnitPositions(p);
		this.resolveUnitCollisions(p);
		this.processLaserShooting(p);
		this.updateLaserTimers();
		this.checkBaseWallCollisions(p);
		this.processMeleeAttacks(p);
		this.removeDeadUnits();
		this.spawnWaveIfNeeded(p);
	}

	private updateUnitPositions(p: p5) {
		this.playerUnitGroups.forEach((group) =>
			group.forEach((unit) => unit.update(p))
		);
		this.enemyUnits.forEach((unit) => unit.update(p));
	}

	private resolveUnitCollisions(p: p5) {
		const allUnits = this.playerUnitGroups.flat().concat(this.enemyUnits);
		resolveCircleCollisions(p, allUnits);
	}

	private processLaserShooting(p: p5) {
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
						if (this.isLaserBlocked(p, unit.position, enemy.position)) continue;
						enemy.health -= this.laserDamage;
						this.lasers.push({
							start: unit.position.copy(),
							end: enemy.position.copy(),
							timer: 10,
						});
						unit.laserCooldown = this.laserCooldownTime;
						break;
					}
				}
			}
		});
	}

	private updateLaserTimers() {
		this.lasers = this.lasers.filter((laser) => {
			laser.timer--;
			return laser.timer > 0;
		});
	}

	private checkBaseWallCollisions(p: p5) {
		const allUnits = this.playerUnitGroups.flat().concat(this.enemyUnits);
		allUnits.forEach((unit) => {
			this.base.walls.forEach((wall) => {
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
	}

	private processMeleeAttacks(p: p5) {
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
	}

	private removeDeadUnits() {
		this.playerUnitGroups = this.playerUnitGroups.map((group) =>
			group.filter((unit) => unit.health > 0)
		);
		this.enemyUnits = this.enemyUnits.filter((unit) => unit.health > 0);
	}

	private spawnWaveIfNeeded(p: p5) {
		if (this.enemyUnits.length === 0) {
			this.enemyWave++;
			this.spawnEnemyWave(p);
		}
	}

	// Enemy wave spawning remains similar.
	spawnEnemyWave(p: p5) {
		const enemyCount = 4 + this.enemyWave;
		for (let i = 0; i < enemyCount; i++) {
			const x = p.width / 2 + p.random(-100, 100);
			const y = 50 + p.random(0, 50);
			this.enemyUnits.push(new Unit(p, x, y, 'enemy'));
		}
	}

	// Rendering: draws the background, base walls, units, lasers, and UI text.
	display(p: p5) {
		p.background(34, 139, 34);

		// Draw base walls.
		p.push();
		p.fill(100, 100, 100);
		this.base.walls.forEach((wall) => {
			p.rect(wall.x, wall.y, wall.w, wall.h);
		});
		p.pop();

		// Draw units.
		this.playerUnitGroups.forEach((group) =>
			group.forEach((unit) => unit.display(p))
		);
		this.enemyUnits.forEach((unit) => unit.display(p));

		// Draw lasers.
		p.push();
		p.strokeWeight(2);
		p.stroke(255, 0, 0);
		this.lasers.forEach((laser) => {
			p.line(laser.start.x, laser.start.y, laser.end.x, laser.end.y);
		});
		p.pop();

		// Optionally highlight active group.
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

		// UI text.
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

	// Orders units to move in formation (e.g., in a circular layout around a target).
	private issueFormationOrder(p: p5, units: Unit[], target: p5.Vector) {
		const unitCount = units.length;
		if (unitCount === 0) return;
		if (unitCount === 1) {
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
			const unitFinalTarget = p5Obj.Vector.add(target, offset);
			const path = this.pathfinder.calculatePathForUnit(
				p,
				units[i].position,
				unitFinalTarget
			);
			units[i].setPath(path);
		}
	}

	// On mouse press, issues move orders.
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

	// Handle key presses to toggle unit groups.
	handleKeyPressed(p: p5) {
		if (p.key === '1') {
			this.activeGroup = this.activeGroup === 0 ? null : 0;
		} else if (p.key === '2') {
			this.activeGroup = this.activeGroup === 1 ? null : 1;
		}
	}

	// --- Laser Blocking Helpers ---
	private isLaserBlocked(p: p5, start: p5.Vector, end: p5.Vector): boolean {
		for (let wall of this.base.walls) {
			if (this.lineIntersectsRect(p, start, end, wall)) {
				return true;
			}
		}
		return false;
	}

	private lineIntersectsRect(
		p: p5,
		p1: p5.Vector,
		p2: p5.Vector,
		rect: { x: number; y: number; w: number; h: number }
	): boolean {
		const topLeft = p.createVector(rect.x, rect.y);
		const topRight = p.createVector(rect.x + rect.w, rect.y);
		const bottomLeft = p.createVector(rect.x, rect.y + rect.h);
		const bottomRight = p.createVector(rect.x + rect.w, rect.y + rect.h);

		return (
			this.lineIntersectsLine(p, p1, p2, topLeft, topRight) ||
			this.lineIntersectsLine(p, p1, p2, topRight, bottomRight) ||
			this.lineIntersectsLine(p, p1, p2, bottomRight, bottomLeft) ||
			this.lineIntersectsLine(p, p1, p2, bottomLeft, topLeft)
		);
	}

	private lineIntersectsLine(
		p: p5,
		p1: p5.Vector,
		p2: p5.Vector,
		p3: p5.Vector,
		p4: p5.Vector
	): boolean {
		const denominator =
			(p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);
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
