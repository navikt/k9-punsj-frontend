import { AddCircle } from '@navikt/ds-icons';
import { Button, CheckboxGroup, Heading, Label, Panel } from '@navikt/ds-react';
import { CountrySelect } from 'app/components/country-select/CountrySelect';
import CheckboxFormik from 'app/components/formikInput/CheckboxFormik';
import DatoInputFormik from 'app/components/formikInput/DatoInputFormik';
import RadioPanelGruppeFormik from 'app/components/formikInput/RadioPanelGruppeFormik';
import TextFieldFormik from 'app/components/formikInput/TextFieldFormik';
import { JaNei } from 'app/models/enums';
import { erEldreEnn4år, erYngreEnn4år } from 'app/utils';
import { kunTall } from 'app/utils/patterns';
import { Field, FieldArray, FieldProps, useFormikContext } from 'formik';
import { capitalize, get } from 'lodash';
import React from 'react';
import { Collapse } from 'react-collapse';
import { fravaersperiodeInitialValue } from '../initialValues';
import { aktivitetsFravær } from '../konstanter';
import { FravaersperiodeType, IOMPUTSoknad } from '../types/OMPUTSoknad';
import Fravaersperiode from './Fravaersperiode';
import VarigEndring from './VarigEndring';

const SelvstendigNaeringsdrivende = () => {
    const { values } = useFormikContext<IOMPUTSoknad>();
    const {
        opptjeningAktivitet: { selvstendigNaeringsdrivende },
    } = values;
    const virksomhetstyper = ['Fiske', 'Jordbruk', 'Dagmamma i eget hjem/familiebarnehage', 'Annen næringsvirksomhet'];
    return (
        <Panel border>
            <Heading size="small" level="5">
                Selvstendig næringsdrivende
            </Heading>
            <Field name="opptjeningAktivitet.selvstendigNaeringsdrivende.info.virksomhetstyper">
                {({ meta }: FieldProps<string[]>) => (
                    <CheckboxGroup legend="Type virksomhet" size="small" error={meta.touched && meta.error}>
                        {virksomhetstyper.map((virksomhetstype) => (
                            <CheckboxFormik
                                key={virksomhetstype}
                                name="opptjeningAktivitet.selvstendigNaeringsdrivende.info.virksomhetstyper"
                                value={virksomhetstype}
                            >
                                {virksomhetstype}
                            </CheckboxFormik>
                        ))}
                    </CheckboxGroup>
                )}
            </Field>
            <TextFieldFormik
                name="opptjeningAktivitet.selvstendigNaeringsdrivende.virksomhetNavn"
                label="Virksomhetsnavn"
                size="small"
            />
            <Field name="opptjeningAktivitet.selvstendigNaeringsdrivende.info.registrertIUtlandet">
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
            {selvstendigNaeringsdrivende.info.registrertIUtlandet ? (
                <Field name="opptjeningAktivitet.selvstendigNaeringsdrivende.info.landkode">
                    {({ field }: FieldProps<string>) => <CountrySelect selectedcountry={field.value} {...field} />}
                </Field>
            ) : (
                <TextFieldFormik
                    size="small"
                    label="Organisasjonsnummer"
                    filterPattern={kunTall}
                    name="opptjeningAktivitet.selvstendigNaeringsdrivende.organisasjonsnummer"
                />
            )}
            <Field name="opptjeningAktivitet.selvstendigNaeringsdrivende.info.harSøkerRegnskapsfører">
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
            {selvstendigNaeringsdrivende.info.harSøkerRegnskapsfører && (
                <>
                    <TextFieldFormik
                        size="small"
                        label="Navn på regnskapsfører"
                        name="opptjeningAktivitet.selvstendigNaeringsdrivende.info.regnskapsførerNavn"
                    />
                    <TextFieldFormik
                        size="small"
                        label="Telefonnummer til regnskapsfører "
                        name="opptjeningAktivitet.selvstendigNaeringsdrivende.info.regnskapsførerTlf"
                    />
                </>
            )}
            <Label size="small">Når startet virksomheten?</Label>
            <DatoInputFormik
                name="opptjeningAktivitet.selvstendigNaeringsdrivende.info.periode.fom"
                label="Startdato"
            />
            <DatoInputFormik
                name="opptjeningAktivitet.selvstendigNaeringsdrivende.info.periode.tom"
                label="Eventuell sluttdato"
            />
            <Collapse
                isOpened={erYngreEnn4år(
                    get(values, 'opptjeningAktivitet.selvstendigNaeringsdrivende.info.periode.fom')
                )}
            >
                <TextFieldFormik
                    size="small"
                    label="Næringsresultat før skatt de siste 12 månedene"
                    name="opptjeningAktivitet.selvstendigNaeringsdrivende.bruttoInntekt"
                    filterPattern={kunTall}
                />
            </Collapse>
            <Collapse
                isOpened={erEldreEnn4år(
                    get(values, 'opptjeningAktivitet.selvstendigNaeringsdrivende.info.periode.fom')
                )}
            >
                <VarigEndring />
            </Collapse>
            <FieldArray
                name="opptjeningAktivitet.selvstendigNaeringsdrivende.fravaersperioder"
                render={(arrayHelpers) => (
                    <>
                        {selvstendigNaeringsdrivende.fravaersperioder?.map((_fravaersperiode, fravaersperiodeIndex) => (
                            <Field
                                name={`opptjeningAktivitet.selvstendigNaeringsdrivende.fravaersperioder[${fravaersperiodeIndex}]`}
                            >
                                {({ field }: FieldProps<FravaersperiodeType>) => (
                                    <Fravaersperiode
                                        name={field.name}
                                        antallFravaersperioder={selvstendigNaeringsdrivende.fravaersperioder?.length}
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
