/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { Field, FieldProps, FormikValues, useFormikContext } from 'formik';
import { AlertStripeAdvarsel } from 'nav-frontend-alertstriper';
import Panel from 'nav-frontend-paneler';
import { Input } from 'nav-frontend-skjema';
import { Heading, Alert } from '@navikt/ds-react';
import DateInput from 'app/components/skjema/DateInput';
import { IntlShape, useIntl } from 'react-intl';
import VerticalSpacer from 'app/components/VerticalSpacer';
import RadioPanelGruppeFormik from 'app/components/formikInput/RadioPanelGruppeFormik';
import { IOMPUTSoknad } from 'app/omsorgspenger-utbetaling/types/OMPUTSoknad';
import { JaNeiIkkeRelevant } from '../../../models/enums/JaNeiIkkeRelevant';
import intlHelper from '../../../utils/intlUtils';
import './opplysningerOmOMPUTSoknad.less';

interface IOwnProps {
    intl: IntlShape;
    signert: JaNeiIkkeRelevant | null;
}

const OpplysningerOmOMPUTSoknad: React.FunctionComponent<IOwnProps> = () => {
    const { values } = useFormikContext<IOMPUTSoknad>();
    const intl = useIntl();

    return (
        <>
            <Heading size="small">Omsorgspengeutbetaling</Heading>
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
                            />
                        )}
                    </Field>
                </div>
                <RadioPanelGruppeFormik
                    legend={intlHelper(intl, 'ident.signatur.etikett')}
                    name="metadata.signatur"
                    options={Object.values(JaNeiIkkeRelevant).map((jn) => ({
                        label: intlHelper(intl, jn),
                        value: jn,
                    }))}
                />
                {values.metadata.signatur === JaNeiIkkeRelevant.NEI && (
                    <AlertStripeAdvarsel>{intlHelper(intl, 'skjema.usignert.info')}</AlertStripeAdvarsel>
                )}
            </Panel>
        </>
    );
};
export default OpplysningerOmOMPUTSoknad;
