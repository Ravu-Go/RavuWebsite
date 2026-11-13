import './bootstrap.js';
import '../css/app.css';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { Toaster } from 'react-hot-toast';

const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true });

createInertiaApp({
  resolve: (name) => {
    const page = pages[`./Pages/${name}.jsx`];
    if (!page) {
      throw new Error(`Page not found: ./Pages/${name}.jsx`);
    }
    return page.default ? page : page;
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
