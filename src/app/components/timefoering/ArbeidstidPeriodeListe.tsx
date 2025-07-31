import React, { useRef } from 'react';

import { AddCircle } from '@navikt/ds-icons';
import { Alert, Button, Heading } from '@navikt/ds-react';
import { FieldArray, Formik, FormikProps } from 'formik';
import * as yup from 'yup';
import dayjs from 'dayjs';

import { ArbeidstidPeriodeMedTimer, IArbeidstidPeriodeMedTimer, IPeriode, Periodeinfo } from 'app/models/types';
import { arbeidstimerPeriode } from 'app/rules/yup';
import { formats } from 'app/utils';
import { processArbeidstidPeriods } from 'app/utils/arbeidstidPeriodUtils';
import { checkArbeidstidWithinSoknadsperioder } from 'app/utils/periodUtils';

import ArbeidstidPeriode from './ArbeidstidPeriode';

// Funksjon for å formatere søknadsperioder til lesbar tekst
const formatSoknadsperioder = (soknadsperioder: IPeriode[]): string => {
    if (!soknadsperioder || soknadsperioder.length === 0) {
        return '';
    }

    return soknadsperioder
        .filter((periode) => periode.fom && periode.tom)
        .map((periode) => {
            const fom = dayjs(periode.fom, formats.YYYYMMDD).format('DD.MM.YYYY');
            const tom = dayjs(periode.tom, formats.YYYYMMDD).format('DD.MM.YYYY');
            return `${fom} - ${tom}`;
        })
        .join(', ');
};

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

const createValidationSchema = (soknadsperioder: IPeriode[]) =>
    yup.object({
        perioder: yup
            .array()
            .of(arbeidstimerPeriode)
            .test('no-overlap', 'Perioder kan ikke overlappe hverandre', (periods) => {
                if (!periods) return true;
                return !checkPeriodOverlap(periods as Periodeinfo<IArbeidstidPeriodeMedTimer>[]);
            })
            .test(
                'within-soknadsperioder',
                `Arbeidstid må være innenfor søknadsperioder. Gyldig interval: [${formatSoknadsperioder(soknadsperioder)}]`,
                (periods) => {
                    if (!periods) return true;
                    return !checkArbeidstidWithinSoknadsperioder(
                        periods as Periodeinfo<IArbeidstidPeriodeMedTimer>[],
                        soknadsperioder,
                    );
                },
            ),
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

const ArbeidstidPeriodeListe = (props: Props) => {
    const formikRef = useRef<FormikProps<FormValues>>(null);

    const { arbeidstidPerioder, soknadsperioder } = props;
    const { lagre, avbryt } = props;

    const initialValues: { perioder: Periodeinfo<IArbeidstidPeriodeMedTimer>[] } = {
        perioder: [
            new ArbeidstidPeriodeMedTimer({
                periode: { fom: '', tom: '' },
                faktiskArbeidPerDag: { timer: '', minutter: '' },
                jobberNormaltPerDag: { timer: '', minutter: '' },
            }),
        ],
    };

    // TEMPORÆRT KOMMENTERT UT - BRUKER NY UTILITY
    // const handleSaveValues = (values?: { perioder: Periodeinfo<IArbeidstidPeriodeMedTimer>[] }) => {
    //     const currentValues = values || formikRef.current?.values;

    //     if (currentValues) {
    //         // Starter med eksisterende perioder
    //         let allPeriods: Periodeinfo<IArbeidstidPeriodeMedTimer>[] = [...arbeidstidPerioder];

    //         // Behandler nye perioder
    //         currentValues.perioder.forEach((newPeriod) => {
    //             if (!newPeriod || !newPeriod.periode) return;

    //             const newStart = dayjs(newPeriod.periode.fom, formats.YYYYMMDD);
    //             const newEnd = dayjs(newPeriod.periode.tom, formats.YYYYMMDD);

    //             // Behandler hver eksisterende periode
    //             const updatedPeriods: Periodeinfo<IArbeidstidPeriodeMedTimer>[] = [];

    //             allPeriods.forEach((existingPeriod) => {
    //                 if (!existingPeriod.periode) return;

    //                 const existingStart = dayjs(existingPeriod.periode.fom, formats.YYYYMMDD);
    //                 const existingEnd = dayjs(existingPeriod.periode.tom, formats.YYYYMMDD);

    //                 // Hvis eksisterende periode er helt innenfor den nye perioden, hopper vi over den
    //                 if (newStart.isSameOrBefore(existingStart) && newEnd.isSameOrAfter(existingEnd)) {
    //                         return;
    //                     }

    //                     // Hvis periodene overlapper delvis
    //                     if (newStart.isSameOrBefore(existingEnd) && newEnd.isSameOrAfter(existingStart)) {
    //                         // Hvis ny periode er helt innenfor eksisterende periode
    //                         if (newStart.isSameOrAfter(existingStart) && newEnd.isSameOrBefore(existingEnd)) {
    //                             // Deler opp eksisterende periode i tre deler
    //                             if (existingStart.isBefore(newStart)) {
    //                                 updatedPeriods.push({
    //                                     ...existingPeriod,
    //                                     periode: {
    //                                         fom: existingStart.format(formats.YYYYMMDD),
    //                                         tom: newStart.subtract(1, 'day').format(formats.YYYYMMDD),
    //                                     },
    //                                 });
    //                             }
    //                             if (newEnd.isBefore(existingEnd)) {
    //                                 updatedPeriods.push({
    //                                     ...existingPeriod,
    //                                     periode: {
    //                                         fom: newEnd.add(1, 'day').format(formats.YYYYMMDD),
    //                                         tom: existingEnd.format(formats.YYYYMMDD),
    //                                     },
    //                                 });
    //                             }
    //                         }
    //                         // Hvis ny periode overlapper delvis
    //                         else {
    //                             if (newStart.isBefore(existingStart)) {
    //                                 updatedPeriods.push({
    //                                     ...newPeriod,
    //                                     periode: {
    //                                         fom: newStart.format(formats.YYYYMMDD),
    //                                         tom: existingStart.subtract(1, 'day').format(formats.YYYYMMDD),
    //                                     },
    //                                 });
    //                             }
    //                             if (newEnd.isAfter(existingEnd)) {
    //                                 updatedPeriods.push({
    //                                     ...newPeriod,
    //                                     periode: {
    //                                         fom: existingEnd.add(1, 'day').format(formats.YYYYMMDD),
    //                                         tom: newEnd.format(formats.YYYYMMDD),
    //                                     },
    //                                 });
    //                             }
    //                         }
    //                     } else {
    //                         // Hvis periodene ikke overlapper, beholder eksisterende periode
    //                         updatedPeriods.push(existingPeriod);
    //                     }
    //                 });

    //                 // Legger til den nye perioden
    //                 updatedPeriods.push(newPeriod);
    //                 allPeriods = updatedPeriods;
    //             });

    //             // Sorterer perioder etter startdato
    //             const processedPeriods = allPeriods
    //                 .map((v) => konverterPeriodeTilTimerOgMinutter(v))
    //                 .sort(
    //                         (a, b) =>
    //                             dayjs(a.periode.fom, formats.YYYYMMDD).valueOf() -
    //                             dayjs(b.periode.fom, formats.YYYYMMDD).valueOf(),
    //                     );

    //             lagre(processedPeriods);
    //         }
    //     };
    // };

    // NY UTILITY-BASERT VERSJON
    const handleSaveValues = (values?: { perioder: Periodeinfo<IArbeidstidPeriodeMedTimer>[] }) => {
        const currentValues = values || formikRef.current?.values;

        if (currentValues) {
            // Bruker ny utility-funksjon for å behandle perioder
            const processedPeriods = processArbeidstidPeriods(
                currentValues.perioder,
                arbeidstidPerioder,
                { filterWeekends: false }, // Kan endres til true hvis vi vil filtrere helger
            );

            lagre(processedPeriods);
        }
    };

    return (
        <Formik<FormValues>
            initialValues={initialValues}
            onSubmit={(values) => handleSaveValues(values)}
            validationSchema={createValidationSchema(soknadsperioder)}
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
