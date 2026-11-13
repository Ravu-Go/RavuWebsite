import './bootstrap.js';
import '../css/app.css';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { Toaster } from 'react-hot-toast';

// Lazy-load each page so only the code for the current page is fetched.
// Inertia shows a spinner instantly and streams the page chunk in.
const pages = import.meta.glob('./Pages/**/*.jsx');

createInertiaApp({
  title: (title) => `${title} ravu`,
  resolve: (name) => {
    const lazyPage = pages[`./Pages/${name}.jsx`];
    if (!lazyPage) {
      throw new Error(`Page not found: ./Pages/${name}.jsx`);
    }
    return lazyPage();
  },
  setup({ el, App, props }) {
    createRoot(el).render(
      <>
        <App {...props} />
        <Toaster position="top-right" />
      </>
    );
  },
  progress: { color: '#0ea5e9', showSpinner: true },
});
