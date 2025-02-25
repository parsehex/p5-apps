import type p5 from "p5";
import { Unit } from "./unit";

/**
 * The RTSGame class now holds two groups of player (blue) units as well as enemy units.
 * You can toggle (by pressing 1 or 2) which blue group is “active” so that only that subgroup
 * responds to a mouse click. When no group is selected (activeGroup === null), all blue units move.
 */
export class RTSGame {
	// Instead of a single array of player units, we use an array of groups.
	playerUnitGroups: Unit[][];
	enemyUnits: Unit[];
	// When activeGroup is a valid index, only that subgroup will be given move commands.
	// Setting it to null means that all player units receive orders.
	activeGroup: number | null;

	constructor(p: p5) {
		this.activeGroup = null;
		this.playerUnitGroups = [];

		// Create two groups of blue (player) units.
		// (Here we still create 5 units, splitting them into group1 (first 3 units) and group2 (last 2 units).
		const group1: Unit[] = [];
		const group2: Unit[] = [];
		const totalPlayerUnits = 5;
		for (let i = 0; i < totalPlayerUnits; i++) {
			let x = p.width / 2 + (i - (totalPlayerUnits - 1) / 2) * 30;
			let y = p.height - 60;
			const unit = new Unit(p, x, y, "player");
			// Split the units into two groups:
			if (i < Math.ceil(totalPlayerUnits / 2)) {
				group1.push(unit);
			} else {
				group2.push(unit);
			}
		}
		this.playerUnitGroups.push(group1, group2);

		// Initialize enemy (red) units in the upper part of the canvas.
		this.enemyUnits = [];
		for (let i = 0; i < 5; i++) {
			let x = p.width / 2 + p.random(-100, 100);
			let y = 50 + p.random(0, 50);
			this.enemyUnits.push(new Unit(p, x, y, "enemy"));
		}
	}

	/**
	 * Update all units and check for combat collisions.
	 */
	update(p: p5) {
		// Update each player unit in each group.
		for (let group of this.playerUnitGroups) {
			group.forEach((unit) => unit.update(p));
		}
		// Update enemy units.
		this.enemyUnits.forEach((unit) => unit.update(p));

		// Check for combat between all player units and enemy units.
		const attackRange = 20;
		const damage = 0.5;
		const allPlayerUnits = this.playerUnitGroups.flat();
		for (let playerUnit of allPlayerUnits) {
			for (let enemyUnit of this.enemyUnits) {
				const d = p.dist(
					playerUnit.position.x,
					playerUnit.position.y,
					enemyUnit.position.x,
					enemyUnit.position.y
				);
				if (d < attackRange) {
					playerUnit.health -= damage;
					enemyUnit.health -= damage;
				}
			}
		}

		// Remove any dead units from each player group.
		this.playerUnitGroups = this.playerUnitGroups.map((group) =>
			group.filter((unit) => unit.health > 0)
		);
		// Remove dead enemy units.
		this.enemyUnits = this.enemyUnits.filter((unit) => unit.health > 0);
	}

	/**
	 * Display the game field, the base, all units, and some UI info.
	 */
	display(p: p5) {
		// Draw a grassy background.
		p.background(34, 139, 34);

		// Draw a simple base for the player.
		p.fill(150);
		p.rect(p.width / 2 - 40, p.height - 40, 80, 30);

		// Render all player units.
		for (let group of this.playerUnitGroups) {
			group.forEach((unit) => unit.display(p));
		}
		// Render enemy units.
		this.enemyUnits.forEach((unit) => unit.display(p));

		// If an active player group is selected, highlight its units.
		if (this.activeGroup !== null) {
			const activeUnits = this.playerUnitGroups[this.activeGroup];
			activeUnits.forEach((unit) => {
				p.push();
				p.strokeWeight(2);
				p.stroke(255, 255, 0); // Yellow highlight.
				p.noFill();
				p.ellipse(unit.position.x, unit.position.y, (unit.radius + 5) * 2);
				p.pop();
			});
		}

		// Draw UI hint text at the top.
		p.fill(255);
		p.noStroke();
		p.textSize(12);
		p.text(
			"Press 1 or 2 to toggle unit group. Active Group: " +
			(this.activeGroup !== null ? this.activeGroup + 1 : "All"),
			10,
			20
		);
	}

	/**
	 * When the mouse is pressed, command player units to move toward the target point.
	 * If a group is active, only that group receives the command.
	 */
	handleMousePressed(p: p5) {
		const target = p.createVector(p.mouseX, p.mouseY);
		if (this.activeGroup !== null) {
			// Command only the active group.
			this.playerUnitGroups[this.activeGroup].forEach((unit) =>
				unit.setTarget(target)
			);
		} else {
			// Command all player units.
			for (let group of this.playerUnitGroups) {
				group.forEach((unit) => unit.setTarget(target));
			}
		}
	}

	/**
	 * Process key presses to toggle which blue unit subgroup is active.
	 * Press "1" to toggle the first group and "2" to toggle the second.
	 */
	handleKeyPressed(p: p5) {
		if (p.key === "1") {
			// Toggle group 1.
			this.activeGroup = this.activeGroup === 0 ? null : 0;
		} else if (p.key === "2") {
			// Toggle group 2.
			this.activeGroup = this.activeGroup === 1 ? null : 1;
		}
	}
}
