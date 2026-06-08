import { defineConfig } from 'cypress';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export default defineConfig({
  fixturesFolder: false,
  fileServerFolder: '.',
  video: true,
  projectId: 'z6eb6h',
  viewportWidth: 1440,
  viewportHeight: 720,
  e2e: {
    setupNodeEvents(on, config) {
      return require('./e2e/plugins/index.js')(on, config);
    },
    excludeSpecPattern: '*.js.map',
    specPattern: 'e2e/integration/**/*.{js,jsx,ts,tsx}',
    supportFile: false,
  },
});