import React from 'react';

import { Field, FieldProps, FormikValues, useField, useFormikContext } from 'formik';
import { FormattedMessage, useIntl } from 'react-intl';
import { Alert, Box, Heading, TextField } from '@navikt/ds-react';

import { LegacyJaNeiIkkeRelevantRadioGroup } from 'app/components/legacy-form-compat/radio';
import FieldErrorMessages from 'app/components/skjema/FieldErrorMessages';
import DatovelgerFormik from 'app/components/skjema/Datovelger/DatovelgerFormik';
import VerticalSpacer from 'app/components/VerticalSpacer';
import { JaNeiIkkeRelevant } from '../../../models/enums/JaNeiIkkeRelevant';
import intlHelper from '../../../utils/intlUtils';

interface Props {
    signert: JaNeiIkkeRelevant | null;

    setSignaturAction: (signert: JaNeiIkkeRelevant | null) => void;
    handleBlur: (e: any) => void;
}

const OpplysningerOmOMPMASoknad: React.FC<Props> = ({ signert, setSignaturAction, handleBlur }) => {
    const intl = useIntl();
    const { submitCount } = useFormikContext<FormikValues>();
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
        <>
            <Heading size="small">
                <FormattedMessage id={'omsorgspenger.midlertidigAlene.punchForm.tittel'} />
            </Heading>
            <VerticalSpacer sixteenPx />
            <Box padding="space-16" borderWidth="1" borderRadius="8">
                <Alert variant="info" className="mt-4">
                    <FormattedMessage id={'skjema.mottakelsesdato.informasjon'} />
                </Alert>

                <div className="flex flex-col gap-2">
                    <div className="input-row">
                        <DatovelgerFormik
                            id="soknad-dato"
                            name="mottattDato"
                            label={intlHelper(intl, 'skjema.mottakelsesdato')}
                            visFeilmelding={false}
                            errorAriaDescribedBy={mottattDatoErrorMessage ? mottattDatoErrorId : undefined}
                            onErrorMessageChange={setDateLocalError}
                            onValueBlur={(value) => handleBlur(() => {}, { mottattDato: value })}
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
                                            className="ml-4"
                                            label={intlHelper(intl, 'skjema.mottatt.klokkeslett')}
                                            error={!!klokkeslettErrorMessage}
                                            aria-describedby={
                                                klokkeslettErrorMessage ? klokkeslettErrorId : undefined
                                            }
                                            {...field}
                                            onChange={(e) => form.setFieldValue('klokkeslett', e.target.value)}
                                            onBlur={(e) => handleBlur(() => field.onBlur(e))}
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

                <LegacyJaNeiIkkeRelevantRadioGroup
                    className="horizontalRadios"
                    name="signatur"
                    legend={intlHelper(intl, 'ident.signatur.etikett')}
                    checked={signert || undefined}
                    onChange={(_, value) => setSignaturAction(value || null)}
                />

                {signert === JaNeiIkkeRelevant.NEI && (
                    <Alert size="small" variant="warning">
                        <FormattedMessage id={'skjema.usignert.info'} />
                    </Alert>
                )}
            </Box>
        </>
    );
};

export default OpplysningerOmOMPMASoknad;
