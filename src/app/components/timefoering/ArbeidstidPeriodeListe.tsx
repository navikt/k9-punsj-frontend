import { FieldArray, Formik } from 'formik';
import React, { Fragment } from 'react';
import * as yup from 'yup';

import { AddCircle } from '@navikt/ds-icons';
import { Button, Heading } from '@navikt/ds-react';

import { ArbeidstidPeriodeMedTimer, IArbeidstidPeriodeMedTimer, IPeriode, Periodeinfo } from 'app/models/types';
import { arbeidstimerPeriode } from 'app/rules/yup';
import { konverterPeriodeTilTimerOgMinutter } from 'app/utils';

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
    nyeSoknadsperioder: IPeriode[] | null;
}) {
    const initialValues: { perioder: Periodeinfo<IArbeidstidPeriodeMedTimer>[] } = {
        perioder: arbeidstidPerioder.length
            ? [...arbeidstidPerioder]
            : (nyeSoknadsperioder || []).map((periode) => new ArbeidstidPeriodeMedTimer({ periode })),
    };

    return (
        <Formik
            initialValues={initialValues}
            onSubmit={(values) => lagre(values.perioder.map((v) => konverterPeriodeTilTimerOgMinutter(v)))}
            validationSchema={schema}
        >
            {({ handleSubmit, values }) => (
                <>
                    <Heading size="small">{heading}</Heading>
                    <FieldArray
                        name="perioder"
                        render={(arrayHelpers) => (
                            <div>
                                {values.perioder.map((periode, index) => (
                                    <Fragment key={index}>
                                        <ArbeidstidPeriode
                                            name={`perioder.${index}`}
                                            soknadsperioder={soknadsperioder}
                                            remove={() => arrayHelpers.remove(index)}
                                        />
                                    </Fragment>
                                ))}
                                <div className="mb-8 mt-4">
                                    <Button
                                        variant="tertiary"
                                        onClick={() => arrayHelpers.push(new ArbeidstidPeriodeMedTimer({}))}
                                        icon={<AddCircle />}
                                    >
                                        Legg til periode
                                    </Button>
                                </div>
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
