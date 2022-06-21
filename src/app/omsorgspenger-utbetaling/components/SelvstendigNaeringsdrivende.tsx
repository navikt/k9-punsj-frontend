import { AddCircle } from '@navikt/ds-icons';
import { Button, CheckboxGroup, Heading, Label, Panel } from '@navikt/ds-react';
import { CountrySelect } from 'app/components/country-select/CountrySelect';
import CheckboxFormik from 'app/components/formikInput/CheckboxFormik';
import DatoInputFormik from 'app/components/formikInput/DatoInputFormik';
import RadioFormik from 'app/components/formikInput/RadioFormik';
import RadioGroupFormik from 'app/components/formikInput/RadioGroupFormik';
import TextFieldFormik from 'app/components/formikInput/TextFieldFormik';
import { Field, FieldArray, FieldProps, useFormikContext } from 'formik';
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
                                type="checkbox"
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
                    <RadioGroupFormik
                        legend="Er virksomheten registrert i Norge?"
                        size="small"
                        name={field.name}
                        value={field.value ? 'nei' : 'ja'}
                    >
                        <RadioFormik
                            name={field.name}
                            value="ja"
                            onChange={() => form.setFieldValue(field.name, false)}
                        >
                            Ja
                        </RadioFormik>
                        <RadioFormik
                            name={field.name}
                            value="nei"
                            onChange={() => form.setFieldValue(field.name, true)}
                            checked
                        >
                            Nei
                        </RadioFormik>
                    </RadioGroupFormik>
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
            <Field name="opptjeningAktivitet.frilanser.info.harSøkerRegnskapsfører">
                {({ field, form }: FieldProps<string>) => (
                    <RadioGroupFormik
                        legend="Har søker regnskapsfører?"
                        size="small"
                        name={field.name}
                        value={field.value ? 'ja' : 'nei'}
                    >
                        <RadioFormik name={field.name} value="ja" onChange={() => form.setFieldValue(field.name, true)}>
                            Ja
                        </RadioFormik>
                        <RadioFormik
                            name={field.name}
                            value="nei"
                            onChange={() => form.setFieldValue(field.name, false)}
                            checked
                        >
                            Nei
                        </RadioFormik>
                    </RadioGroupFormik>
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
