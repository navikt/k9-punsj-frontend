export enum ValidateOrgNumberError {
    orgNumberHasNoValue = 'orgNumberHasNoValue',
    orgNumberHasInvalidFormat = 'orgNumberHasInvalidFormat',
}

interface Options {
    required?: boolean;
}
export const hasValue = (value: any): boolean => value !== '' && value !== undefined && value !== null;

const getMod11 = (strValue: string): number => {
    let checkNbr = 2;
    let mod = 0;

    for (let i = strValue.length - 2; i >= 0; --i) {
        mod += parseInt(strValue.charAt(i), 10) * checkNbr;
        no - plusplus;
        if (++checkNbr > 7) {
            checkNbr = 2;
        }
    }
    const result = 11 - (mod % 11);
    return result === 11 ? 0 : result;
};

const isValidOrgNumber = (value: any): boolean => {
    if (
        value &&
        typeof value === 'string' &&
        value.length === 9 &&
        /^[0-9]*$/.test(value) &&
        (value.charAt(0) === '8' || value.charAt(0) === '9')
    ) {
        return getMod11(value) === parseInt(value.charAt(8), 10);
    }

    return false;
};

const getOrgNumberValidator =
    (options: Options = {}) =>
    (value: any) => {
        const { required } = options;
        if (required && hasValue(value) === false) {
            return ValidateOrgNumberError.orgNumberHasNoValue;
        }
        const isValidFormat = isValidOrgNumber(value);

        if (hasValue(value) && isValidFormat === false) {
            return ValidateOrgNumberError.orgNumberHasInvalidFormat;
        }
        return undefined;
    };

export default getOrgNumberValidator;
