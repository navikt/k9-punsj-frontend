import { Field, FieldProps, FormikValues, useFormikContext } from 'formik';
import React from 'react';
import { useIntl } from 'react-intl';

import { Alert, Panel, TextField } from '@navikt/ds-react';

import VerticalSpacer from 'app/components/vertical-spacer/VerticalSpacer';
import RadioPanelGruppeFormik from 'app/components/formikInput/RadioPanelGruppeFormik';
import DateInput from 'app/components/skjema/DateInput';
import { IOMPAOSoknad } from 'app/ytelser/omsorgspenger-alene-om-omsorgen/types/OMPAOSoknad';

import { JaNeiIkkeRelevant } from 'app/models/enums/JaNeiIkkeRelevant';
import intlHelper from 'app/utils/intlUtils';
import './opplysningerOmOMPAOSoknad.less';

const OpplysningerOmOMPAOSoknad: React.FunctionComponent = () => {
    const { values } = useFormikContext<IOMPAOSoknad>();
    const intl = useIntl();

    return (
        <div className="mt-12">
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
                            <TextField
                                id="klokkeslett"
                                type="time"
                                className="klokkeslett"
                                size="small"
                                label={intlHelper(intl, 'skjema.mottatt.klokkeslett')}
                                error={meta.touched && meta.error}
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
                    <Alert size="small" variant="warning">
                        {intlHelper(intl, 'skjema.usignert.info')}
                    </Alert>
                )}
            </Panel>
        </div>
    );
};
export default OpplysningerOmOMPAOSoknad;
