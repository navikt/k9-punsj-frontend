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

    const initialValues: { perioder: Periodeinfo<IArbeidstidPeriodeMedTimer>[] } = {
        perioder: [
            new ArbeidstidPeriodeMedTimer({
                periode: { fom: '', tom: '' },
                faktiskArbeidPerDag: { timer: '', minutter: '' },
                jobberNormaltPerDag: { timer: '', minutter: '' },
            }),
        ],
    };

    const handleSaveValues = (values?: { perioder: Periodeinfo<IArbeidstidPeriodeMedTimer>[] }) => {
        const currentValues = values || formikRef.current?.values;

        if (currentValues) {
            let allPeriods: Periodeinfo<IArbeidstidPeriodeMedTimer>[] = [...arbeidstidPerioder];

            currentValues.perioder.forEach((newPeriod) => {
                if (!newPeriod || !newPeriod.periode) return;

                const newStart = dayjs(newPeriod.periode.fom, formats.YYYYMMDD);
                const newEnd = dayjs(newPeriod.periode.tom, formats.YYYYMMDD);

                allPeriods = allPeriods.filter((existingPeriod) => {
                    if (!existingPeriod.periode) return false;
                    const existingStart = dayjs(existingPeriod.periode.fom, formats.YYYYMMDD);
                    const existingEnd = dayjs(existingPeriod.periode.tom, formats.YYYYMMDD);

                    return !(
                        (newStart.isSameOrBefore(existingEnd) && newEnd.isSameOrAfter(existingStart)) ||
                        (existingStart.isSameOrBefore(newEnd) && existingEnd.isSameOrAfter(newStart))
                    );
                });

                allPeriods.push(newPeriod);
            });

            const processedPeriods = allPeriods
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
