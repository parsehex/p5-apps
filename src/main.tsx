import './style.css';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * Initialise the application by mounting the App component.
 */
function init() {
	const container = document.getElementById('app');
	if (container) {
		const root = ReactDOM.createRoot(container);
		root.render(<App />);
	}
}

init();
