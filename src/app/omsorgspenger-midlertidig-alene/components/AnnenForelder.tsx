import { Field, FieldProps, FormikValues, useFormikContext } from 'formik';
import set from 'lodash/set';
import React, { useEffect } from 'react';
import { IntlShape } from 'react-intl';
import { BodyShort, Heading, Label, Select, Textarea, Box } from '@navikt/ds-react';
import VerticalSpacer from 'app/components/VerticalSpacer';
import CheckboxFormik from 'app/components/formikInput/CheckboxFormik';
import intlHelper from 'app/utils/intlUtils';
import DatoInputFormikNew from 'app/components/formikInput/DatoInputFormikNew';
import { OMPMASoknad } from '../types/OMPMASoknad';

import './annenForelder.less';

const situasjonstyper = {
    INNLAGT_I_HELSEINSTITUSJON: 'INNLAGT_I_HELSEINSTITUSJON',
    UTØVER_VERNEPLIKT: 'UTØVER_VERNEPLIKT',
    FENGSEL: 'FENGSEL',
    SYKDOM: 'SYKDOM',
    ANNET: 'ANNET',
};

type OwnProps = {
    intl: IntlShape;
    handleBlur: (callback: () => void, values?: FormikValues) => void;
};

const AnnenForelder = ({ intl, handleBlur }: OwnProps) => {
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
                Annen forelder
            </Heading>
            <Box padding="4" borderWidth="1" borderRadius="small">
                <div className="annen-forelder-container">
                    <Label size="small">Identifikasjonsnummer</Label>
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
                            >
                                <option value="">Velg situasjon</option>
                                {Object.values(situasjonstyper).map((v) => (
                                    <option value={v} key={v}>
                                        {intlHelper(intl, `omsorgspenger.midlertidigAlene.situasjonstyper.${v}`)}
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
                            />
                        )}
                    </Field>
                    <VerticalSpacer twentyPx />
                    <div className="fom-tom">
                        <DatoInputFormikNew label="Fra og med" name="annenForelder.periode.fom" />
                        <DatoInputFormikNew
                            label="Til og med"
                            name="annenForelder.periode.tom"
                            disabled={values.annenForelder.periode.tilOgMedErIkkeOppgitt}
                        />
                    </div>
                    {!situasjonstypeErFengselEllerVerneplikt && (
                        <CheckboxFormik name="annenForelder.periode.tilOgMedErIkkeOppgitt" size="small">
                            Til og med er ikke oppgitt
                        </CheckboxFormik>
                    )}
                </div>
            </Box>
        </>
    );
};

export default AnnenForelder;
