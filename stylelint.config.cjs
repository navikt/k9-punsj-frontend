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
        {
            files: ['**/*.less'],
            customSyntax: 'postcss-less',
            rules: {
                'selector-class-pattern': null,
                'no-descending-specificity': null,
            },
        },
    ],
};
