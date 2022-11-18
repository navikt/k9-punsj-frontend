import { AddCircle } from '@navikt/ds-icons';
import { Button, Heading } from '@navikt/ds-react';
import { ArbeidstidPeriodeMedTimer, IArbeidstidPeriodeMedTimer, IPeriode, Periodeinfo } from 'app/models/types';
import { arbeidstimerPeriode } from 'app/rules/yup';
import { FieldArray, Formik } from 'formik';
import React from 'react';
import * as yup from 'yup';
import VerticalSpacer from '../VerticalSpacer';
import ArbeidstidPeriode from './ArbeidstidPeriode';

const schema = yup.object({
    perioder: yup.array().of(arbeidstimerPeriode),
});

export default function ArbeidstidPeriodeListe({
    arbeidstidPerioder,
    lagre,
    heading,
    avbryt,
    soknadsperioder,
    nyeSoknadsperioder,
}: {
    arbeidstidPerioder: Periodeinfo<IArbeidstidPeriodeMedTimer>[];
    heading: string;
    lagre: (arbeidstidInfo: Periodeinfo<IArbeidstidPeriodeMedTimer>[]) => void;
    avbryt: () => void;
    soknadsperioder: IPeriode[];
    nyeSoknadsperioder: IPeriode[];
}) {
    const initialValues: { perioder: Periodeinfo<IArbeidstidPeriodeMedTimer>[] } = {
        perioder: arbeidstidPerioder.length
            ? [...arbeidstidPerioder]
            : nyeSoknadsperioder.map((periode) => new ArbeidstidPeriodeMedTimer({ periode })),
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
                                        soknadsperioder={soknadsperioder}
                                        remove={() => arrayHelpers.remove(index)}
                                    />
                                ))}
                                <Button
                                    variant="tertiary"
                                    onClick={() => arrayHelpers.push(new ArbeidstidPeriodeMedTimer({}))}
                                >
                                    <AddCircle /> Legg til periode
                                </Button>
                                <VerticalSpacer eightPx />
                                <div style={{ display: 'flex' }}>
                                    <Button
                                        style={{ flexGrow: 1, marginRight: '0.9375rem' }}
                                        type="submit"
                                        onClick={() => handleSubmit()}
                                    >
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
