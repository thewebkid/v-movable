import { existsSync } from 'node:fs';
import { puppeteerLauncher } from '@web/test-runner-puppeteer';
import { sendMousePlugin } from '@web/test-runner-commands/plugins';

const chromeCandidates = [
  process.env.PUPPETEER_EXECUTABLE_PATH,
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium-browser',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);

const executablePath = chromeCandidates.find((p) => existsSync(p));

// GitHub Actions / container runners often cannot use Chromium's sandbox.
const ciArgs = process.env.CI
  ? ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  : [];

const launchOptions = {
  headless: 'new',
  args: ciArgs,
  ...(executablePath ? { executablePath } : { channel: 'chrome' }),
};

export default {
  files: 'test/**/*.test.js',
  nodeResolve: true,
  coverage: true,
  // Vue's bundler ESM build reads process.env.NODE_ENV; browsers have no `process`.
  // Shim it ahead of every served module so `vue` imports cleanly.
  middleware: [
    async (context, next) => {
      await next();
      if (
        context.status === 200 &&
        /javascript/.test(context.response.headers['content-type'] || '')
      ) {
        context.body = `var process = { env: { NODE_ENV: 'production' } };\n${context.body}`;
      }
    },
  ],
  plugins: [sendMousePlugin()],
  browsers: [puppeteerLauncher({ launchOptions })],
};
