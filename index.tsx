
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

// Service Worker Registration for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('NEURØN: PWA Shield Active.', reg))
      .catch(err => console.warn('NEURØN: PWA Offline capability disabled.', err));
  });
}

const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    const root = createRoot(rootElement);
    // Removed StrictMode to prevent double-invocation of heavy animation hooks on mobile
    root.render(
      <App />
    );
    console.log("NEURØN: Core systems online.");
  } catch (error) {
    console.error("NEURØN: Initialization failure.", error);
  }
} else {
  console.error("NEURØN: Critical Error - Root mount point not found.");
}
