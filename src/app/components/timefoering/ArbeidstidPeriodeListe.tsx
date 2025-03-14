import { FieldArray, Formik, FormikProps } from 'formik';
import React, { Fragment, useRef } from 'react';
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
}: {
    arbeidstidPerioder: Periodeinfo<IArbeidstidPeriodeMedTimer>[];
    heading: string;
    lagre: (arbeidstidInfo: Periodeinfo<IArbeidstidPeriodeMedTimer>[]) => void;
    avbryt: () => void;
    soknadsperioder: IPeriode[];
}) {
    const formikRef = useRef<FormikProps<{ perioder: Periodeinfo<IArbeidstidPeriodeMedTimer>[] }>>(null);

    const harEksisterendePerioder = arbeidstidPerioder && arbeidstidPerioder.length > 0;

    let initialPerioder: Periodeinfo<IArbeidstidPeriodeMedTimer>[] = [];

    if (harEksisterendePerioder) {
        initialPerioder = arbeidstidPerioder.map((p) => new ArbeidstidPeriodeMedTimer(p));

        const eksisterendePerioder = new Set(
            initialPerioder
                .filter((p) => p.periode && p.periode.fom && p.periode.tom)
                .map((p) => `${p.periode?.fom || ''}_${p.periode?.tom || ''}`),
        );

        const manglendePerioder = soknadsperioder.filter(
            (p) => p.fom && p.tom && !eksisterendePerioder.has(`${p.fom}_${p.tom}`),
        );

        if (manglendePerioder.length > 0) {
            const nyePerioder = manglendePerioder.map(
                (p) =>
                    new ArbeidstidPeriodeMedTimer({
                        periode: p,
                        faktiskArbeidPerDag: { timer: '', minutter: '' },
                        jobberNormaltPerDag: { timer: '', minutter: '' },
                    }),
            );

            initialPerioder = [...initialPerioder, ...nyePerioder];
        }
    } else if (soknadsperioder.length > 0) {
        initialPerioder = soknadsperioder.map(
            (p) =>
                new ArbeidstidPeriodeMedTimer({
                    periode: p,
                    faktiskArbeidPerDag: { timer: '', minutter: '' },
                    jobberNormaltPerDag: { timer: '', minutter: '' },
                }),
        );
    } else {
        initialPerioder = [
            new ArbeidstidPeriodeMedTimer({
                periode: { fom: '', tom: '' },
                faktiskArbeidPerDag: { timer: '', minutter: '' },
                jobberNormaltPerDag: { timer: '', minutter: '' },
            }),
        ];
    }

    const initialValues: { perioder: Periodeinfo<IArbeidstidPeriodeMedTimer>[] } = {
        perioder: initialPerioder,
    };

    const handleSaveValues = (values?: { perioder: Periodeinfo<IArbeidstidPeriodeMedTimer>[] }) => {
        const currentValues = values || formikRef.current?.values;
        if (currentValues) {
            const processedPeriods = currentValues.perioder
                .filter((period) => period && period.periode) // Kontrollerer at perioden eksisterer og har periode-felt
                .map((v) => konverterPeriodeTilTimerOgMinutter(v));

            lagre(processedPeriods);
        }
    };

    return (
        <Formik
            initialValues={initialValues}
            onSubmit={(values) => handleSaveValues(values)}
            validationSchema={schema}
            innerRef={formikRef}
            enableReinitialize // Sikrer at Formik reinitialiseres når props endres
        >
            {({ handleSubmit, values }) => (
                <>
                    <Heading size="small">{heading}</Heading>
                    <FieldArray
                        name="perioder"
                        render={(arrayHelpers) => (
                            <div>
                                {values.perioder && values.perioder.length > 0 ? (
                                    values.perioder.map((periode, index) => (
                                        <Fragment key={index}>
                                            <ArbeidstidPeriode
                                                name={`perioder.${index}`}
                                                soknadsperioder={soknadsperioder}
                                                remove={() => arrayHelpers.remove(index)}
                                            />
                                        </Fragment>
                                    ))
                                ) : (
                                    <div>Ingen perioder å vise</div>
                                )}
                                <div className="mb-8 mt-4">
                                    <Button
                                        variant="tertiary"
                                        type="button"
                                        onClick={() => {
                                            arrayHelpers.push(
                                                new ArbeidstidPeriodeMedTimer({
                                                    periode: { fom: '', tom: '' },
                                                    faktiskArbeidPerDag: { timer: '', minutter: '' },
                                                    jobberNormaltPerDag: { timer: '', minutter: '' },
                                                }),
                                            );
                                        }}
                                        icon={<AddCircle />}
                                    >
                                        Legg til periode
                                    </Button>
                                </div>
                                <div style={{ display: 'flex' }}>
                                    <Button
                                        style={{ flexGrow: 1, marginRight: '0.9375rem' }}
                                        type="button"
                                        onClick={() => handleSubmit()}
                                    >
                                        Lagre
                                    </Button>

                                    <Button style={{ flexGrow: 1 }} variant="tertiary" onClick={avbryt} type="button">
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
