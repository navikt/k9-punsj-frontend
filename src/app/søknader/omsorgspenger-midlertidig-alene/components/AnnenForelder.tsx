import React, { useEffect } from 'react';

import { Field, FieldProps, FormikValues, useFormikContext } from 'formik';
import { FormattedMessage } from 'react-intl';
import { BodyShort, Box, Heading, Label, Select, Textarea } from '@navikt/ds-react';
import set from 'lodash/set';

import VerticalSpacer from 'app/components/VerticalSpacer';
import CheckboxFormik from 'app/components/formikInput/CheckboxFormik';
import { OMPMASoknad } from '../types/OMPMASoknad';
import DatoInputFormikNew from 'app/components/formikInput/DatoInputFormikNew';

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
                set({ ...values }, 'annenForelder.periode.tom', ''),
            );
        }
    }, [tilOgMedErIkkeOppgitt, values.annenForelder.periode.tom]);

    return (
        <>
            <Heading size="xsmall" spacing>
                <FormattedMessage id="omsorgspenger.midlertidigAlene.annenForelder.tittel" />
            </Heading>

            <Box padding="4" borderWidth="1" borderRadius="medium">
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

                <div className="flex">
                    <div className="min-w-[250px] mr-4">
                        <DatoInputFormikNew
                            label="Fra og med"
                            name="annenForelder.periode.fom"
                            handleBlur={handleBlur}
                        />
                    </div>
                    <div className="min-w-[250px]">
                        <DatoInputFormikNew
                            label="Til og med"
                            name="annenForelder.periode.tom"
                            disabled={values.annenForelder.periode.tilOgMedErIkkeOppgitt}
                            handleBlur={handleBlur}
                        />
                    </div>
                </div>

                {!situasjonstypeErFengselEllerVerneplikt && (
                    <CheckboxFormik name="annenForelder.periode.tilOgMedErIkkeOppgitt" size="small">
                        <FormattedMessage id="omsorgspenger.midlertidigAlene.annenForelder.periode.tilOgMedErIkkeOppgitt" />
                    </CheckboxFormik>
                )}
            </Box>
        </>
    );
};

export default AnnenForelder;
