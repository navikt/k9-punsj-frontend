module.exports = {
    rules: {},
    overrides: [
        {
            files: ['**/*.css'],
            extends: ['stylelint-config-standard', 'stylelint-config-tailwindcss'],
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
