import { isNotValidOrgNumber } from 'app/utils/getOrgNumberValidator';
import { useIntl } from 'react-intl';
import * as yup from 'yup';
import { IBrevForm } from './types';

export const getBrevComponentSchema = () => {
    const intl = useIntl();

    return yup.object({
        brevmalkode: yup.string().required(intl.formatMessage({ id: 'validation.brevComponent.brevmalkode.required' })),
        mottaker: yup.string().when('velgAnnenMottaker', {
            is: true,
            then: (schema) => schema.notRequired(),
            otherwise: (schema) =>
                schema.required(intl.formatMessage({ id: 'validation.brevComponent.mottaker.required' })),
        }),
        velgAnnenMottaker: yup.boolean().required(),
        annenMottakerOrgNummer: yup.string().when('velgAnnenMottaker', (velgAnnenMottaker, schema) => {
            return velgAnnenMottaker
                ? schema
                      .required(intl.formatMessage({ id: 'validation.brevComponent.annenMottakerOrgNummer.required' }))
                      .test(
                          'is-valid-org-number',
                          intl.formatMessage({ id: 'validation.brevComponent.annenMottakerOrgNummer.invalid' }),
                          (value) => {
                              const cleanValue = value.replace(/\s/g, '');
                              return isNotValidOrgNumber(cleanValue);
                          },
                      )
                : schema.notRequired();
        }),

        overskrift: yup
            .string()
            .required(intl.formatMessage({ id: 'validation.brevComponent.tittel.required' }))
            .min(3, intl.formatMessage({ id: 'validation.brevComponent.tittel.minLength' }, { min: 3 }))
            .max(200, intl.formatMessage({ id: 'validation.brevComponent.tittel.maxLength' }, { max: 200 })),
        brødtekst: yup
            .string()
            .required(intl.formatMessage({ id: 'validation.brevComponent.brødtekst.required' }))
            .min(3, intl.formatMessage({ id: 'validation.brevComponent.brødtekst.minLength' }, { min: 3 }))
            .max(10000, intl.formatMessage({ id: 'validation.brevComponent.brødtekst.maxLength' }, { max: 10000 })),
    }) as yup.ObjectSchema<IBrevForm>;
};

export const validateBrevmalkode = () => {
    const intl = useIntl();

    return yup.string().required(intl.formatMessage({ id: 'validation.brevComponent.brevmalkode.required' }));
};

export const validateMottaker = () => {
    const intl = useIntl();

    return yup.string().required(intl.formatMessage({ id: 'validation.brevComponent.mottaker.required' }));
};

export const validateAnnenMottakerOrgNummer = () => {
    const intl = useIntl();

    return yup
        .string()
        .required(intl.formatMessage({ id: 'validation.brevComponent.annenMottakerOrgNummer.required' }))
        .test(
            'is-valid-org-number',
            intl.formatMessage({ id: 'validation.brevComponent.annenMottakerOrgNummer.invalid' }),
            (value) => {
                const cleanValue = value.replace(/\s/g, '');
                return isNotValidOrgNumber(cleanValue);
            },
        );
};

export const validateOverskrift = () => {
    const intl = useIntl();

    return yup
        .string()
        .required(intl.formatMessage({ id: 'validation.brevComponent.tittel.required' }))
        .min(3, intl.formatMessage({ id: 'validation.brevComponent.tittel.minLength' }, { min: 3 }))
        .max(200, intl.formatMessage({ id: 'validation.brevComponent.tittel.maxLength' }, { max: 200 }));
};

export const validateBrødtekst = () => {
    const intl = useIntl();

    return yup
        .string()
        .required(intl.formatMessage({ id: 'validation.brevComponent.brødtekst.required' }))
        .min(3, intl.formatMessage({ id: 'validation.brevComponent.brødtekst.minLength' }, { min: 3 }))
        .max(10000, intl.formatMessage({ id: 'validation.brevComponent.brødtekst.maxLength' }, { max: 10000 }));
};
