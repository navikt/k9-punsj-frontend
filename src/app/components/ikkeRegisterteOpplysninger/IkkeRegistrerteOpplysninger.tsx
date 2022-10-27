import React from 'react';
import intlHelper from 'app/utils/intlUtils';
import { IntlShape } from 'react-intl';
import { Field, FieldProps, FormikValues } from 'formik';
import Hjelpetekst from 'nav-frontend-hjelpetekst';
import { PopoverOrientering } from 'nav-frontend-popover';
import { CheckboksPanel } from 'nav-frontend-skjema';
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
                        <CheckboksPanel
                            id="medisinskeopplysningercheckbox"
                            label={intlHelper(intl, 'skjema.medisinskeopplysninger')}
                            checked={!!field.value}
                            {...field}
                            value=""
                        />
                        <Hjelpetekst className="hjelpetext" type={PopoverOrientering.OverHoyre}>
                            {intlHelper(intl, 'skjema.medisinskeopplysninger.omsorgspenger-ks.hjelpetekst')}
                        </Hjelpetekst>
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
                        <Hjelpetekst className="hjelpetext" type={PopoverOrientering.OverHoyre}>
                            {intlHelper(intl, 'skjema.opplysningerikkepunsjet.hjelpetekst')}
                        </Hjelpetekst>
                    </>
                )}
            </Field>
        </div>
    </>
);

export default IkkeRegistrerteOpplysninger;
