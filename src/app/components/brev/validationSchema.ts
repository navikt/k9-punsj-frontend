import { isValidOrgNumber } from 'app/utils/getOrgNumberValidator';
import { useIntl } from 'react-intl';
import * as yup from 'yup';
import { IBrevForm } from './types';

export const getBrevComponentSchema = (errorOrgInfo?: string) => {
    const intl = useIntl();

    return yup.object<IBrevForm>().shape({
        brevmalkode: yup.string().required(intl.formatMessage({ id: 'validation.brevComponent.brevmalkode.required' })),
        mottaker: yup.string().required(intl.formatMessage({ id: 'validation.brevComponent.mottaker.required' })),
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

                              if (errorOrgInfo) {
                                  return false;
                              }

                              return isValidOrgNumber(cleanValue)
                                  ? undefined
                                  : new yup.ValidationError(
                                        intl.formatMessage({
                                            id: 'validation.brevComponent.annenMottakerOrgNummer.invalid',
                                        }),
                                    );
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
    });
};
