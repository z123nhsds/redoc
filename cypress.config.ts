import { defineConfig } from 'cypress';
import * as fs from 'fs';
import * as https from 'https';

function sendToDatadog(results: CypressCommandLine.CypressRunResult) {
  const datadogApiKey = process.env.DD_API_KEY;
  const datadogSite = process.env.DD_SITE || 'datadoghq.com';
  const publicId = process.env.DD_SYNTHETICS_PUBLIC_ID;

  if (!datadogApiKey || !publicId) {
    console.warn('Datadog Synthetics: Missing DD_API_KEY or DD_SYNTHETICS_PUBLIC_ID, skipping upload.');
    return;
  }

  const payload = {
    data: {
      type: 'synthetics_test_results',
      attributes: {
        test_public_id: publicId,
        result: {
          passed: results.totalFailed === 0,
          duration: results.totalDuration,
          detail: {
            passes: results.totalPassed,
            failures: results.totalFailed,
            tests: results.runs.map(run => ({
              spec: run.spec.name,
              tests: run.tests.map(test => ({
                title: test.title.join(' > '),
                state: test.state,
                duration: test.duration,
                error: test.displayError || null,
              })),
            })),
          },
        },
      },
    },
  };

  const body = JSON.stringify(payload);

  const options = {
    hostname: `api.${datadogSite}`,
    path: '/api/v1/synthetics/tests/results',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'DD-API-KEY': datadogApiKey,
      'Content-Length': Buffer.byteLength(body),
    },
  };

  return new Promise<void>((resolve, reject) => {
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`Datadog Synthetics: Test results uploaded successfully (status ${res.statusCode})`);
          resolve();
        } else {
          console.error(`Datadog Synthetics: Upload failed (status ${res.statusCode}): ${data}`);
          resolve();
        }
      });
    });

    req.on('error', error => {
      console.error('Datadog Synthetics: Request error:', error.message);
      resolve();
    });

    req.write(body);
    req.end();
  });
}

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8080',
    fileServerFolder: '.',
    reporter: 'junit',
    reporterOptions: {
      mochaFile: 'results/cypress-[hash].xml',
      toConsole: true,
    },
    setupNodeEvents(on, config) {
      on('file:preprocessor', require('./e2e/plugins/cy-ts-preprocessor'));

      on('after:run', async (results: CypressCommandLine.CypressRunResult) => {
        if (!results) return;

        const resultsDir = 'results';
        if (!fs.existsSync(resultsDir)) {
          fs.mkdirSync(resultsDir, { recursive: true });
        }

        const summary = {
          totalTests: results.totalTests,
          totalPassed: results.totalPassed,
          totalFailed: results.totalFailed,
          totalDuration: results.totalDuration,
          runs: results.runs.map(run => ({
            spec: run.spec.name,
            stats: run.stats,
          })),
        };

        fs.writeFileSync(
          `${resultsDir}/cypress-summary.json`,
          JSON.stringify(summary, null, 2)
        );

        await sendToDatadog(results);
      });

      return config;
    },
    excludeSpecPattern: '*.js.map',
    specPattern: 'e2e/integration/**/*.{js,jsx,ts,tsx}',
    supportFile: false,
  },
});
