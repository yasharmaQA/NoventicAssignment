const fs = require('fs');
const path = require('path');
const cucumberHtmlReporter = require('cucumber-html-reporter');

const ROOT_DIR = process.cwd();
const INPUT_JSON = path.join(ROOT_DIR, 'test-results', 'playwright-results.json');
const CUCUMBER_JSON_DIR = path.join(ROOT_DIR, 'test-results', 'cucumber-json');
const CUCUMBER_JSON_FILE = path.join(CUCUMBER_JSON_DIR, 'cucumber-report.json');
const HTML_REPORT_FILE = path.join(ROOT_DIR, 'cucumber-report', 'index.html');

function toCucumberStatus(status) {
  if (status === 'passed') return 'passed';
  if (status === 'failed' || status === 'timedOut' || status === 'interrupted') return 'failed';
  if (status === 'skipped') return 'skipped';
  return 'undefined';
}

function collectSpecs(suite, acc = []) {
  if (Array.isArray(suite.specs)) {
    for (const spec of suite.specs) acc.push(spec);
  }

  if (Array.isArray(suite.suites)) {
    for (const child of suite.suites) collectSpecs(child, acc);
  }

  return acc;
}

function getFinalResult(test) {
  if (!Array.isArray(test.results) || test.results.length === 0) {
    return { status: 'undefined', duration: 0, error: null };
  }

  // Prefer the last non-skipped result to reflect final retry outcome.
  const nonSkipped = test.results.filter((r) => r.status !== 'skipped');
  const chosen = nonSkipped.length > 0 ? nonSkipped[nonSkipped.length - 1] : test.results[test.results.length - 1];

  const errorMessage = chosen.error?.message || (Array.isArray(chosen.errors) && chosen.errors[0]?.message) || '';

  return {
    status: toCucumberStatus(chosen.status),
    duration: Number(chosen.duration || 0) * 1000000,
    error: errorMessage
  };
}

function toFeatureEntries(playwrightJson) {
  const byFile = new Map();

  for (const topSuite of playwrightJson.suites || []) {
    const specs = collectSpecs(topSuite);

    for (const spec of specs) {
      const filePath = spec.file || 'unknown.spec.ts';
      if (!byFile.has(filePath)) {
        byFile.set(filePath, []);
      }

      for (const test of spec.tests || []) {
        const finalResult = getFinalResult(test);
        const scenarioName = `${spec.title} [${test.projectName || 'project'}]`;

        byFile.get(filePath).push({
          id: scenarioName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          keyword: 'Scenario',
          name: scenarioName,
          type: 'scenario',
          steps: [
            {
              keyword: 'Then ',
              name: spec.title,
              result: {
                status: finalResult.status,
                duration: finalResult.duration,
                ...(finalResult.error ? { error_message: finalResult.error } : {})
              }
            }
          ]
        });
      }
    }
  }

  const features = [];
  for (const [filePath, scenarios] of byFile.entries()) {
    features.push({
      uri: filePath,
      keyword: 'Feature',
      name: path.basename(filePath),
      id: path.basename(filePath).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      elements: scenarios
    });
  }

  return features;
}

function main() {
  if (!fs.existsSync(INPUT_JSON)) {
    console.error(`Missing Playwright JSON report: ${INPUT_JSON}`);
    process.exit(1);
  }

  fs.mkdirSync(CUCUMBER_JSON_DIR, { recursive: true });
  fs.mkdirSync(path.dirname(HTML_REPORT_FILE), { recursive: true });

  const playwrightJson = JSON.parse(fs.readFileSync(INPUT_JSON, 'utf8'));
  const cucumberJson = toFeatureEntries(playwrightJson);

  fs.writeFileSync(CUCUMBER_JSON_FILE, JSON.stringify(cucumberJson, null, 2));

  cucumberHtmlReporter.generate({
    theme: 'bootstrap',
    jsonFile: CUCUMBER_JSON_FILE,
    output: HTML_REPORT_FILE,
    reportSuiteAsScenarios: true,
    launchReport: false,
    metadata: {
      'Browser': 'Chromium',
      'Platform': process.platform,
      'Node': process.version,
      'Generated': new Date().toISOString()
    }
  });

  console.log('Cucumber JSON generated at:', CUCUMBER_JSON_FILE);
  console.log('Cucumber HTML report generated at:', HTML_REPORT_FILE);
}

main();
