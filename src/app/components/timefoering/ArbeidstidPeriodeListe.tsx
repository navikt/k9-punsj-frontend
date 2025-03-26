import React, { useRef } from 'react';

import { AddCircle } from '@navikt/ds-icons';
import { Alert, Button, Heading } from '@navikt/ds-react';
import { FieldArray, Formik, FormikProps } from 'formik';
import * as yup from 'yup';
import dayjs from 'dayjs';

import { ArbeidstidPeriodeMedTimer, IArbeidstidPeriodeMedTimer, IPeriode, Periodeinfo } from 'app/models/types';
import { arbeidstimerPeriode } from 'app/rules/yup';
import { formats, konverterPeriodeTilTimerOgMinutter } from 'app/utils';

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
        }),
});

interface FormValues {
    perioder: Periodeinfo<IArbeidstidPeriodeMedTimer>[];
}

interface Props {
    arbeidstidPerioder: Periodeinfo<IArbeidstidPeriodeMedTimer>[];
    soknadsperioder: IPeriode[];

    lagre: (arbeidstidInfo: Periodeinfo<IArbeidstidPeriodeMedTimer>[]) => void;
    avbryt: () => void;
}

const ArbeidstidPeriodeListe = ({ arbeidstidPerioder, lagre, avbryt, soknadsperioder }: Props) => {
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
            // Starter med eksisterende perioder
            let allPeriods: Periodeinfo<IArbeidstidPeriodeMedTimer>[] = [...arbeidstidPerioder];

            // Behandler nye perioder
            currentValues.perioder.forEach((newPeriod) => {
                if (!newPeriod || !newPeriod.periode) return;

                const newStart = dayjs(newPeriod.periode.fom, formats.YYYYMMDD);
                const newEnd = dayjs(newPeriod.periode.tom, formats.YYYYMMDD);

                // Behandler hver eksisterende periode
                const updatedPeriods: Periodeinfo<IArbeidstidPeriodeMedTimer>[] = [];

                allPeriods.forEach((existingPeriod) => {
                    if (!existingPeriod.periode) return;

                    const existingStart = dayjs(existingPeriod.periode.fom, formats.YYYYMMDD);
                    const existingEnd = dayjs(existingPeriod.periode.tom, formats.YYYYMMDD);

                    // Hvis eksisterende periode er helt innenfor den nye perioden, hopper vi over den
                    if (newStart.isSameOrBefore(existingStart) && newEnd.isSameOrAfter(existingEnd)) {
                        return;
                    }

                    // Hvis periodene overlapper delvis
                    if (newStart.isSameOrBefore(existingEnd) && newEnd.isSameOrAfter(existingStart)) {
                        // Hvis ny periode er helt innenfor eksisterende periode
                        if (newStart.isSameOrAfter(existingStart) && newEnd.isSameOrBefore(existingEnd)) {
                            // Deler opp eksisterende periode i tre deler
                            if (existingStart.isBefore(newStart)) {
                                updatedPeriods.push({
                                    ...existingPeriod,
                                    periode: {
                                        fom: existingStart.format(formats.YYYYMMDD),
                                        tom: newStart.subtract(1, 'day').format(formats.YYYYMMDD),
                                    },
                                });
                            }
                            if (newEnd.isBefore(existingEnd)) {
                                updatedPeriods.push({
                                    ...existingPeriod,
                                    periode: {
                                        fom: newEnd.add(1, 'day').format(formats.YYYYMMDD),
                                        tom: existingEnd.format(formats.YYYYMMDD),
                                    },
                                });
                            }
                        }
                        // Hvis ny periode overlapper delvis
                        else {
                            if (newStart.isBefore(existingStart)) {
                                updatedPeriods.push({
                                    ...newPeriod,
                                    periode: {
                                        fom: newStart.format(formats.YYYYMMDD),
                                        tom: existingStart.subtract(1, 'day').format(formats.YYYYMMDD),
                                    },
                                });
                            }
                            if (newEnd.isAfter(existingEnd)) {
                                updatedPeriods.push({
                                    ...newPeriod,
                                    periode: {
                                        fom: existingEnd.add(1, 'day').format(formats.YYYYMMDD),
                                        tom: newEnd.format(formats.YYYYMMDD),
                                    },
                                });
                            }
                        }
                    } else {
                        // Hvis periodene ikke overlapper, beholder eksisterende periode
                        updatedPeriods.push(existingPeriod);
                    }
                });

                // Legger til den nye perioden
                updatedPeriods.push(newPeriod);
                allPeriods = updatedPeriods;
            });

            // Sorterer perioder etter startdato
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
                <FieldArray
                    name="perioder"
                    render={(arrayHelpers) => (
                        <div>
                            <Heading level="1" size="medium">
                                Periode med jobb
                            </Heading>

                            {values.perioder && values.perioder.length > 0 ? (
                                values.perioder.map((periode, index) => (
                                    <div className="mb-8" key={index}>
                                        <ArbeidstidPeriode
                                            name={`perioder.${index}`}
                                            soknadsperioder={soknadsperioder}
                                            remove={() => arrayHelpers.remove(index)}
                                        />
                                    </div>
                                ))
                            ) : (
                                <div>Ingen perioder å vise</div>
                            )}
                            {touched.perioder && errors.perioder && typeof errors.perioder === 'string' && (
                                <Alert variant="error" className="mb-4">
                                    {errors.perioder}
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
            )}
        </Formik>
    );
};

export default ArbeidstidPeriodeListe;
