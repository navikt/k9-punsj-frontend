export const sanitizeDecimalTimeInput = (value: string): string =>
    value.replaceAll(/[^\d,.]+/g, '').replace(',', '.');
