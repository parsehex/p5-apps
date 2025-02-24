import React from 'react';
import { type SketchKey } from '../sketches/sketchMap';

interface SketchListProps {
	sketches: string[];
	currentSketch: SketchKey;
	onSketchChange: (sketch: SketchKey) => void;
}

const spaceWords = (s: string): string => s.replace(/([A-Z])/g, ' $1').trim();

const SketchList: React.FC<SketchListProps> = ({
	sketches,
	currentSketch,
	onSketchChange,
}) => {
	return (
		<div className="flex flex-wrap justify-center gap-2 my-4">
			{sketches.map((sketch) => (
				<button
					key={sketch}
					className={`px-4 py-2 rounded ${
						sketch === currentSketch
							? 'bg-green-500'
							: 'bg-blue-500 hover:bg-blue-600'
					} text-white`}
					onClick={() => onSketchChange(sketch as SketchKey)}
				>
					{spaceWords(sketch)}
				</button>
			))}
		</div>
	);
};

export default SketchList;
