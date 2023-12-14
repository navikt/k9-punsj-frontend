import { defineConfig } from 'cypress';

export default defineConfig({
    video: false,
    e2e: {
        baseUrl: 'http://localhost:8080',
        specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
    },
});
