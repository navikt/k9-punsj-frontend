/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { Field, FieldProps, FormikValues } from 'formik';
import { AlertStripeAdvarsel } from 'nav-frontend-alertstriper';
import Panel from 'nav-frontend-paneler';
import { Input, RadioPanelGruppe } from 'nav-frontend-skjema';
import { Heading, Alert } from '@navikt/ds-react';
import DateInput from 'app/components/skjema/DateInput';
import { IntlShape } from 'react-intl';
import VerticalSpacer from 'app/components/VerticalSpacer';
import { JaNeiIkkeRelevant } from '../../../models/enums/JaNeiIkkeRelevant';
import intlHelper from '../../../utils/intlUtils';
import './opplysningerOmOMPMASoknad.less';

interface IOwnProps {
    intl: IntlShape;
    setSignaturAction: (signert: JaNeiIkkeRelevant | null) => void;
    signert: JaNeiIkkeRelevant | null;
    handleBlur: (e: any) => void;
}

const OpplysningerOmOMPMASoknad: React.FunctionComponent<IOwnProps> = ({
    intl,
    setSignaturAction,
    signert,
    handleBlur,
}) => (
    <>
        <Heading size="small">Omsorgsdager - Midlertidig alene om omsorgen</Heading>
        <VerticalSpacer sixteenPx />
        <Panel border>
            <Alert variant="info" className="alert">
                {intlHelper(intl, 'skjema.mottakelsesdato.informasjon')}
            </Alert>
            <div className="input-row">
                <Field name="mottattDato">
                    {({ field, meta, form }: FieldProps<string, FormikValues>) => (
                        <DateInput
                            id="soknad-dato"
                            label={intlHelper(intl, 'skjema.mottakelsesdato')}
                            errorMessage={meta.touched && meta.error}
                            value={field.value}
                            onBlur={(e) => handleBlur(() => field.onBlur(e))}
                            onChange={(value) => form.setFieldValue('mottattDato', value)}
                        />
                    )}
                </Field>
                <Field name="klokkeslett">
                    {({ field, meta, form }: FieldProps<string, FormikValues>) => (
                        <Input
                            id="klokkeslett"
                            type="time"
                            className="klokkeslett"
                            label={intlHelper(intl, 'skjema.mottatt.klokkeslett')}
                            feil={meta.touched && meta.error}
                            {...field}
                            onChange={(e) => form.setFieldValue('klokkeslett', e.target.value)}
                            onBlur={(e) => handleBlur(() => field.onBlur(e))}
                        />
                    )}
                </Field>
            </div>
            <RadioPanelGruppe
                className="horizontalRadios"
                radios={Object.values(JaNeiIkkeRelevant).map((jn) => ({
                    label: intlHelper(intl, jn),
                    value: jn,
                }))}
                name="signatur"
                legend={intlHelper(intl, 'ident.signatur.etikett')}
                checked={signert || undefined}
                onChange={(event) =>
                    setSignaturAction(((event.target as HTMLInputElement).value as JaNeiIkkeRelevant) || null)
                }
            />
            {signert === JaNeiIkkeRelevant.NEI && (
                <AlertStripeAdvarsel>{intlHelper(intl, 'skjema.usignert.info')}</AlertStripeAdvarsel>
            )}
        </Panel>
    </>
);
export default OpplysningerOmOMPMASoknad;
