import React, { useState } from 'react';

import { Field, FieldProps, FormikValues, useField, useFormikContext } from 'formik';
import { FormattedMessage, useIntl } from 'react-intl';
import { Alert, Box, Heading, TextField, VStack } from '@navikt/ds-react';

import FieldErrorMessages from 'app/components/skjema/FieldErrorMessages';
import { JaNeiIkkeRelevant } from 'app/models/enums/JaNeiIkkeRelevant';
import { PunchFormPaneler } from 'app/models/enums/PunchFormPaneler';
import intlHelper from 'app/utils/intlUtils';
import DatoVelgerFormik from 'app/components/skjema/Datovelger/DatovelgerFormik';
import { LegacyJaNeiIkkeRelevantRadioGroup } from 'app/components/legacy-form-compat/radio';

const OpplysningerOmSoknad: React.FC = () => {
    const intl = useIntl();
    const [signert, setSignert] = useState<JaNeiIkkeRelevant | ''>('');
    const { submitCount } = useFormikContext<FormikValues>();
    const [, mottattDatoMeta] = useField('mottattDato');
    const [dateLocalError, setDateLocalError] = useState<string | undefined>(undefined);
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
                    <FormattedMessage id={PunchFormPaneler.OPPLYSINGER_OM_SOKNAD} />
                </Heading>
                <Alert size="small" variant="info">
                    <FormattedMessage id="skjema.mottakelsesdato.informasjon" />
                </Alert>
                <div className="flex flex-col gap-2">
                    <div className="input-row">
                        <DatoVelgerFormik
                            id="soknad-dato"
                            name="mottattDato"
                            label="Mottatt dato"
                            size="small"
                            visFeilmelding={false}
                            errorAriaDescribedBy={mottattDatoErrorMessage ? mottattDatoErrorId : undefined}
                            onErrorMessageChange={setDateLocalError}
                        />

                        <Field name="klokkeslett">
                            {({ field, meta, form }: FieldProps<string, FormikValues>) => {
                                const klokkeslettErrorMessage =
                                    (meta.touched || submitCount > 0) && typeof meta.error === 'string'
                                        ? meta.error
                                        : undefined;

                                return (
                                    <div>
                                        <TextField
                                            id="klokkeslett"
                                            type="time"
                                            className="klokkeslett"
                                            label={intlHelper(intl, 'skjema.mottatt.klokkeslett')}
                                            size="small"
                                            error={!!klokkeslettErrorMessage}
                                            aria-describedby={klokkeslettErrorMessage ? klokkeslettErrorId : undefined}
                                            {...field}
                                            onChange={(e) => form.setFieldValue('klokkeslett', e.target.value)}
                                        />
                                    </div>
                                );
                            }}
                        </Field>
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
                                            label: 'Mottatt dato',
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
                <LegacyJaNeiIkkeRelevantRadioGroup
                    className="horizontalRadios"
                    name="signatur"
                    legend={intlHelper(intl, 'ident.signatur.etikett')}
                    checked={signert || undefined}
                    onChange={(_, value) => {
                        setSignert(value);
                    }}
                />
                {signert === JaNeiIkkeRelevant.NEI && (
                    <Alert size="small" variant="warning">
                        <FormattedMessage id="skjema.usignert.info" />
                    </Alert>
                )}
            </VStack>
        </Box>
    );
};
export default OpplysningerOmSoknad;
