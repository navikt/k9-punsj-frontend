import { Delete, AddCircle } from '@navikt/ds-icons';
import { Button, Checkbox, Panel } from '@navikt/ds-react';
import TextFieldFormik from 'app/components/formikInput/TextFieldFormik';
import Organisasjonsvelger from 'app/components/organisasjon/Organisasjonvelger';
import { Field, FieldArray, FieldProps, FormikProps } from 'formik';
import React, { useState } from 'react';
import { fravaersperiodeInitialValue } from '../initialValues';
import { aktivitetsFravær } from '../konstanter';
import { Arbeidstaker as ArbeidstakerType, IOMPUTSoknad } from '../types/OMPUTSoknad';
import Fravaersperiode from './Fravaersperiode';
import './arbeidstaker.less';

interface OwnProps {
    index: number;
    slettArbeidsforhold: () => void;
    antallArbeidsforhold: number;
}

const Arbeidstaker = ({ index: arbeidstakerIndex, slettArbeidsforhold, antallArbeidsforhold }: OwnProps) => {
    const [gjelderAnnenOrganisasjon, setGjelderAnnenOrganisasjon] = useState(false);

    const harMinstToArbeidsforhold = antallArbeidsforhold > 1;

    const toggleGjelderAnnenOrganisasjon = (form: FormikProps<IOMPUTSoknad>) => {
        setGjelderAnnenOrganisasjon(!gjelderAnnenOrganisasjon);
        form.setFieldValue(`opptjeningAktivitet.arbeidstaker[${arbeidstakerIndex}].organisasjonsnummer`, '');
    };
    return (
        <Field name={`opptjeningAktivitet.arbeidstaker[${arbeidstakerIndex}]`}>
            {({ field: { value, name }, form }: FieldProps<ArbeidstakerType>) => (
                <Panel border>
                    <div>
                        <Organisasjonsvelger
                            name={`opptjeningAktivitet.arbeidstaker[${arbeidstakerIndex}].organisasjonsnummer`}
                            soeker={form.values.soekerId}
                            disabled={gjelderAnnenOrganisasjon}
                            className="inline-block"
                        />
                        {harMinstToArbeidsforhold && (
                            <Button variant="tertiary" size="small" className="slett" onClick={slettArbeidsforhold}>
                                <Delete />
                                Fjern arbeidsforhold
                            </Button>
                        )}
                        <Checkbox onChange={() => toggleGjelderAnnenOrganisasjon(form)}>
                            Gjelder annen organisasjon
                        </Checkbox>
                        {gjelderAnnenOrganisasjon && (
                            <TextFieldFormik
                                size="small"
                                label="Organisasjonsnummer"
                                name={`${name}.organisasjonsnummer`}
                            />
                        )}
                    </div>
                    <FieldArray
                        name={`${name}.fravaersperioder`}
                        render={(arrayHelpers) => (
                            <>
                                {value.fravaersperioder?.map((_fravaersperiode, fravaersperiodeIndex) => (
                                    <Fravaersperiode
                                        name={`${name}.fravaersperioder[${fravaersperiodeIndex}]`}
                                        antallFravaersperioder={value.fravaersperioder?.length}
                                        slettPeriode={() => arrayHelpers.remove(fravaersperiodeIndex)}
                                    />
                                ))}
                                <Button
                                    variant="tertiary"
                                    size="small"
                                    onClick={() =>
                                        arrayHelpers.push({
                                            ...fravaersperiodeInitialValue,
                                            aktivitetsFravær: aktivitetsFravær.ARBEIDSTAKER,
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
            )}
        </Field>
    );
};

export default Arbeidstaker;
