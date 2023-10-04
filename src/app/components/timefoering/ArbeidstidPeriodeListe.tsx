import { FieldArray, Formik } from 'formik';
import React from 'react';
import * as yup from 'yup';

import { AddCircle } from '@navikt/ds-icons';
import { Button, Heading } from '@navikt/ds-react';

import { ArbeidstidPeriodeMedTimer, IArbeidstidPeriodeMedTimer, IPeriode, Periodeinfo } from 'app/models/types';
import { arbeidstimerPeriode } from 'app/rules/yup';
import { Tidsformat } from 'app/utils';

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

    function hoursToTimeArray(timerOgDesimaler: number): [string, string] {
        const totalMinutes = Math.round(timerOgDesimaler * 60);
        const minutes = String(totalMinutes % 60);
        const timer = String(Math.floor(totalMinutes / 60));
        return [timer, minutes];
    }
    const konverterTidTilTimerOgMinutter = (periode: Periodeinfo<IArbeidstidPeriodeMedTimer>) => {
        if (periode.tidsformat === Tidsformat.Desimaler) {
            const [normaltTimer, normaltMinutter] = hoursToTimeArray(Number(periode.jobberNormaltTimerPerDag || 0));
            const [faktiskTimer, faktiskMinutter] = hoursToTimeArray(Number(periode.faktiskArbeidTimerPerDag || 0));
            return new ArbeidstidPeriodeMedTimer({
                periode: periode.periode,
                jobberNormaltPerDag: {
                    timer: normaltTimer,
                    minutter: normaltMinutter,
                },
                faktiskArbeidPerDag: {
                    timer: faktiskTimer,
                    minutter: faktiskMinutter,
                },
            });
        }
        return new ArbeidstidPeriodeMedTimer({
            periode: periode.periode,
            jobberNormaltPerDag: periode.jobberNormaltPerDag,
            faktiskArbeidPerDag: periode.faktiskArbeidPerDag,
        });
    };
    return (
        <Formik
            initialValues={initialValues}
            onSubmit={(values) => lagre(values.perioder.map((v) => konverterTidTilTimerOgMinutter(v)))}
            validationSchema={schema}
        >
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
