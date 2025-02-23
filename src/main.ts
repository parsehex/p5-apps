import "./style.css";
import { type SketchKey, sketchMap } from "./sketches/sketchMap";
import { Header, SketchSelector, SketchContainer } from "./components";
import { addListenerToSelect } from "./components/SketchSelector";
import { renderSketch } from "./components/SketchContainer";
import { getSketchFromParams } from "./utils/urlParams";
import { getKeys } from "./utils/common";

/**
 * Initialise the application by getting the sketch from the url parameter,
 * adding the HTML components to the #app div, adding an event listener to the
 * select input, and rendering the p5 sketch within the newly created #sketch div
 */
function init() {
  const CONTAINER_ID = "sketch-container";
  const SELECT_ID = "animation-selector";

  const sketch: SketchKey = getSketchFromParams(getKeys(sketchMap)[0]); // get the sketch to render
  const app = document.querySelector<HTMLDivElement>("#app")!; // get the app container <div> element

  // Update the innerHTML of the app container to contain the header, select input, and the sketch.
  app.innerHTML = `
    ${Header(sketch, true)}
    <main>
      ${SketchSelector(SELECT_ID, getKeys(sketchMap), sketch)}
      ${SketchContainer(CONTAINER_ID)}
    </main>
  `;

  addListenerToSelect(SELECT_ID, sketch);

  renderSketch(CONTAINER_ID, sketch);
}

init();
