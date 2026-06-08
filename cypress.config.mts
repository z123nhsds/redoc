import { defineConfig } from 'cypress';

export default defineConfig({
  fixturesFolder: false,
  fileServerFolder: '.',
  video: true,
  projectId: 'z6eb6h',
  viewportWidth: 1440,
  viewportHeight: 720,
  e2e: {
    setupNodeEvents(on, config) {
      return import('./e2e/plugins/index.js').then((mod) => mod.default(on, config));
    },
    excludeSpecPattern: '*.js.map',
    specPattern: 'e2e/integration/**/*.{js,jsx,ts,tsx}',
    supportFile: false,
  },
});
