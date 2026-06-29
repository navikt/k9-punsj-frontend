import React, { useEffect } from 'react';

import { Field, FieldProps, FormikValues, useFormikContext } from 'formik';
import { FormattedMessage } from 'react-intl';
import { BodyShort, Box, Heading, Label, Select, Textarea, VStack } from '@navikt/ds-react';
import cloneDeep from 'lodash/cloneDeep';
import set from 'lodash/set';

import VerticalSpacer from 'app/components/VerticalSpacer';
import CheckboxFormik from 'app/components/formikInput/CheckboxFormik';
import DatovelgerFormik from 'app/components/skjema/Datovelger/DatovelgerFormik';
import { OMPMASoknad } from '../types/OMPMASoknad';

const situasjonstyper = {
    INNLAGT_I_HELSEINSTITUSJON: 'INNLAGT_I_HELSEINSTITUSJON',
    UTØVER_VERNEPLIKT: 'UTØVER_VERNEPLIKT',
    FENGSEL: 'FENGSEL',
    SYKDOM: 'SYKDOM',
    ANNET: 'ANNET',
};

interface Props {
    handleBlur: (callback: () => void, values?: FormikValues) => void;
}

const AnnenForelder = ({ handleBlur }: Props) => {
    const { values, setFieldValue, setFieldTouched } = useFormikContext<OMPMASoknad>();

    const situasjonstype = values.annenForelder.situasjonType;

    const { tilOgMedErIkkeOppgitt } = values.annenForelder.periode;

    const situasjonstypeErFengselEllerVerneplikt =
        situasjonstype === situasjonstyper.FENGSEL || situasjonstype === situasjonstyper.UTØVER_VERNEPLIKT;

    useEffect(() => {
        if (situasjonstypeErFengselEllerVerneplikt && tilOgMedErIkkeOppgitt) {
            setFieldValue('annenForelder.periode.tilOgMedErIkkeOppgitt', false);
        }
    }, [situasjonstypeErFengselEllerVerneplikt, tilOgMedErIkkeOppgitt]);

    useEffect(() => {
        if (tilOgMedErIkkeOppgitt && values.annenForelder.periode.tom) {
            setFieldValue('annenForelder.periode.tom', '');
            handleBlur(
                () => setFieldTouched('annenForelder.periode.tom'),
                set(cloneDeep(values), 'annenForelder.periode.tom', ''),
            );
        }
    }, [tilOgMedErIkkeOppgitt, values.annenForelder.periode.tom]);

    return (
        <Box padding="space-16" borderWidth="1" borderRadius="8" className="opplysninger-om-soknaden-panel">
            <VStack gap="space-16">
                <Heading size="small" level="3">
                    <FormattedMessage id="omsorgspenger.midlertidigAlene.annenForelder.tittel" />
                </Heading>

                <Box padding="space-16" borderRadius="8" background="neutral-soft">
                    <Label size="small">
                        <FormattedMessage id="omsorgspenger.midlertidigAlene.annenForelder.fnr.label" />
                    </Label>

                    <BodyShort>{values.annenForelder.norskIdent}</BodyShort>

                    <VerticalSpacer twentyPx />

                    <Field name="annenForelder.situasjonType">
                        {({ field, meta }: FieldProps<string>) => (
                            <Select
                                {...field}
                                size="small"
                                label="Hva er situasjonen til den andre forelderen?"
                                error={meta.touched && meta.error}
                                onBlur={(e) => handleBlur(() => field.onBlur(e))}
                                className="max-w-[250px]"
                            >
                                <option value="">Velg situasjon</option>
                                {Object.values(situasjonstyper).map((v) => (
                                    <option value={v} key={v}>
                                        <FormattedMessage id={`omsorgspenger.midlertidigAlene.situasjonstyper.${v}`} />
                                    </option>
                                ))}
                            </Select>
                        )}
                    </Field>

                    <VerticalSpacer twentyPx />

                    <Field name="annenForelder.situasjonBeskrivelse">
                        {({ field, meta }: FieldProps<string, FormikValues>) => (
                            <Textarea
                                {...field}
                                size="small"
                                label="Beskrivelse av situasjonen"
                                error={meta.touched && meta.error}
                                onBlur={(e) => handleBlur(() => field.onBlur(e))}
                                className="max-w-[600px]"
                            />
                        )}
                    </Field>

                    <VerticalSpacer twentyPx />

                    <div className="flex items-start">
                        <DatovelgerFormik
                            label="Fra og med"
                            name="annenForelder.periode.fom"
                            size="small"
                            handleBlur={handleBlur}
                        />
                        <DatovelgerFormik
                            label="Til og med"
                            name="annenForelder.periode.tom"
                            className="ml-4"
                            size="small"
                            disabled={values.annenForelder.periode.tilOgMedErIkkeOppgitt}
                            handleBlur={handleBlur}
                        />
                    </div>

                    {!situasjonstypeErFengselEllerVerneplikt && (
                        <CheckboxFormik name="annenForelder.periode.tilOgMedErIkkeOppgitt" size="small">
                            <FormattedMessage id="omsorgspenger.midlertidigAlene.annenForelder.periode.tilOgMedErIkkeOppgitt" />
                        </CheckboxFormik>
                    )}
                </Box>
            </VStack>
        </Box>
    );
};

export default AnnenForelder;
