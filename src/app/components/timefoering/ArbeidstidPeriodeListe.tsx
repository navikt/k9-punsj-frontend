import { AddCircle } from '@navikt/ds-icons';
import { Button, Heading } from '@navikt/ds-react';
import { ArbeidstidPeriodeMedTimer, IArbeidstidPeriodeMedTimer, Periodeinfo } from 'app/models/types';
import { FieldArray, Formik } from 'formik';
import React from 'react';
import { arbeidstimerPeriode } from 'app/rules/valideringer';
import * as yup from 'yup';
import ArbeidstidPeriode from './ArbeidstidPeriode';

const schema = yup.object({
    perioder: yup.array().of(arbeidstimerPeriode),
});

export default function ArbeidstidPeriodeListe({
    arbeidstidPerioder,
    lagre,
    heading,
    avbryt,
}: {
    arbeidstidPerioder: Periodeinfo<IArbeidstidPeriodeMedTimer>[];
    heading: string;
    lagre: (arbeidstidInfo: Periodeinfo<IArbeidstidPeriodeMedTimer>[]) => void;
    avbryt: () => void;
}) {
    const initialValues: { perioder: Periodeinfo<IArbeidstidPeriodeMedTimer>[] } = {
        perioder: [...arbeidstidPerioder],
    };
    return (
        <Formik initialValues={initialValues} onSubmit={(values) => lagre(values.perioder)} validationSchema={schema}>
            {({ handleSubmit, values }) => (
                <>
                    {heading && <Heading size="small">{heading}</Heading>}
                    <FieldArray
                        name="perioder"
                        render={(arrayHelpers) => (
                            <div>
                                {values.perioder.map((periode, index) => (
                                    <ArbeidstidPeriode
                                        // eslint-disable-next-line react/no-array-index-key
                                        key={index}
                                        name={`perioder.${index}`}
                                        remove={() => arrayHelpers.remove(index)}
                                    />
                                ))}
                                <Button
                                    variant="tertiary"
                                    onClick={() => arrayHelpers.push(new ArbeidstidPeriodeMedTimer({}))}
                                >
                                    <AddCircle /> Legg til periode
                                </Button>
                                <div style={{ display: 'flex' }}>
                                    <Button style={{ flexGrow: 1, marginRight: '0.9375rem' }} onClick={handleSubmit}>
                                        Lagre
                                    </Button>

                                    <Button style={{ flexGrow: 1 }} variant="tertiary" onClick={avbryt}>
                                        Avbryt
                                    </Button>
                                </div>
                            </div>
                        )}
                    />
                </>
            )}
        </Formik>
    );
}
