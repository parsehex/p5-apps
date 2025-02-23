import type { SketchKey } from "../sketches/sketchMap";
import { spaceWords } from "../utils/common";
import { convertToParam, redirectUrl } from "../utils/urlParams";

/**
 * Generates a list of buttons for selecting a sketch.
 * @param {string[]} sketches - The available sketches.
 * @param {SketchKey} currentSketch - The currently selected sketch.
 * @returns {string} - The HTML string for the sketch list.
 */
export default function SketchList(sketches: string[], currentSketch: SketchKey): string {
	return `
    <div class="sketch-list">
      ${sketches
			.map(
				(sketch) => `
            <button class="sketch-btn ${sketch === currentSketch ? "active" : ""}" data-sketch="${sketch}">
              ${spaceWords(sketch)}
            </button>`
			)
			.join("")}
    </div>
  `;
}

/**
 * Adds event listeners to sketch buttons for changing the sketch.
 */
export function addSketchListListeners() {
	document.querySelectorAll(".sketch-btn").forEach((button) => {
		button.addEventListener("click", (e) => {
			const sketch = (e.target as HTMLButtonElement).dataset.sketch as SketchKey;
			if (sketch) {
				redirectUrl(window.location.href.split("?")[0], { sketch: convertToParam(sketch) });
			}
		});
	});
}
