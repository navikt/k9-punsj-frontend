import { Field, FieldProps, FormikValues } from 'formik';
import { CheckboksPanel } from 'nav-frontend-skjema';
import React from 'react';
import { IntlShape } from 'react-intl';

import { HelpText } from '@navikt/ds-react';

import intlHelper from 'app/utils/intlUtils';

import VerticalSpacer from '../vertical-spacer/VerticalSpacer';

type OwnProps = {
    intl: IntlShape;
};

const IkkeRegistrerteOpplysninger = ({ intl }: OwnProps) => (
    <>
        <p className="ikkeregistrert">{intlHelper(intl, 'skjema.ikkeregistrert')}</p>
        <div className="flex-container">
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
                            {intlHelper(intl, 'skjema.medisinskeopplysninger.omsorgspenger-ks.hjelpetekst')}
                        </HelpText>
                    </>
                )}
            </Field>
        </div>
        <VerticalSpacer eightPx />
        <div className="flex-container">
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
                            {intlHelper(intl, 'skjema.opplysningerikkepunsjet.hjelpetekst')}
                        </HelpText>
                    </>
                )}
            </Field>
        </div>
    </>
);

export default IkkeRegistrerteOpplysninger;
