import React from 'react';

import { Field, FieldProps, FormikValues, useFormikContext } from 'formik';
import { FormattedMessage, useIntl } from 'react-intl';
import { Alert, Box, TextField } from '@navikt/ds-react';

import RadioPanelGruppeFormik from 'app/components/formikInput/RadioPanelGruppeFormik';
import Datovelger from 'app/components/skjema/Datovelger/Datovelger';
import { IOMPAOSoknad } from 'app/søknader/omsorgspenger-alene-om-omsorgen/types/OMPAOSoknad';
import { JaNeiIkkeRelevant } from '../../../../models/enums/JaNeiIkkeRelevant';
import intlHelper from '../../../../utils/intlUtils';

const OpplysningerOmOMPAOSoknad: React.FunctionComponent = () => {
    const intl = useIntl();

    const { values } = useFormikContext<IOMPAOSoknad>();

    return (
        <Box padding="4" borderWidth="1" borderRadius="small" className="mt-4">
            <Alert variant="info" className="alert">
                <FormattedMessage id="skjema.mottakelsesdato.informasjon" />
            </Alert>

            <div className="input-row">
                <Field name="mottattDato">
                    {({ field, meta, form }: FieldProps<string, FormikValues>) => (
                        <Datovelger
                            id="soknad-dato"
                            label={intlHelper(intl, 'skjema.mottakelsesdato')}
                            errorMessage={meta.touched && meta.error}
                            value={field.value}
                            selectedDay={field.value}
                            onChange={(value: string) => form.setFieldValue('mottattDato', value)}
                            onBlur={() => form.setFieldTouched('mottattDato', true)}
                        />
                    )}
                </Field>

                <div className="ml-4">
                    <Field name="klokkeslett">
                        {({ field, meta, form }: FieldProps<string, FormikValues>) => (
                            <TextField
                                id="klokkeslett"
                                type="time"
                                label={intlHelper(intl, 'skjema.mottatt.klokkeslett')}
                                error={meta.touched && meta.error}
                                {...field}
                                onChange={(e) => form.setFieldValue('klokkeslett', e.target.value)}
                            />
                        )}
                    </Field>
                </div>
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
                    <FormattedMessage id="skjema.usignert.info" />
                </Alert>
            )}
        </Box>
    );
};
export default OpplysningerOmOMPAOSoknad;
