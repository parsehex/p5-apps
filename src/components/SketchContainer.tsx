import React, { useEffect, useRef } from 'react';
import p5 from 'p5';
import { type SketchKey, sketchMap } from '../sketches/sketchMap';

interface SketchContainerProps {
	sketchKey: SketchKey;
}

const SketchContainer: React.FC<SketchContainerProps> = ({ sketchKey }) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const p5InstanceRef = useRef<p5 | null>(null);

	useEffect(() => {
		// Remove the previous p5 instance, if any.
		if (p5InstanceRef.current) {
			p5InstanceRef.current.remove();
		}
		if (containerRef.current) {
			// Create the new p5 sketch within the given container.
			p5InstanceRef.current = new p5(
				sketchMap[sketchKey],
				containerRef.current
			);
		}
		return () => {
			// Cleanup on unmount or before the next run.
			if (p5InstanceRef.current) {
				p5InstanceRef.current.remove();
			}
		};
	}, [sketchKey]);

	return (
		<div className="flex justify-center">
			<div ref={containerRef} className="border border-gray-300"></div>
		</div>
	);
};

export default SketchContainer;
