import { CheckboxGroup, Heading, Panel } from '@navikt/ds-react';
import CheckboxFormik from 'app/components/formikInput/CheckboxFormik';
import SelectFormik from 'app/components/formikInput/SelectFormik';
import TextFieldFormik from 'app/components/formikInput/TextFieldFormik';
import { Field, FieldProps, useFormikContext } from 'formik';
import React from 'react';
import { IOMPUTSoknad } from '../types/OMPUTSoknad';

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
            {/* radio */}
        </Panel>
    );
};

export default SelvstendigNaeringsdrivende;
