module.exports = {
    printWidth: 120,
    singleQuote: true,
    trailingComma: 'all',
    tabWidth: 4,
    semi: true,
    importOrder: ['<THIRD_PARTY_MODULES>', '^@navikt/(.*)$', '^app/(.*)$', '^common/(.*)$', '^[./]'],
    importOrderSortSpecifiers: true,
    importOrderSeparation: true,
};
