// console.log('Script app.js BERHASIL DIMUAT!');
// import React from 'react';
// import './bootstrap';
// import '../css/app.css';

// import { createRoot } from 'react-dom/client';
// import { createInertiaApp } from '@inertiajs/react';
// import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

// const appName = import.meta.env.VITE_APP_NAME || 'LENTERA';

// createInertiaApp({
//   title: (title) => `${title} - ${appName}`,
//   resolve: (name) => {
//     console.log('Mencari Komponen:', name);
//     return resolvePageComponent(`./Pages/${name}.tsx`, import.meta.glob('./Pages/**/*.tsx'));
//   },
//   setup({ el, App, props }) {
//     console.log('Inisialisasi App dengan Props:', props);
//     const root = createRoot(el);
//     root.render(<App {...props} />);
//   },
//   progress: {
//     color: '#4B5563',
//   },
// });

import React from 'react';
import './bootstrap';
import '../css/app.css';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
const appName = import.meta.env.VITE_APP_NAME || 'LENTERA';
createInertiaApp({ 
  title: (title) => `${title} - ${appName}`, 
  resolve: (name) => { const pages = { ...import.meta.glob('./Pages/**/*.tsx'), ...import.meta.glob('./Pages/**/*.jsx'), }; 
  return resolvePageComponent(`./Pages/${name}.tsx`, pages) ?? resolvePageComponent(`./Pages/${name}.jsx`, pages); }, 
  setup({ el, App, props }) { createRoot(el).render(<App {...props} />); }, });                  