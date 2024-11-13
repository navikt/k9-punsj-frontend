import React from 'react';

import { Field, FieldProps, FormikValues, useFormikContext } from 'formik';
import { FormattedMessage, useIntl } from 'react-intl';
import { Alert, Box, Heading, TextField } from '@navikt/ds-react';
import VerticalSpacer from 'app/components/VerticalSpacer';
import RadioPanelGruppeFormik from 'app/components/formikInput/RadioPanelGruppeFormik';
import NewDateInput from 'app/components/skjema/NewDateInput/NewDateInput';
import { IOMPUTSoknad } from 'app/søknader/omsorgspenger-utbetaling/types/OMPUTSoknad';
import { JaNeiIkkeRelevant } from '../../../../models/enums/JaNeiIkkeRelevant';
import intlHelper from '../../../../utils/intlUtils';

import './opplysningerOmOMPUTSoknad.less';

const OpplysningerOmOMPUTSoknad: React.FC = () => {
    const intl = useIntl();

    const { values } = useFormikContext<IOMPUTSoknad>();

    return (
        <>
            <Heading size="small">
                <FormattedMessage id={'omsorgspenger.utbetaling.punchForm.header'} />
            </Heading>

            <VerticalSpacer sixteenPx />

            <Box padding="4" borderWidth="1" borderRadius="small">
                <Alert variant="info" className="alert">
                    <FormattedMessage id={'skjema.mottakelsesdato.informasjon'} />
                </Alert>

                <div className="input-row">
                    <Field name="mottattDato">
                        {({ field, meta, form }: FieldProps<string, FormikValues>) => (
                            <NewDateInput
                                id="soknad-dato"
                                label={intlHelper(intl, 'skjema.mottakelsesdato')}
                                errorMessage={meta.touched && meta.error}
                                value={field.value}
                                onChange={(value: string) => form.setFieldValue('mottattDato', value)}
                            />
                        )}
                    </Field>

                    <div>
                        <Field name="klokkeslett">
                            {({ field, meta, form }: FieldProps<string, FormikValues>) => (
                                <TextField
                                    id="klokkeslett"
                                    type="time"
                                    className="klokkeslett"
                                    // size="small"
                                    label={intlHelper(intl, 'skjema.mottatt.klokkeslett')}
                                    error={meta.touched && meta.error}
                                    {...field}
                                    onChange={(e) => form.setFieldValue('klokkeslett', e.target.value)}
                                />
                            )}
                        </Field>
                    </div>
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
                        <FormattedMessage id={'skjema.usignert.info'} />
                    </Alert>
                )}
            </Box>
        </>
    );
};

export default OpplysningerOmOMPUTSoknad;
