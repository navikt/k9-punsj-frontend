import React from 'react';

import { Field, FieldProps, FormikValues, useField, useFormikContext } from 'formik';
import { FormattedMessage, useIntl } from 'react-intl';
import { Alert, Box, Heading, TextField, VStack } from '@navikt/ds-react';
import { LegacyJaNeiIkkeRelevantRadioGroup } from 'app/components/legacy-form-compat/radio';
import FieldErrorMessages from 'app/components/skjema/FieldErrorMessages';
import DatovelgerFormik from 'app/components/skjema/Datovelger/DatovelgerFormik';
import { IOMPUTSoknad } from 'app/søknader/omsorgspenger-utbetaling/types/OMPUTSoknad';
import { JaNeiIkkeRelevant } from '../../../../models/enums/JaNeiIkkeRelevant';
import intlHelper from '../../../../utils/intlUtils';

const OpplysningerOmOMPUTSoknad: React.FC = () => {
    const intl = useIntl();

    const { values, submitCount, setFieldValue } = useFormikContext<IOMPUTSoknad>();
    const [, mottattDatoMeta] = useField('mottattDato');
    const [dateLocalError, setDateLocalError] = React.useState<string | undefined>(undefined);
    const mottattDatoErrorId = 'soknad-dato-error';
    const klokkeslettErrorId = 'klokkeslett-error';
    const mottattDatoErrorMessage =
        dateLocalError ||
        ((mottattDatoMeta.touched || submitCount > 0) && typeof mottattDatoMeta.error === 'string'
            ? mottattDatoMeta.error
            : undefined);

    return (
        <Box padding="space-16" borderWidth="1" borderRadius="8" className="opplysninger-om-soknaden-panel">
            <VStack gap="space-16">
                <Heading size="small" level="3">
                    <FormattedMessage id="skjema.opplysningeromsoknad" />
                </Heading>

                <Alert size="small" variant="info">
                    <FormattedMessage id="skjema.mottakelsesdato.informasjon" />
                </Alert>

                <div className="flex flex-col gap-2">
                    <div className="input-row">
                        <DatovelgerFormik
                            id="soknad-dato"
                            name="mottattDato"
                            label={intlHelper(intl, 'skjema.mottakelsesdato')}
                            size="small"
                            visFeilmelding={false}
                            errorAriaDescribedBy={mottattDatoErrorMessage ? mottattDatoErrorId : undefined}
                            onErrorMessageChange={setDateLocalError}
                        />

                        <div>
                            <Field name="klokkeslett">
                                {({ field, meta, form }: FieldProps<string, FormikValues>) => {
                                    const klokkeslettErrorMessage =
                                        (meta.touched || submitCount > 0) && typeof meta.error === 'string'
                                            ? meta.error
                                            : undefined;

                                    return (
                                        <TextField
                                            id="klokkeslett"
                                            type="time"
                                            className="klokkeslett"
                                            label={intlHelper(intl, 'skjema.mottatt.klokkeslett')}
                                            size="small"
                                            error={!!klokkeslettErrorMessage}
                                            aria-describedby={
                                                klokkeslettErrorMessage ? klokkeslettErrorId : undefined
                                            }
                                            {...field}
                                            onChange={(e) => form.setFieldValue('klokkeslett', e.target.value)}
                                        />
                                    );
                                }}
                            </Field>
                        </div>
                    </div>
                    <Field name="klokkeslett">
                        {({ meta }: FieldProps<string, FormikValues>) => {
                            const klokkeslettErrorMessage =
                                (meta.touched || submitCount > 0) && typeof meta.error === 'string'
                                    ? meta.error
                                    : undefined;

                            return (
                                <FieldErrorMessages
                                    items={[
                                        {
                                            id: mottattDatoErrorId,
                                            label: intlHelper(intl, 'skjema.mottakelsesdato'),
                                            message: mottattDatoErrorMessage,
                                            ariaDescribedBy: 'soknad-dato',
                                        },
                                        {
                                            id: klokkeslettErrorId,
                                            label: intlHelper(intl, 'skjema.mottatt.klokkeslett'),
                                            message: klokkeslettErrorMessage,
                                            ariaDescribedBy: 'klokkeslett',
                                        },
                                    ]}
                                />
                            );
                        }}
                    </Field>
                </div>

                {!values.erKorrigering && (
                    <LegacyJaNeiIkkeRelevantRadioGroup
                        className="horizontalRadios"
                        legend={intlHelper(intl, 'ident.signatur.etikett')}
                        name="signatur"
                        checked={
                            values.metadata.signatur
                                ? (values.metadata.signatur as JaNeiIkkeRelevant)
                                : undefined
                        }
                        onChange={(_, value) => setFieldValue('metadata.signatur', value || null)}
                    />
                )}

                {values.metadata.signatur === JaNeiIkkeRelevant.NEI && (
                    <Alert size="small" variant="warning">
                        <FormattedMessage id="skjema.usignert.info" />
                    </Alert>
                )}
            </VStack>
        </Box>
    );
};

export default OpplysningerOmOMPUTSoknad;
