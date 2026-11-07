import type { StorybookConfig } from '@storybook/react-vite';

const storybookConfig: StorybookConfig = {
    stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
    staticDirs: [{ from: './public', to: '/' }],
    addons: ['msw-storybook-addon'],
    framework: {
        name: '@storybook/react-vite',
        options: {
            builder: { viteConfigPath: '.storybook/vite.config.mjs' },
        },
    },
};

export default storybookConfig;
