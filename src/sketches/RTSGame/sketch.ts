import type p5 from 'p5';
import { MiniBattles } from './classes/game';

/**
 * MiniBattles is a simplified real-time strategy sketch.
 *
 * Blue player units are split into two groups.
 * Press “1” or “2” to toggle which group is active.
 * Click on the canvas to issue formation move orders.
 */
export default function miniBattlesSketch(p: p5) {
	let game: MiniBattles;

	p.setup = () => {
		p.createCanvas(800, 600);
		p.frameRate(60);
		game = new MiniBattles(p);
	};

	p.draw = () => {
		game.update(p);
		game.display(p);
	};

	p.mousePressed = () => {
		game.handleMousePressed(p);
	};

	p.keyPressed = () => {
		game.handleKeyPressed(p);
	};
}
