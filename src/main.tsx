import './lib/fetch-guard';
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Polyfill process for environments that expect it
if (typeof window !== 'undefined' && !window.process) {
  // @ts-ignore
  window.process = { env: { NODE_ENV: import.meta.env.MODE } };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
