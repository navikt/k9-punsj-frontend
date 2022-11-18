/* eslint-disable react/jsx-props-no-spreading */
import { Alert, Heading, Panel } from '@navikt/ds-react';
import RadioPanelGruppeFormik from 'app/components/formikInput/RadioPanelGruppeFormik';
import DateInput from 'app/components/skjema/DateInput';
import VerticalSpacer from 'app/components/VerticalSpacer';
import { IOMPUTSoknad } from 'app/omsorgspenger-utbetaling/types/OMPUTSoknad';
import { Field, FieldProps, FormikValues, useFormikContext } from 'formik';
import { Input } from 'nav-frontend-skjema';
import React from 'react';
import { useIntl } from 'react-intl';
import { JaNeiIkkeRelevant } from '../../../models/enums/JaNeiIkkeRelevant';
import intlHelper from '../../../utils/intlUtils';
import './opplysningerOmOMPUTSoknad.less';

const OpplysningerOmOMPUTSoknad: React.FunctionComponent = () => {
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
                                onChange={(value: string) => form.setFieldValue('mottattDato', value)}
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
                {!values.erKorrigering && (
                    <RadioPanelGruppeFormik
                        legend={intlHelper(intl, 'ident.signatur.etikett')}
                        name="metadata.signatur"
                        options={Object.values(JaNeiIkkeRelevant).map((jn) => ({
                            label: intlHelper(intl, jn),
                            value: jn,
                        }))}
                    />
                )}
                {values.metadata.signatur === JaNeiIkkeRelevant.NEI && (
                    <Alert size="small" variant="warning">
                        {intlHelper(intl, 'skjema.usignert.info')}
                    </Alert>
                )}
            </Panel>
        </>
    );
};
export default OpplysningerOmOMPUTSoknad;
