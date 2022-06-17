import { CheckboxGroup, Heading, Panel, RadioGroup } from '@navikt/ds-react';
import { CountrySelect } from 'app/components/country-select/CountrySelect';
import CheckboxFormik from 'app/components/formikInput/CheckboxFormik';
import RadioFormik from 'app/components/formikInput/RadioFormik';
import RadioGroupFormik from 'app/components/formikInput/RadioGroupFormik';
import TextFieldFormik from 'app/components/formikInput/TextFieldFormik';
import { Field, FieldProps, useFormikContext } from 'formik';
import React from 'react';
import { IOMPUTSoknad } from '../types/OMPUTSoknad';

const SelvstendigNaeringsdrivende = () => {
    const { values } = useFormikContext<IOMPUTSoknad>();
    const {
        opptjeningAktivitet: { selvstendigNæringsdrivende },
    } = values;
    console.log(values);
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
                            onChange={(value) => form.setFieldValue(field.name, false)}
                        >
                            Ja
                        </RadioFormik>
                        <RadioFormik
                            name={field.name}
                            value="nei"
                            onChange={(value) => form.setFieldValue(field.name, true)}
                            checked
                        >
                            Nei
                        </RadioFormik>
                    </RadioGroupFormik>
                )}
            </Field>
            {values.opptjeningAktivitet.selvstendigNæringsdrivende.info.registrertIUtlandet ? (
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
                {({ field }: FieldProps<string>) => (
                    <RadioGroupFormik
                        legend="Har søker regnskapsfører?"
                        size="small"
                        defaultValue={field.value}
                        name={field.name}
                        options={[
                            { label: 'Ja', value: 'ja' },
                            { label: 'Nei', value: 'nei' },
                        ]}
                    />
                )}
            </Field>
            {values.opptjeningAktivitet.selvstendigNæringsdrivende.info.harSøkerRegnskapsfører === 'ja' && (
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
        </Panel>
    );
};

export default SelvstendigNaeringsdrivende;
