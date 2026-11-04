import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './e2e/tests',
    forbidOnly: !!process.env.CI,
    retries: 0,
    reporter: [['list'], ['html', { open: 'never' }]],
    use: {
        baseURL: 'http://127.0.0.1:8080',
        browserName: 'chromium',
        locale: 'nb-NO',
        timezoneId: 'Europe/Oslo',
        viewport: { width: 1280, height: 800 },
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
    },
    webServer: {
        command: 'yarn start:e2e',
        url: 'http://127.0.0.1:8080/health/isReady',
        reuseExistingServer: false,
        timeout: 120_000,
    },
});
