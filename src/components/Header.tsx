import React from 'react';
import { SketchKey } from '../sketches/sketchMap';

interface HeaderProps {
	sketch: SketchKey;
	showLinks?: boolean;
}

const spaceWords = (s: string): string => s.replace(/([A-Z])/g, ' $1').trim();

const Header: React.FC<HeaderProps> = ({ sketch, showLinks = false }) => {
	return (
		<header className="flex flex-col items-center my-4">
			<h1 className="text-3xl font-bold">{spaceWords(sketch)} Sketch</h1>
			{showLinks && (
				<div className="mt-2">
					<a
						className="text-blue-600 mr-4"
						href="https://p5js.org/"
						target="_blank"
						rel="noopener noreferrer"
					>
						P5.js Docs
					</a>
					<a
						className="text-blue-600"
						href="https://github.com/parsehex/p5-apps"
						target="_blank"
						rel="noopener noreferrer"
					>
						View on GitHub
					</a>
				</div>
			)}
		</header>
	);
};

export default Header;
