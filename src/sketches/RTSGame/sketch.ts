import type p5 from "p5";
import { RTSGame } from "./classes/game";

/**
 * This sketch implements a simple RTS game.
 *
 * Blue player units are split into two groups. By pressing "1" or "2" you can toggle
 * which group is active: only that subgroup will respond to clicks. When no group is selected,
 * all blue units move.
 *
 * Controls:
 * - Click the canvas to send move commands.
 * - Press "1" or "2" to toggle between which blue group is selected.
 */
export default function rtsGameSketch(p: p5) {
	let game: RTSGame;

	p.setup = () => {
		// Create a 600x400 canvas.
		p.createCanvas(600, 400);
		p.frameRate(60);
		game = new RTSGame(p);
	};

	p.draw = () => {
		// Update game state and draw all elements.
		game.update(p);
		game.display(p);
	};

	// Send move commands on mouse press.
	p.mousePressed = () => {
		game.handleMousePressed(p);
	};

	// Handle number key presses for group selection.
	p.keyPressed = () => {
		game.handleKeyPressed(p);
	};
}
