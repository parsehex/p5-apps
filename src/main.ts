import "./style.css";
import { type SketchKey, sketchMap } from "./sketches/sketchMap";
import { Header, SketchContainer, SketchList } from "./components";
import { renderSketch } from "./components/SketchContainer";
import { addSketchListListeners } from "./components/SketchList";
import { getSketchFromParams } from "./utils/urlParams";
import { getKeys } from "./utils/common";

/**
 * Initialise the application by getting the sketch from the url parameter,
 * adding the HTML components to the #app div, adding an event listener to the
 * select input, and rendering the p5 sketch within the newly created #sketch div
 */
function init() {
  const CONTAINER_ID = "sketch-container";

  const sketch: SketchKey = getSketchFromParams(getKeys(sketchMap)[0]); // get the sketch to render
  const app = document.querySelector<HTMLDivElement>("#app")!; // get the app container <div> element

  // Update the innerHTML to contain the header, sketch list, and sketch container.
  app.innerHTML = `
    ${Header(sketch, true)}
    <main>
      ${SketchList(getKeys(sketchMap), sketch)}
      ${SketchContainer(CONTAINER_ID)}
    </main>
  `;

  addSketchListListeners(); // Add event listeners for sketch selection

  renderSketch(CONTAINER_ID, sketch);
}

init();
