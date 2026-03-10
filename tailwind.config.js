/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx}', '/dist/index.html'],
    theme: {
        extend: {},
    },
    plugins: [],
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    presets: [require('@navikt/ds-tailwind')],
};
