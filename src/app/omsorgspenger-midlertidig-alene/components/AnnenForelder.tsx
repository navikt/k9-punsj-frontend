import React, { useEffect } from 'react';
import { IntlShape } from 'react-intl';
import { Field, FieldProps, FormikValues, useFormikContext } from 'formik';
import { Heading, Label, Select, Textarea, BodyShort } from '@navikt/ds-react';
import Panel from 'nav-frontend-paneler';
import VerticalSpacer from 'app/components/VerticalSpacer';
import intlHelper from 'app/utils/intlUtils';
import './annenForelder.less';
import CheckboxFormik from 'app/components/formikInput/CheckboxFormik';
import DatoInputFormik from 'app/components/formikInput/DatoInputFormik';
import { OMPMASoknad } from '../types/OMPMASoknad';

const situasjonstyper = {
    INNLAGT_I_HELSEINSTITUSJON: 'INNLAGT_I_HELSEINSTITUSJON',
    UTØVER_VERNEPLIKT: 'UTØVER_VERNEPLIKT',
    FENGSEL: 'FENGSEL',
    SYKDOM: 'SYKDOM',
    ANNET: 'ANNET',
};

type OwnProps = {
    intl: IntlShape;
    handleBlur: (callback: () => void) => void;
};

const AnnenForelder = ({ intl, handleBlur }: OwnProps) => {
    const { values, setFieldValue } = useFormikContext<OMPMASoknad>();

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
        if (tilOgMedErIkkeOppgitt) {
            setFieldValue('annenForelder.periode.tom', '');
        }
    }, [tilOgMedErIkkeOppgitt]);
    return (
        <>
            <Heading size="xsmall" spacing>
                Annen forelder
            </Heading>
            <Panel border>
                <div className="annen-forelder-container">
                    <Label size="small">Identifikasjonsnummer</Label>
                    <BodyShort>{values.annenForelder.norskIdent}</BodyShort>
                    <VerticalSpacer twentyPx />
                    <Field name="annenForelder.situasjonType">
                        {({ field, meta }: FieldProps<string>) => (
                            <Select
                                size="small"
                                label="Hva er situasjonen til den andre forelderen?"
                                error={meta.touched && meta.error}
                                {...field}
                                onBlur={(e) => handleBlur(() => field.onBlur(e))}
                            >
                                <option value="">Velg situasjon</option>
                                {Object.values(situasjonstyper).map((v) => (
                                    <option value={v}>
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
                                size="small"
                                label="Beskrivelse av situasjonen"
                                error={meta.touched && meta.error}
                                {...field}
                                onBlur={(e) => handleBlur(() => field.onBlur(e))}
                            />
                        )}
                    </Field>
                    <VerticalSpacer twentyPx />
                    <div className="fom-tom-rad">
                        <DatoInputFormik label="Fra og med" name="annenForelder.periode.fom" handleBlur={handleBlur} />
                        <DatoInputFormik
                            label="Til og med"
                            name="annenForelder.periode.tom"
                            disabled={values.annenForelder.periode.tilOgMedErIkkeOppgitt}
                            handleBlur={handleBlur}
                        />
                    </div>
                    {!situasjonstypeErFengselEllerVerneplikt && (
                        <CheckboxFormik name="annenForelder.periode.tilOgMedErIkkeOppgitt" size="small">
                            Til og med er ikke oppgitt
                        </CheckboxFormik>
                    )}
                </div>
            </Panel>
        </>
    );
};

export default AnnenForelder;
