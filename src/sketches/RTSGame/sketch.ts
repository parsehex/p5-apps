import type p5 from 'p5';
import { MiniBattles } from './classes/game';
import { UI } from './classes/UI';

/**
 * MiniBattles is a simplified real-time strategy sketch.
 *
 * Blue player units are split into two groups.
 * Press “1” or “2” to toggle which group is active.
 * Click on the canvas to issue formation move orders.
 */
export default function miniBattlesSketch(p: p5) {
	let game: MiniBattles;
	let ui: UI;

	p.setup = () => {
		p.createCanvas(800, 600);
		p.frameRate(60);
		game = new MiniBattles(p);
		ui = new UI(game);
	};

	p.draw = () => {
		game.update(p);
		game.display(p);
		ui.display(p);
	};

	p.mousePressed = () => {
		game.handleMousePressed(p);
	};

	p.keyPressed = () => {
		game.handleKeyPressed(p);
	};
}
