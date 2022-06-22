import { AddCircle } from '@navikt/ds-icons';
import { Button, CheckboxGroup, Heading, Label, Panel } from '@navikt/ds-react';
import { CountrySelect } from 'app/components/country-select/CountrySelect';
import CheckboxFormik from 'app/components/formikInput/CheckboxFormik';
import DatoInputFormik from 'app/components/formikInput/DatoInputFormik';
import RadioFormik from 'app/components/formikInput/RadioFormik';
import RadioGroupFormik from 'app/components/formikInput/RadioGroupFormik';
import RadioPanelGruppeFormik from 'app/components/formikInput/RadioPanelGruppeFormik';
import TextFieldFormik from 'app/components/formikInput/TextFieldFormik';
import RadioInput from 'app/components/skjema/RadioInput';
import { JaNei } from 'app/models/enums';
import { Field, FieldArray, FieldProps, useFormikContext } from 'formik';
import { capitalize } from 'lodash';
import { RadioPanel, RadioPanelGruppe } from 'nav-frontend-skjema';
import React from 'react';
import { fravaersperiodeInitialValue } from '../initialValues';
import { aktivitetsFravær } from '../konstanter';
import { FravaersperiodeType, IOMPUTSoknad } from '../types/OMPUTSoknad';
import Fravaersperiode from './Fravaersperiode';

const SelvstendigNaeringsdrivende = () => {
    const { values } = useFormikContext<IOMPUTSoknad>();
    const {
        opptjeningAktivitet: { selvstendigNæringsdrivende },
    } = values;
    const virksomhetstyper = ['Fiske', 'Jordbruk', 'Dagmamma i eget hjem/familiebarnehage', 'Annen næringsvirksomhet'];

    return (
        <Panel border>
            <Heading size="small" level="5">
                Selvstendig næringsdrivende
            </Heading>
            <Field name="opptjeningAktivitet.selvstendigNæringsdrivende.info.virksomhetstyper">
                {({ meta }: FieldProps<string[]>) => (
                    <CheckboxGroup legend="Type virksomhet" size="small" error={meta.touched && meta.error}>
                        {virksomhetstyper.map((virksomhetstype) => (
                            <CheckboxFormik
                                key={virksomhetstype}
                                name="opptjeningAktivitet.selvstendigNæringsdrivende.info.virksomhetstyper"
                                value={virksomhetstype}
                            >
                                {virksomhetstype}
                            </CheckboxFormik>
                        ))}
                    </CheckboxGroup>
                )}
            </Field>
            <TextFieldFormik
                name="opptjeningAktivitet.selvstendigNæringsdrivende.virksomhetNavn"
                label="Virksomhetsnavn"
                size="small"
            />
            <Field name="opptjeningAktivitet.selvstendigNæringsdrivende.info.registrertIUtlandet">
                {({ field, form }: FieldProps<boolean>) => (
                    <RadioPanelGruppeFormik
                        legend="Er virksomheten registrert i Norge?"
                        checked={field.value ? 'nei' : 'ja'}
                        name={field.name}
                        options={Object.values(JaNei).map((v) => ({ value: v, label: capitalize(v) }))}
                        onChange={(e, value) => form.setFieldValue(field.name, value === 'nei')}
                    />
                )}
            </Field>
            {selvstendigNæringsdrivende.info.registrertIUtlandet ? (
                <Field name="opptjeningAktivitet.selvstendigNæringsdrivende.info.landkode">
                    {({ field }: FieldProps<string>) => <CountrySelect selectedcountry={field.value} {...field} />}
                </Field>
            ) : (
                <TextFieldFormik
                    size="small"
                    label="Organisasjonsnummer"
                    name="opptjeningAktivitet.selvstendigNæringsdrivende.organisasjonsnummer"
                />
            )}
            <Field name="opptjeningAktivitet.selvstendigNæringsdrivende.info.harSøkerRegnskapsfører">
                {({ field, form }: FieldProps<boolean>) => (
                    <RadioPanelGruppeFormik
                        legend="Har søker regnskapsfører?"
                        checked={field.value ? 'ja' : 'nei'}
                        name={field.name}
                        options={Object.values(JaNei).map((v) => ({ value: v, label: capitalize(v) }))}
                        onChange={(e, value) => form.setFieldValue(field.name, value === 'ja')}
                    />
                )}
            </Field>
            {selvstendigNæringsdrivende.info.harSøkerRegnskapsfører && (
                <>
                    <TextFieldFormik
                        size="small"
                        label="Navn på regnskapsfører"
                        name="opptjeningAktivitet.selvstendigNæringsdrivende.info.regnskapsførerNavn"
                    />
                    <TextFieldFormik
                        size="small"
                        label="Telefonnummer til regnskapsfører "
                        name="opptjeningAktivitet.selvstendigNæringsdrivende.info.regnskapsførerTlf"
                    />
                </>
            )}
            <Label size="small">Når startet virksomheten?</Label>
            <DatoInputFormik
                name="values.opptjeningAktivitet.selvstendigNæringsdrivende.info.periode.fom"
                label="Startdato"
            />
            <DatoInputFormik
                name="values.opptjeningAktivitet.selvstendigNæringsdrivende.info.periode.tom"
                label="Eventuell sluttdato"
            />
            <TextFieldFormik
                size="small"
                label="Næringsresultat før skatt de siste 12 månedene"
                name="values.opptjeningAktivitet.selvstendigNæringsdrivende.info.periode.tom"
            />
            <FieldArray
                name="opptjeningAktivitet.selvstendigNæringsdrivende.fravaersperioder"
                render={(arrayHelpers) => (
                    <>
                        {selvstendigNæringsdrivende.fravaersperioder?.map((_fravaersperiode, fravaersperiodeIndex) => (
                            <Field
                                name={`opptjeningAktivitet.selvstendigNæringsdrivende.fravaersperioder[${fravaersperiodeIndex}]`}
                            >
                                {({ field }: FieldProps<FravaersperiodeType>) => (
                                    <Fravaersperiode
                                        name={field.name}
                                        antallFravaersperioder={selvstendigNæringsdrivende.fravaersperioder?.length}
                                        slettPeriode={() => arrayHelpers.remove(fravaersperiodeIndex)}
                                    />
                                )}
                            </Field>
                        ))}
                        <Button
                            variant="tertiary"
                            size="small"
                            onClick={() =>
                                arrayHelpers.push({
                                    ...fravaersperiodeInitialValue,
                                    aktivitetsFravær: aktivitetsFravær.SELVSTENDIG_NÆRINGSDRIVENDE,
                                })
                            }
                        >
                            <AddCircle />
                            Legg til periode
                        </Button>
                    </>
                )}
            />
        </Panel>
    );
};

export default SelvstendigNaeringsdrivende;
