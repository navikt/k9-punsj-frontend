import React from 'react';
import { IntlShape } from 'react-intl';
import { Field, FieldProps, FormikValues, useFormikContext } from 'formik';
import { Heading, Select, Textarea, TextField } from '@navikt/ds-react';
import Panel from 'nav-frontend-paneler';
import VerticalSpacer from 'app/components/VerticalSpacer';
import intlHelper from 'app/utils/intlUtils';
import './annenForelder.less';
import CheckboxFormik from 'app/components/formikInput/CheckboxFormik';
import DatoInputFormik from 'app/components/formikInput/DatoInputFormik';
import { OMPMASoknad } from '../types/OMPMASoknad';

const situasjonstyper = ['INNLAGT_I_HELSEINSTITUSJON', 'UTØVER_VERNEPLIKT', 'FENGSEL', 'SYKDOM', 'ANNET'];

type OwnProps = {
    intl: IntlShape;
    handleBlur: (callback: () => void) => void;
};

const AnnenForelder = ({ intl, handleBlur }: OwnProps) => {
    const { values } = useFormikContext<OMPMASoknad>();

    return (
        <>
            <Heading size="xsmall" spacing>
                Annen forelder
            </Heading>
            <Panel border>
                <div className="annen-forelder-container">
                    <VerticalSpacer twentyPx />

                    <Field name="annenForelder.norskIdent">
                        {({ field, meta }: FieldProps<string>) => (
                            <TextField
                                label="Identifikasjonsnummer"
                                size="small"
                                error={meta.touched && meta.error}
                                {...field}
                                onBlur={(e) => handleBlur(() => field.onBlur(e))}
                            />
                        )}
                    </Field>
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
                                {situasjonstyper.map((situasjonstype) => (
                                    <option value={situasjonstype}>
                                        {intlHelper(
                                            intl,
                                            `omsorgspenger.midlertidigAlene.situasjonstyper.${situasjonstype}`
                                        )}
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
                    <DatoInputFormik label="Fra og med" name="annenForelder.periode.fom" />
                    <DatoInputFormik
                        label="Til og med"
                        name="annenForelder.periode.tom"
                        disabled={values.annenForelder.tilOgMedErIkkeOppgitt}
                    />
                    <CheckboxFormik name="annenForelder.tilOgMedErIkkeOppgitt" size="small">
                        Til og med er ikke oppgitt
                    </CheckboxFormik>
                </div>
            </Panel>
        </>
    );
};

export default AnnenForelder;
