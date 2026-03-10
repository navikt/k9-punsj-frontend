module.exports = {
    rules: {},
    overrides: [
        {
            files: ['**/*.css'],
            extends: ['stylelint-config-standard', 'stylelint-config-tailwindcss'],
            rules: {
                'selector-class-pattern': null,
                'at-rule-no-deprecated': null,
                'no-invalid-position-at-import-rule': null,
                'at-rule-no-unknown': [
                    true,
                    {
                        ignoreAtRules: ['apply', 'tailwind', 'screen', 'layer', 'config', 'reference'],
                    },
                ],
            },
        },
    ],
};
