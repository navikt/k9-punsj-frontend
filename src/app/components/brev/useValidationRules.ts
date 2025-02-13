import { RegisterOptions } from 'react-hook-form';
import { useIntl } from 'react-intl';
import { isNotValidOrgNumber } from 'app/utils/getOrgNumberValidator';
import { IBrevForm } from './types';
import { hasValidText } from 'app/utils/validationHelpers';

export const useValidationRulesBrev = () => {
    const intl = useIntl();

    const brevmalkodeValidationRules: RegisterOptions<IBrevForm> = {
        required: intl.formatMessage({ id: 'validation.brevComponent.select.brevmalkode.required' }),
    };

    const mottakerValidationRules: RegisterOptions<IBrevForm> = {
        validate: (value: string, formValues: IBrevForm) => {
            if (!formValues.velgAnnenMottaker && !value) {
                return intl.formatMessage({ id: 'validation.brevComponent.select.mottaker.required' });
            }
            return true;
        },
    };

    const annenMottakerOrgNummerValidationRules: RegisterOptions<IBrevForm> = {
        validate: (value: string, formValues: IBrevForm) => {
            if (formValues.velgAnnenMottaker) {
                if (!value) {
                    return intl.formatMessage({
                        id: 'validation.brevComponent.textField.annenMottakerOrgNummer.required',
                    });
                }
                const cleanValue = value.replace(/\s/g, '');
                if (!isNotValidOrgNumber(cleanValue)) {
                    return intl.formatMessage({
                        id: 'validation.brevComponent.textField.annenMottakerOrgNummer.invalid',
                    });
                }
            }
            return true;
        },
    };

    const overskriftValidationRules: RegisterOptions<IBrevForm> = {
        validate: (value: string) => {
            if (!value) {
                return intl.formatMessage({ id: 'validation.brevComponent.textField.tittel.required' });
            }
            if (value.length < 3) {
                return intl.formatMessage({ id: 'validation.brevComponent.textField.tittel.minLength' }, { min: 3 });
            }
            if (value.length > 200) {
                return intl.formatMessage({ id: 'validation.brevComponent.textField.tittel.maxLength' }, { max: 200 });
            }

            return hasValidText(value);
        },
    };

    const brødtekstValidationRules: RegisterOptions<IBrevForm> = {
        validate: (value: string) => {
            if (!value) {
                return intl.formatMessage({ id: 'validation.brevComponent.textarea.brødtekst.required' });
            }
            if (value.length < 3) {
                return intl.formatMessage({ id: 'validation.brevComponent.textarea.brødtekst.minLength' }, { min: 3 });
            }
            if (value.length > 10000) {
                return intl.formatMessage(
                    { id: 'validation.brevComponent.textarea.brødtekst.maxLength' },
                    { max: 10000 },
                );
            }

            return hasValidText(value);
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
