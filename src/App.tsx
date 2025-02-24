import React, { useState } from 'react';
import Header from './components/Header.tsx';
import SketchList from './components/SketchList.tsx';
import SketchContainer from './components/SketchContainer.tsx';
import {
	convertFromParam,
	convertToParam,
	getSketchFromParams,
	redirectUrl,
} from './utils/urlParams';
import { getKeys } from './utils/common';
import { type SketchKey, sketchMap } from './sketches/sketchMap';

const App: React.FC = () => {
	const availableSketches = getKeys(sketchMap);
	const initialSketch = getSketchFromParams(availableSketches[0]);
	const [selectedSketch, setSelectedSketch] =
		useState<SketchKey>(initialSketch);

	const handleSketchChange = (sketch: SketchKey) => {
		redirectUrl(window.location.href.split('?')[0], {
			sketch: convertToParam(sketch),
		});
		setSelectedSketch(sketch);
	};
	addEventListener('popstate', (event) => {
		let sketchParam: string | undefined;
		if (!event.state?.sketch) sketchParam = 'shapes';
		else sketchParam = event.state.sketch;
		if (!sketchParam) return;
		setSelectedSketch(convertFromParam(sketchParam));
	});

	return (
		<div>
			<Header sketch={selectedSketch} showLinks={true} />
			<main className="container mx-auto p-4">
				<SketchList
					sketches={availableSketches}
					currentSketch={selectedSketch}
					onSketchChange={handleSketchChange}
				/>
				<SketchContainer sketchKey={selectedSketch} />
			</main>
		</div>
	);
};

export default App;
