import React from 'react';
import { Field, FieldProps, FormikValues } from 'formik';
import { CheckboksPanel } from 'nav-frontend-skjema';
import { FormattedMessage, IntlShape, useIntl } from 'react-intl';
import { Heading, HelpText } from '@navikt/ds-react';
import intlHelper from 'app/utils/intlUtils';

const IkkeRegistrerteOpplysninger = () => {
    const intl = useIntl();

    return (
        <>
            <Heading level="2" size="xsmall">
                <FormattedMessage id={'skjema.ikkeregistrert'} />
            </Heading>

            <div className="flex-container mt-4">
                <Field name="harMedisinskeOpplysninger">
                    {({ field }: FieldProps<FormikValues>) => (
                        <>
                            <CheckboksPanel
                                id="medisinskeopplysningercheckbox"
                                label={intlHelper(intl, 'skjema.medisinskeopplysninger')}
                                checked={!!field.value}
                                {...field}
                                value=""
                            />
                            <HelpText className="hjelpetext" placement="top-end">
                                <FormattedMessage id={`skjema.medisinskeopplysninger.omsorgspenger-ks.hjelpetekst`} />
                            </HelpText>
                        </>
                    )}
                </Field>
            </div>

            <div className="flex-container mt-4">
                <Field name="harInfoSomIkkeKanPunsjes">
                    {({ field }: FieldProps<FormikValues>) => (
                        <>
                            <CheckboksPanel
                                id="opplysningerikkepunsjetcheckbox"
                                label={intlHelper(intl, 'skjema.opplysningerikkepunsjet')}
                                checked={!!field.value}
                                {...field}
                                value=""
                            />
                            <HelpText className="hjelpetext" placement="top-end">
                                <FormattedMessage id={`skjema.opplysningerikkepunsjet.hjelpetekst`} />
                            </HelpText>
                        </>
                    )}
                </Field>
            </div>
        </>
    );
};

export default IkkeRegistrerteOpplysninger;
