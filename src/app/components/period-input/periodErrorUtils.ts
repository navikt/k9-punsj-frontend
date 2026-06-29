const DATE_NOT_ALLOWED_MESSAGE = 'Datoen er ikke tillatt';

export const PERIOD_RANGE_ERROR_MESSAGE = 'Startdato må være før sluttdato.';

interface ResolvePeriodInlineErrorsParams {
    fomInlineValidationMessage?: string;
    tomInlineValidationMessage?: string;
    fomHasUpperBound: boolean;
    tomHasLowerBound: boolean;
    fomFieldErrorMessage?: string;
    tomFieldErrorMessage?: string;
    groupErrorMessage?: string;
}

export const resolvePeriodInlineErrors = ({
    fomInlineValidationMessage,
    tomInlineValidationMessage,
    fomHasUpperBound,
    tomHasLowerBound,
    fomFieldErrorMessage,
    tomFieldErrorMessage,
    groupErrorMessage,
}: ResolvePeriodInlineErrorsParams) => {
    const fomHasInlineRangeError = fomInlineValidationMessage === DATE_NOT_ALLOWED_MESSAGE && fomHasUpperBound;
    const tomHasInlineRangeError = tomInlineValidationMessage === DATE_NOT_ALLOWED_MESSAGE && tomHasLowerBound;
    const hasInlineRangeError = fomHasInlineRangeError || tomHasInlineRangeError;

    return {
        fomErrorMessage: fomHasInlineRangeError ? undefined : fomInlineValidationMessage || fomFieldErrorMessage,
        tomErrorMessage: tomHasInlineRangeError ? undefined : tomInlineValidationMessage || tomFieldErrorMessage,
        groupErrorMessage: groupErrorMessage || (hasInlineRangeError ? PERIOD_RANGE_ERROR_MESSAGE : undefined),
    };
};
