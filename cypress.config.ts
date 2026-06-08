import { defineConfig } from 'cypress';

export default defineConfig({
  fixturesFolder: false,
  fileServerFolder: '.',
  video: true,
  projectId: 'z6eb6h',
  viewportWidth: 1440,
  viewportHeight: 720,
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    reporterEnabled: 'spec, mocha-datadog-reporter',
    mochaDatadogReporterReporterOptions: {
      apiKey: process.env.DD_API_KEY
    }
  },
  e2e: {
    excludeSpecPattern: '*.js.map',
    setupNodeEvents(on, config) {
      on('after:run', async (results) => {
        if (results) {
          const datadogUrl = `https://api.datadoghq.com/api/v1/series?api_key=${process.env.DD_API_KEY}`;
          const payload = {
            series: [
              {
                metric: 'cypress.tests.passed',
                points: [[Math.floor(Date.now() / 1000), results.totalPassed]],
                type: 'gauge',
                tags: ['project:redoc', 'env:ci']
              },
              {
                metric: 'cypress.tests.failed',
                points: [[Math.floor(Date.now() / 1000), results.totalFailed]],
                type: 'gauge',
                tags: ['project:redoc', 'env:ci']
              }
            ]
          };

          try {
            const response = await fetch(datadogUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
            if (!response.ok) {
              console.error('Datadog reporting failed:', await response.text());
            } else {
              console.log('Successfully reported results to Datadog');
            }
          } catch (error) {
            console.error('Error reporting to Datadog:', error);
          }
        }
      });
      return config;
    }
  }
});