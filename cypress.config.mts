import { defineConfig } from 'cypress';

export default defineConfig({
  fixturesFolder: false,
  fileServerFolder: '.',
  video: true,
  projectId: 'z6eb6h',
  viewportWidth: 1440,
  viewportHeight: 720,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    async setupNodeEvents(on, config) {
      const { default: setupPlugins } = await import('./e2e/plugins/index.js');
      return setupPlugins(on, config);
    },
    excludeSpecPattern: '*.js.map',
    specPattern: 'e2e/integration/**/*.{js,jsx,ts,tsx}',
    supportFile: false,
  },
});
