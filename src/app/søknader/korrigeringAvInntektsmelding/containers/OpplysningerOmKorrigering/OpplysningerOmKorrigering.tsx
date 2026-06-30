import React from 'react';

import { Box, Fieldset, Heading, TextField } from '@navikt/ds-react';
import FieldErrorMessages from 'app/components/skjema/FieldErrorMessages';
import DatovelgerFormik from 'app/components/skjema/Datovelger/DatovelgerFormik';
import intlHelper from 'app/utils/intlUtils';
import { Field, FieldProps, useField, useFormikContext } from 'formik';
import { FormattedMessage, useIntl } from 'react-intl';
import { KorrigeringAvInntektsmeldingFormFields } from '../../types/KorrigeringAvInntektsmeldingFormFieldsValues';
import { klokkeslettFieldId, mottattDatoFieldId } from '../formFieldIds';

const OpplysningerOmKorrigering: React.FC = () => {
    const intl = useIntl();
    const { submitCount } = useFormikContext<any>();
    const datoFieldName = `${KorrigeringAvInntektsmeldingFormFields.OpplysningerOmKorrigering}.dato`;
    const klokkeslettFieldName = `${KorrigeringAvInntektsmeldingFormFields.OpplysningerOmKorrigering}.klokkeslett`;
    const [, mottattDatoMeta] = useField(datoFieldName);
    const [dateLocalError, setDateLocalError] = React.useState<string | undefined>(undefined);
    const mottattDatoErrorId = `${mottattDatoFieldId}-error`;
    const klokkeslettErrorId = `${klokkeslettFieldId}-error`;
    const mottattDatoErrorMessage =
        dateLocalError ||
        ((mottattDatoMeta.touched || submitCount > 0) && typeof mottattDatoMeta.error === 'string'
            ? mottattDatoMeta.error
            : undefined);

    return (
        <Fieldset
            legend={
                <Heading level="3" size="small">
                    <FormattedMessage id="skjema.opplysningeromkorrigering" />
                </Heading>
            }
            className="korrigering__seksjon"
        >
            <Box
                borderRadius="8"
                background="neutral-soft"
                className="korrigering__panelsurface listepanel opplysningerOmKorrigeringPanel"
            >
                <Heading level="4" size="xsmall" className="mb-4">
                    <FormattedMessage id="skjema.opplysningeromkorrigering.spm" />
                </Heading>

                <div className="flex flex-col gap-2">
                    <div className="input-row">
                        <DatovelgerFormik
                            name={datoFieldName}
                            id={mottattDatoFieldId}
                            label={intlHelper(intl, 'skjema.dato')}
                            visFeilmelding={false}
                            errorAriaDescribedBy={mottattDatoErrorMessage ? mottattDatoErrorId : undefined}
                            onErrorMessageChange={setDateLocalError}
                        />
                        <div className="ml-4">
                            <Field name={klokkeslettFieldName}>
                                {({ field, meta }: FieldProps) => {
                                    const klokkeslettErrorMessage =
                                        (meta.touched || submitCount > 0) && typeof meta.error === 'string'
                                            ? meta.error
                                            : undefined;

                                    return (
                                        <TextField
                                            {...field}
                                            id={klokkeslettFieldId}
                                            type="time"
                                            label={intlHelper(intl, 'skjema.mottatt.tidspunkt')}
                                            error={!!klokkeslettErrorMessage}
                                            aria-describedby={
                                                klokkeslettErrorMessage ? klokkeslettErrorId : undefined
                                            }
                                        />
                                    );
                                }}
                            </Field>
                        </div>
                    </div>
                    <Field name={klokkeslettFieldName}>
                        {({ meta }: FieldProps) => {
                            const klokkeslettErrorMessage =
                                (meta.touched || submitCount > 0) && typeof meta.error === 'string'
                                    ? meta.error
                                    : undefined;

                            return (
                                <FieldErrorMessages
                                    items={[
                                        {
                                            id: mottattDatoErrorId,
                                            label: intlHelper(intl, 'skjema.dato'),
                                            message: mottattDatoErrorMessage,
                                            ariaDescribedBy: mottattDatoFieldId,
                                        },
                                        {
                                            id: klokkeslettErrorId,
                                            label: intlHelper(intl, 'skjema.mottatt.tidspunkt'),
                                            message: klokkeslettErrorMessage,
                                            ariaDescribedBy: klokkeslettFieldId,
                                        },
                                    ]}
                                />
                            );
                        }}
                    </Field>
                </div>
            </Box>
        </Fieldset>
    );
};

export default OpplysningerOmKorrigering;
