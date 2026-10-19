import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// A separate HTML entry keeps every existing module's route untouched.
// Vite's normal production build does not include this HTML entry.
if (import.meta.env.DEV) {
  void import('./DevPreview').then(({ default: Preview }) => {
    createRoot(document.getElementById('root')!).render(<StrictMode><Preview /></StrictMode>);
  });
}
