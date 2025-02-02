import { RegisterOptions } from 'react-hook-form';
import { useIntl } from 'react-intl';
import { isNotValidOrgNumber } from 'app/utils/getOrgNumberValidator';

export const useValidationRules = () => {
    const intl = useIntl();

    const validateBrevmalkode: RegisterOptions = {
        required: intl.formatMessage({ id: 'validation.brevComponent.brevmalkode.required' }),
    };

    const validateMottaker: RegisterOptions = {
        required: intl.formatMessage({ id: 'validation.brevComponent.mottaker.required' }),
    };

    const validateAnnenMottakerOrgNummer: RegisterOptions = {
        required: intl.formatMessage({ id: 'validation.brevComponent.annenMottakerOrgNummer.required' }),
        validate: (value: string) => {
            const cleanValue = value.replace(/\s/g, '');
            return (
                isNotValidOrgNumber(cleanValue) ||
                intl.formatMessage({ id: 'validation.brevComponent.annenMottakerOrgNummer.invalid' })
            );
        },
    };

    const validateOverskrift: RegisterOptions = {
        required: intl.formatMessage({ id: 'validation.brevComponent.tittel.required' }),
        minLength: {
            value: 3,
            message: intl.formatMessage({ id: 'validation.brevComponent.tittel.minLength' }, { min: 3 }),
        },
        maxLength: {
            value: 200,
            message: intl.formatMessage({ id: 'validation.brevComponent.tittel.maxLength' }, { max: 200 }),
        },
    };

    const validateBrødtekst: RegisterOptions = {
        required: intl.formatMessage({ id: 'validation.brevComponent.brødtekst.required' }),
        minLength: {
            value: 3,
            message: intl.formatMessage({ id: 'validation.brevComponent.brødtekst.minLength' }, { min: 3 }),
        },
        maxLength: {
            value: 10000,
            message: intl.formatMessage({ id: 'validation.brevComponent.brødtekst.maxLength' }, { max: 10000 }),
        },
    };

    return {
        validateBrevmalkode,
        validateMottaker,
        validateAnnenMottakerOrgNummer,
        validateOverskrift,
        validateBrødtekst,
    };
};
