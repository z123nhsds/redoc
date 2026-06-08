import { defineConfig } from 'cypress';

declare const process: any;

export default defineConfig({
  reporter: 'mochawesome',
  reporterOptions: {
    reportDir: 'cypress/reports',
    reportFilename: 'e2e-report',
    json: true,
    html: false,
    overwrite: true,
  },
  fixturesFolder: false,
  fileServerFolder: '.',
  video: true,
  projectId: 'z6eb6h',
  viewportWidth: 1440,
  viewportHeight: 720,
  e2e: {
    setupNodeEvents(on: any, config: any) {
      const DATADOG_API_KEY = process.env.DD_API_KEY || '';
      const DATADOG_APP_KEY = process.env.DD_APP_KEY || '';
      const DATADOG_SITE = process.env.DD_SITE || 'datadoghq.com';
      const DD_SYNTHETICS_TEST_ID = process.env.DD_SYNTHETICS_TEST_ID || '';

      on('after:run', async (results: any) => {
        if (!('totalPassed' in results)) {
          return;
        }

        const { totalPassed, totalFailed, totalSkipped, totalDuration } = results;

        const payload = {
          timestamp: Date.now(),
          result: {
            passed: totalPassed,
            failed: totalFailed,
            skipped: totalSkipped,
            duration: totalDuration,
            status: totalFailed === 0 ? 'passed' : 'failed',
          },
          test_run_id: DD_SYNTHETICS_TEST_ID,
        };

        if (!DATADOG_API_KEY || !DATADOG_APP_KEY) {
          console.warn('[Datadog] DD_API_KEY or DD_APP_KEY not set, skipping report upload');
          return;
        }

        try {
          const response = await fetch(
            `https://api.${DATADOG_SITE}/api/v1/synthetics/tests/${DD_SYNTHETICS_TEST_ID}/results`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'DD-API-KEY': DATADOG_API_KEY,
                'DD-APPLICATION-KEY': DATADOG_APP_KEY,
              },
              body: JSON.stringify(payload),
            },
          );

          if (!response.ok) {
            console.error(`[Datadog] Failed to upload results: ${response.status} ${response.statusText}`);
          } else {
            console.log('[Datadog] Test results successfully uploaded to Synthetics');
          }
        } catch (error) {
          console.error('[Datadog] Error uploading results:', error);
        }
      });

      return config;
    },
    supportFile: false,
  },
});
