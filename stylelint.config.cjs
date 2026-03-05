module.exports = {
    rules: {},
    overrides: [
        {
            files: ['**/*.css'],
            extends: ['stylelint-config-standard', 'stylelint-config-tailwindcss'],
            rules: {
                'selector-class-pattern': null,
                'at-rule-no-deprecated': null,
                'at-rule-no-unknown': [
                    true,
                    {
                        ignoreAtRules: ['apply', 'tailwind', 'screen', 'layer'],
                    },
                ],
            },
        },
    ],
};
