import { useIntl } from 'react-intl';
import { FieldValues, RegisterOptions } from 'react-hook-form';
import intlHelper from 'app/utils/intlUtils';
import { JaNeiIkkeRelevant } from 'app/models/enums/JaNeiIkkeRelevant';

export const useOMPAOValidationRules = <TFieldValues extends FieldValues>() => {
    const intl = useIntl();

    const getFnrRule = (): RegisterOptions<TFieldValues> => ({
        // TODO: Legg til validering
    });

    const getRequiredRule = (): RegisterOptions<TFieldValues> => ({
        required: intlHelper(intl, 'skjema.validering.påkrevd'),
    });

    const getSignatureRule = (): RegisterOptions<TFieldValues> => ({
        validate: (value: JaNeiIkkeRelevant) =>
            value === JaNeiIkkeRelevant.JA || intlHelper(intl, 'skjema.validering.signatur'),
    });

    const getTimeRule = (): RegisterOptions<TFieldValues> => ({
        pattern: {
            value: /^([01]\d|2[0-3]):([0-5]\d)$/,
            message: intlHelper(intl, 'skjema.validering.ugyldigKlokkeslett'),
        },
    });

    const getDateRule = (): RegisterOptions<TFieldValues> => ({
        // Enkel sjekk for dd.mm.åååå format. Mer robust validering kan legges til.
        pattern: {
            value: /^\d{2}\.\d{2}\.\d{4}$/,
            message: intlHelper(intl, 'skjema.validering.ugyldigDato'),
        },
    });

    return {
        getFnrRule,
        getRequiredRule,
        getSignatureRule,
        getTimeRule,
        getDateRule,
    };
};
