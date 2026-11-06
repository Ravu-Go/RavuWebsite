import './bootstrap.js';
import '../css/app.css';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { Toaster } from 'react-hot-toast';

const pages = import.meta.glob('./Pages/**/*.jsx');

createInertiaApp({
  resolve: (name) => {
    const importPage = pages[`./Pages/${name}.jsx`];
    if (!importPage) {
      throw new Error(`Page not found: ./Pages/${name}.jsx`);
    }
    return importPage();
  },
  setup({ el, App, props }) {
    createRoot(el).render(
      <>
        <App {...props} />
        <Toaster position="top-right" />
      </>
    );
  },
});
