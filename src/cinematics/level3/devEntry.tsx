// Separate development entry: no change to the shared game entry or gameplay routes.
if (import.meta.env.DEV) {
  void import('./Level3DevPreview').then(({ mountPreview }) => mountPreview());
} else {
  document.getElementById('root')!.textContent = 'CIN-03A preview is available in development only.';
}
