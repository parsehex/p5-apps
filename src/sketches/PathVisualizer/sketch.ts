import type p5 from 'p5';
import { Base } from '../RTSGame/classes/Base';
import { Pathfinder } from '../RTSGame/classes/pathfinder';

export default function pathfinderDemoSketch(p: p5) {
	// Base parameters (matching your RTSGame base)
	let base: Base;
	let pathfinder: Pathfinder;

	// Start and end positions for the pathfinder.
	let startPoint: p5.Vector;
	let targetPoint: p5.Vector;
	let path: p5.Vector[];

	// Touch mode state: when active the next tap/click will update the chosen point.
	// It can be "start", "target", or null.
	let touchMode: 'start' | 'target' | null = null;

	// UI button specs (for touchscreen controls).
	const buttonWidth = 80;
	const buttonHeight = 30;
	const buttonMargin = 10;
	const startButtonRect = {
		x: buttonMargin,
		y: buttonMargin,
		w: buttonWidth,
		h: buttonHeight,
	};
	const targetButtonRect = {
		x: buttonMargin,
		y: buttonMargin * 2 + buttonHeight,
		w: buttonWidth,
		h: buttonHeight,
	};

	p.setup = () => {
		const c = p.createCanvas(800, 600, p.P2D);
		// Prevent right-click context menu on the canvas.
		c.elt.addEventListener('contextmenu', (e: any) => e.preventDefault());
		p.frameRate(60);

		// Create a Base instance so we get consistent wall information.
		base = new Base(p);
		// Create the Pathfinder. (Pass the same parameters from the Base.)
		pathfinder = new Pathfinder(
			p,
			base.center,
			base.halfWidth,
			base.halfHeight,
			base.wallThickness,
			base.gateWidth
		);

		// Set default start and target positions.
		// Start is centered; target is set to the pathfinder's default (typically near the base gate).
		startPoint = p.createVector(p.width / 2, p.height / 2);
		targetPoint = pathfinder.getGatePosition(p);
		// Get initial path.
		path = pathfinder.calculatePathForUnit(p, startPoint, targetPoint);
	};

	p.draw = () => {
		p.background(240);
		// Draw the base walls for context.
		p.push();
		p.fill(100);
		base.walls.forEach((wall) => {
			p.rect(wall.x, wall.y, wall.w, wall.h);
		});
		p.pop();

		// Recalculate path if start/target changed.
		path = pathfinder.calculatePathForUnit(p, startPoint, targetPoint);

		// Draw the calculated path.
		if (path && path.length > 0) {
			p.push();
			p.stroke(0, 0, 255);
			p.strokeWeight(2);
			let current = startPoint;
			path.forEach((waypoint) => {
				p.line(current.x, current.y, waypoint.x, waypoint.y);
				current = waypoint;
			});
			p.pop();
		}

		// Draw markers for start (green) and target (red).
		p.push();
		p.fill(0, 255, 0);
		p.noStroke();
		p.ellipse(startPoint.x, startPoint.y, 12, 12);
		p.pop();

		p.push();
		p.fill(255, 0, 0);
		p.noStroke();
		p.ellipse(targetPoint.x, targetPoint.y, 12, 12);
		p.pop();

		// Draw UI buttons.
		p.push();
		p.fill(200, 200, 200, 180);
		p.noStroke();
		// Draw start button.
		p.rect(
			startButtonRect.x,
			startButtonRect.y,
			startButtonRect.w,
			startButtonRect.h,
			5
		);
		// Draw target button.
		p.rect(
			targetButtonRect.x,
			targetButtonRect.y,
			targetButtonRect.w,
			targetButtonRect.h,
			5
		);
		p.fill(0);
		p.textSize(12);
		p.textAlign(p.CENTER, p.CENTER);
		p.text(
			'Set Start',
			startButtonRect.x + startButtonRect.w / 2,
			startButtonRect.y + startButtonRect.h / 2
		);
		p.text(
			'Set Target',
			targetButtonRect.x + targetButtonRect.w / 2,
			targetButtonRect.y + targetButtonRect.h / 2
		);
		p.pop();

		// Display active touch mode label on the left.
		if (touchMode) {
			p.push();
			p.fill(0);
			p.textSize(16);
			p.textAlign(p.LEFT, p.CENTER);
			p.text(`Touch mode: ${touchMode}`, p.width - 150, buttonMargin + 20);
			p.pop();
		}
	};

	// Utility function to check if a point is within a rectangle.
	function pointInRect(
		x: number,
		y: number,
		rect: { x: number; y: number; w: number; h: number }
	): boolean {
		return (
			x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h
		);
	}

	// Checks that a position (mouse or touch) is within the canvas.
	function isInsideCanvas(x: number, y: number): boolean {
		return x >= 0 && y >= 0 && x <= p.width && y <= p.height;
	}

	// Use mouseReleased so that a button click first sets the mode,
	// then the subsequent release (or click) outside buttons updates the point.
	p.mouseReleased = (e) => {
		// Ensure pointer is inside canvas.
		if (!isInsideCanvas(p.mouseX, p.mouseY)) return;

		// First, if the pointer is on one of the buttons...
		if (pointInRect(p.mouseX, p.mouseY, startButtonRect)) {
			// Toggle the mode: if already "start", disable it; else enable it.
			touchMode = touchMode === 'start' ? null : 'start';
			return;
		}
		if (pointInRect(p.mouseX, p.mouseY, targetButtonRect)) {
			touchMode = touchMode === 'target' ? null : 'target';
			return;
		}

		// If a touchMode is active and the click is not on a button, update accordingly.
		if (touchMode === 'start') {
			startPoint = p.createVector(p.mouseX, p.mouseY);
			touchMode = null;
			(e as any)?.preventDefault();
			return;
		}
		if (touchMode === 'target') {
			targetPoint = p.createVector(p.mouseX, p.mouseY);
			touchMode = null;
			(e as any)?.preventDefault();
			return;
		}

		// Desktop fallback: if no mode is active, use left/right click.
		if (p.mouseButton === p.LEFT) {
			startPoint = p.createVector(p.mouseX, p.mouseY);
			(e as any)?.preventDefault();
		} else if (p.mouseButton === p.RIGHT) {
			targetPoint = p.createVector(p.mouseX, p.mouseY);
			(e as any)?.preventDefault();
		}
	};

	// Touch handling: on touch start, update point if a mode is active.
	p.touchStarted = () => {
		const touch = p.touches[0] as { x: number; y: number };
		if (!touch) return false;
		if (!isInsideCanvas(touch.x, touch.y)) return false;
		if (touchMode === 'start') {
			startPoint = p.createVector(touch.x, touch.y);
			touchMode = null;
		} else if (touchMode === 'target') {
			targetPoint = p.createVector(touch.x, touch.y);
			touchMode = null;
		}
		// Returning false prevents default behavior.
		return false;
	};
}
