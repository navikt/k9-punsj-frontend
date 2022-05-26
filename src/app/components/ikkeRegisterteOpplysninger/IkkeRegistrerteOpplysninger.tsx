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
    handleBlur: any;
};

const IkkeRegistrerteOpplysninger = ({ intl, handleBlur }: OwnProps) => (
    <>
        <p className="ikkeregistrert">{intlHelper(intl, 'skjema.ikkeregistrert')}</p>
        <div className="flex-container">
            <Field name="harMedisinskeOpplysninger">
                {({ field, form }: FieldProps<FormikValues>) => (
                    <>
                        <CheckboksPanel
                            id="medisinskeopplysningercheckbox"
                            label={intlHelper(intl, 'skjema.medisinskeopplysninger')}
                            checked={!!form.values.harMedisinskeOpplysninger}
                            {...field}
                            onChange={(e) => handleBlur(() => field.onChange(e))}
                            value=""
                        />
                        <Hjelpetekst className="hjelpetext" type={PopoverOrientering.OverHoyre} tabIndex={-1}>
                            {intlHelper(intl, 'skjema.medisinskeopplysninger.omsorgspenger-ks.hjelpetekst')}
                        </Hjelpetekst>
                    </>
                )}
            </Field>
        </div>
        <VerticalSpacer eightPx />
        <div className="flex-container">
            <Field name="harInfoSomIkkeKanPunsjes">
                {({ field, form }: FieldProps<FormikValues>) => (
                    <>
                        <CheckboksPanel
                            id="opplysningerikkepunsjetcheckbox"
                            label={intlHelper(intl, 'skjema.opplysningerikkepunsjet')}
                            checked={!!form.values.harInfoSomIkkeKanPunsjes}
                            {...field}
                            onChange={(e) => handleBlur(() => field.onChange(e))}
                            value=""
                        />
                        <Hjelpetekst className="hjelpetext" type={PopoverOrientering.OverHoyre} tabIndex={-1}>
                            {intlHelper(intl, 'skjema.opplysningerikkepunsjet.hjelpetekst')}
                        </Hjelpetekst>
                    </>
                )}
            </Field>
        </div>
    </>
);

export default IkkeRegistrerteOpplysninger;
