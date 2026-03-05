import { Field, FieldProps, FormikValues } from 'formik';
import React from 'react';
import { IntlShape } from 'react-intl';

import { HelpText } from '@navikt/ds-react';
import { LegacyCheckbox } from 'app/components/legacy-form-compat/checkbox';

import intlHelper from 'app/utils/intlUtils';

import VerticalSpacer from '../VerticalSpacer';

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
                        <LegacyCheckbox
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
                        <LegacyCheckbox
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
