import { RegisterOptions } from 'react-hook-form';
import { useIntl } from 'react-intl';
import { isNotValidOrgNumber } from 'app/utils/getOrgNumberValidator';
import { IBrevForm } from './types';
import { hasValidText } from 'app/utils/validationHelpers';

export const useValidationRulesBrev = () => {
    const intl = useIntl();

    const brevmalkodeValidationRules: RegisterOptions<IBrevForm> = {
        required: intl.formatMessage({ id: 'validation.brevComponent.brevmalkode.required' }),
    };

    const mottakerValidationRules: RegisterOptions<IBrevForm> = {
        validate: (value: string, formValues: IBrevForm) => {
            if (!formValues.velgAnnenMottaker && !value) {
                return intl.formatMessage({ id: 'validation.brevComponent.mottaker.required' });
            }
            return true;
        },
    };

    const annenMottakerOrgNummerValidationRules: RegisterOptions<IBrevForm> = {
        validate: (value: string, formValues: IBrevForm) => {
            if (formValues.velgAnnenMottaker) {
                if (!value) {
                    return intl.formatMessage({ id: 'validation.brevComponent.annenMottakerOrgNummer.required' });
                }
                const cleanValue = value.replace(/\s/g, '');
                if (!isNotValidOrgNumber(cleanValue)) {
                    return intl.formatMessage({ id: 'validation.brevComponent.annenMottakerOrgNummer.invalid' });
                }
            }
            return true;
        },
    };

    const overskriftValidationRules: RegisterOptions<IBrevForm> = {
        validate: (value: string) => {
            if (!value) {
                return intl.formatMessage({ id: 'validation.brevComponent.tittel.required' });
            }
            if (value.length < 3) {
                return intl.formatMessage({ id: 'validation.brevComponent.tittel.minLength' }, { min: 3 });
            }
            if (value.length > 200) {
                return intl.formatMessage({ id: 'validation.brevComponent.tittel.maxLength' }, { max: 200 });
            }
            if (!hasValidText(value)) {
                return intl.formatMessage({ id: 'validation.brevComponent.tittel.invalid' });
            }
            return true;
        },
    };

    const brødtekstValidationRules: RegisterOptions<IBrevForm> = {
        validate: (value: string) => {
            if (!value) {
                return intl.formatMessage({ id: 'validation.brevComponent.brødtekst.required' });
            }
            if (value.length < 3) {
                return intl.formatMessage({ id: 'validation.brevComponent.brødtekst.minLength' }, { min: 3 });
            }
            if (value.length > 10000) {
                return intl.formatMessage({ id: 'validation.brevComponent.brødtekst.maxLength' }, { max: 10000 });
            }
            if (!hasValidText(value)) {
                return intl.formatMessage({ id: 'validation.brevComponent.brødtekst.invalid' });
            }
            return true;
        },
    };

    return {
        brevmalkodeValidationRules,
        mottakerValidationRules,
        annenMottakerOrgNummerValidationRules,
        overskriftValidationRules,
        brødtekstValidationRules,
    };
};
