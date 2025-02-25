import type p5 from 'p5';
import { MiniBattles } from './game';

export class UI {
	game: MiniBattles;

	constructor(game: MiniBattles) {
		this.game = game;
	}

	display(p: p5) {
		p.push();
		p.fill(255);
		p.noStroke();
		p.textSize(12);
		// Instruct which unit groups are toggled.
		p.text(
			'Press 1 or 2 to toggle unit group. Active Group: ' +
				(this.game.activeGroup !== null ? this.game.activeGroup + 1 : 'All'),
			10,
			20
		);
		// Display current enemy wave.
		p.text('Wave: ' + this.game.enemyWave, p.width - 80, 20);

		// If a respawn is pending, show the countdown.
		if (this.game['respawnTimer'] !== null) {
			const seconds = (this.game['respawnTimer'] / 60).toFixed(1);
			p.text('Respawn in: ' + seconds + 's', 10, 40);
		}
		// Dev instructions: Press D to kill a player unit.
		p.text('Press D to kill a player unit (dev)', 10, 60);
		p.pop();
	}
}
