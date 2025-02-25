import bouncyBubbleSketch from './BouncyBubbles/sketch';
import bubbleSortSketch from './BubbleSort/sketch';
import clockSketch from './Clock/sketch';
import particleSystemSketch from './ParticleSystem/sketch';
import shapesSketch from './Shapes/sketch';
import mandalaSketch from './Mandala/sketch';
import rtsGameSketch from './RTSGame/sketch';

export const sketchMap = {
	Shapes: shapesSketch,
	Clock: clockSketch,
	BubbleSort: bubbleSortSketch,
	ParticleSystem: particleSystemSketch,
	BouncyBubbles: bouncyBubbleSketch,
	Mandala: mandalaSketch,
	MiniBattles: rtsGameSketch,
} as const;

export type SketchKey = keyof typeof sketchMap;
