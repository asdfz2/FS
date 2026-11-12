import { defineConfig } from '@playwright/test'
import { existsSync } from 'node:fs'

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:4173'
const localChromium = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
  (process.platform === 'win32'
    ? 'C:\\Users\\DU\\AppData\\Local\\ms-playwright\\chromium-1248\\chrome-win64\\chrome.exe'
    : '')

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  timeout: 30_000,
  expect: {
    timeout: 6_000
  },
  reporter: 'list',
  use: {
    baseURL,
    launchOptions: localChromium && existsSync(localChromium)
      ? { executablePath: localChromium }
      : {},
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 4173',
    url: `${baseURL}/#/front`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
})
