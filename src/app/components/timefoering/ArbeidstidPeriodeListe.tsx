import { FieldArray, Formik, FormikProps } from 'formik';
import React, { Fragment, useRef } from 'react';
import * as yup from 'yup';

import { AddCircle } from '@navikt/ds-icons';
import { Button, Heading, Alert } from '@navikt/ds-react';

import { ArbeidstidPeriodeMedTimer, IArbeidstidPeriodeMedTimer, IPeriode, Periodeinfo } from 'app/models/types';
import { arbeidstimerPeriode } from 'app/rules/yup';
import { formats, konverterPeriodeTilTimerOgMinutter } from 'app/utils';
import dayjs from 'dayjs';

import ArbeidstidPeriode from './ArbeidstidPeriode';

// Funksjon for å sjekke overlappende perioder
const checkPeriodOverlap = (periods: Periodeinfo<IArbeidstidPeriodeMedTimer>[]) => {
    for (let i = 0; i < periods.length; i++) {
        const currentPeriod = periods[i];
        if (!currentPeriod.periode?.fom || !currentPeriod.periode?.tom) {
            return true; // Tomme datoer regnes som feil
        }

        const currentStart = dayjs(currentPeriod.periode.fom, formats.YYYYMMDD);
        const currentEnd = dayjs(currentPeriod.periode.tom, formats.YYYYMMDD);

        // Sjekker overlapp med andre perioder
        for (let j = i + 1; j < periods.length; j++) {
            const otherPeriod = periods[j];
            if (!otherPeriod.periode?.fom || !otherPeriod.periode?.tom) {
                return true; // Tomme datoer regnes som feil
            }

            const otherStart = dayjs(otherPeriod.periode.fom, formats.YYYYMMDD);
            const otherEnd = dayjs(otherPeriod.periode.tom, formats.YYYYMMDD);

            // Sjekker overlappende perioder
            // Perioder overlapper hvis:
            // 1. Starten på én periode er innenfor en annen periode
            // 2. Slutten på én periode er innenfor en annen periode
            // 3. Én periode inneholder en annen helt
            if (
                (currentStart.isSameOrAfter(otherStart) && currentStart.isSameOrBefore(otherEnd)) || // Starten på nåværende periode er innenfor en annen
                (currentEnd.isSameOrAfter(otherStart) && currentEnd.isSameOrBefore(otherEnd)) || // Slutten på nåværende periode er innenfor en annen
                (otherStart.isSameOrAfter(currentStart) && otherStart.isSameOrBefore(currentEnd)) || // Starten på annen periode er innenfor nåværende
                (otherEnd.isSameOrAfter(currentStart) && otherEnd.isSameOrBefore(currentEnd)) || // Slutten på annen periode er innenfor nåværende
                (currentStart.isSameOrBefore(otherStart) && currentEnd.isSameOrAfter(otherEnd)) || // Nåværende periode inneholder en annen helt
                (otherStart.isSameOrBefore(currentStart) && otherEnd.isSameOrAfter(currentEnd)) // Annen periode inneholder nåværende helt
            ) {
                return true; // Overlapp funnet
            }
        }
    }
    return false; // Ingen overlapp funnet
};

const schema = yup.object({
    perioder: yup
        .array()
        .of(arbeidstimerPeriode)
        .test('no-overlap', 'Perioder kan ikke overlappe hverandre', (periods) => {
            if (!periods) return true;
            return !checkPeriodOverlap(periods as Periodeinfo<IArbeidstidPeriodeMedTimer>[]);
        })
        .test('no-empty-dates', 'Alle perioder må ha både start- og sluttdato', (periods) => {
            if (!periods) return true;
            return (periods as Periodeinfo<IArbeidstidPeriodeMedTimer>[]).every(
                (period) => period.periode?.fom && period.periode?.tom,
            );
        }),
});

interface FormValues {
    perioder: Periodeinfo<IArbeidstidPeriodeMedTimer>[];
}

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
    const formikRef = useRef<FormikProps<FormValues>>(null);

    const harEksisterendePerioder = Array.isArray(arbeidstidPerioder) && arbeidstidPerioder.length > 0;

    let initialPerioder: Periodeinfo<IArbeidstidPeriodeMedTimer>[] = [];

    if (harEksisterendePerioder) {
        initialPerioder = arbeidstidPerioder.map((p) => new ArbeidstidPeriodeMedTimer(p));
    } else {
        if (soknadsperioder.length === 1) {
            initialPerioder = [
                new ArbeidstidPeriodeMedTimer({
                    periode: soknadsperioder[0],
                    faktiskArbeidPerDag: { timer: '', minutter: '' },
                    jobberNormaltPerDag: { timer: '', minutter: '' },
                }),
            ];
        } else {
            initialPerioder = [
                new ArbeidstidPeriodeMedTimer({
                    periode: { fom: '', tom: '' },
                    faktiskArbeidPerDag: { timer: '', minutter: '' },
                    jobberNormaltPerDag: { timer: '', minutter: '' },
                }),
            ];
        }
    }

    const initialValues: { perioder: Periodeinfo<IArbeidstidPeriodeMedTimer>[] } = {
        perioder: initialPerioder.sort(
            (a, b) =>
                dayjs(a.periode?.fom, formats.YYYYMMDD).valueOf() - dayjs(b.periode?.fom, formats.YYYYMMDD).valueOf(),
        ),
    };

    const handleSaveValues = (values?: { perioder: Periodeinfo<IArbeidstidPeriodeMedTimer>[] }) => {
        const currentValues = values || formikRef.current?.values;

        if (currentValues) {
            const uniquePeriodsMap = new Map<string, IArbeidstidPeriodeMedTimer>();

            currentValues.perioder.forEach((period) => {
                if (!period || !period.periode || !period.jobberNormaltPerDag?.timer) {
                    return;
                }

                const start = dayjs(period.periode.fom, formats.YYYYMMDD);
                const end = dayjs(period.periode.tom, formats.YYYYMMDD);

                let isDuplicate = false;
                for (const [, existingPeriod] of uniquePeriodsMap.entries()) {
                    if (!existingPeriod.periode) continue;

                    const existingStart = dayjs(existingPeriod.periode.fom, formats.YYYYMMDD);
                    const existingEnd = dayjs(existingPeriod.periode.tom, formats.YYYYMMDD);

                    if (start.isSameOrAfter(existingStart) && end.isSameOrBefore(existingEnd)) {
                        isDuplicate = true;
                        break;
                    }
                    if (existingStart.isSameOrAfter(start) && existingEnd.isSameOrBefore(end)) {
                        const key = `${start.format(formats.YYYYMMDD)}-${end.format(formats.YYYYMMDD)}`;
                        uniquePeriodsMap.set(key, period);
                        isDuplicate = true;
                        break;
                    }
                }

                if (!isDuplicate) {
                    uniquePeriodsMap.set(`${start.format(formats.YYYYMMDD)}-${end.format(formats.YYYYMMDD)}`, period);
                }
            });

            const processedPeriods = Array.from(uniquePeriodsMap.values())
                .map((v) => konverterPeriodeTilTimerOgMinutter(v))
                .sort(
                    (a, b) =>
                        dayjs(a.periode.fom, formats.YYYYMMDD).valueOf() -
                        dayjs(b.periode.fom, formats.YYYYMMDD).valueOf(),
                );

            lagre(processedPeriods);
        }
    };

    return (
        <Formik<FormValues>
            initialValues={initialValues}
            onSubmit={(values) => handleSaveValues(values)}
            validationSchema={schema}
            innerRef={formikRef}
            enableReinitialize
        >
            {({ handleSubmit, values, errors, touched }) => (
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
                                {touched.perioder && errors.perioder && (
                                    <Alert variant="error" className="mb-4">
                                        {typeof errors.perioder === 'string'
                                            ? errors.perioder
                                            : 'Det er feil i periodene'}
                                    </Alert>
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
