import dayjs from 'dayjs';

import { IOmsorgstid, Periodeinfo } from 'app/models/types';

import { IArbeidstidPeriodeMedTimer, IPeriode, Periode } from '../models/types/Periode';
import { formats } from './formatUtils';
import {
    countDatesInDateRange,
    findDateIntervalsFromDates,
    initializeDate,
    removeDatesFromDateRange,
    getDatesInDateRange,
} from './timeUtils';

const sortPeriodsByFomDate = (period1: Periode, period2: Periode): number => {
    if (period1.startsBefore(period2)) {
        return -1;
    }
    if (period2.startsBefore(period1)) {
        return 1;
    }
    return 0;
};

const isDateSameOrBefore = (date: string, otherDate: string) => {
    const dateFormats = ['YYYY-MM-DD', 'DD.MM.YYYY'];
    const dateInQuestion = initializeDate(date, dateFormats);
    const formattedOtherDate = initializeDate(otherDate, dateFormats);
    return dateInQuestion.isBefore(formattedOtherDate) || dateInQuestion.isSame(formattedOtherDate);
};

const checkIfPeriodsAreEdgeToEdge = (period: Periode, otherPeriod: Periode) => {
    const dayAfterPeriod = initializeDate(period.tom).add(1, 'day');
    const startOfNextPeriod = initializeDate(otherPeriod.fom);
    return dayAfterPeriod.isSame(startOfNextPeriod);
};

export const slåSammenSammenhengendePerioder = (periods: Periode[]): Periode[] => {
    if (!periods || periods.length === 0) {
        return [];
    }

    const sortedPeriods = periods.sort((p1, p2) => sortPeriodsByFomDate(p1, p2));
    const combinedPeriods: Periode[] = [];

    const getFirstDate = (date1: string, date2: string) => {
        if (isDateSameOrBefore(date1, date2)) {
            return date1;
        }

        return date2;
    };

    const getLastDate = (date1: string, date2: string) => {
        if (isDateSameOrBefore(date1, date2)) {
            return date2;
        }

        return date1;
    };

    const checkIfPeriodCanBeCombinedWithPreviousPeriod = (period: Periode, previousPeriod?: Periode) => {
        if (!previousPeriod) {
            return false;
        }
        const hasOverlapWithPreviousPeriod = previousPeriod.includesDate(period.fom);
        const periodsAreEdgeToEdge = checkIfPeriodsAreEdgeToEdge(previousPeriod, period);
        return hasOverlapWithPreviousPeriod || periodsAreEdgeToEdge;
    };

    const combinePeriods = (period: Periode, otherPeriod: Periode) => {
        const firstFom = getFirstDate(period.fom, otherPeriod.fom);
        const lastTom = getLastDate(period.tom, otherPeriod.tom);
        const combinedPeriod = new Periode({ fom: firstFom, tom: lastTom });
        return combinedPeriod;
    };

    const addToListIfNotAdded = (period: Periode) => {
        const previousPeriod = combinedPeriods[combinedPeriods.length - 1];
        const canBeCombinedWithPreviousPeriod = checkIfPeriodCanBeCombinedWithPreviousPeriod(period, previousPeriod);

        if (canBeCombinedWithPreviousPeriod) {
            const combinedPeriod = combinePeriods(period, previousPeriod);
            combinedPeriods[combinedPeriods.length - 1] = combinedPeriod;
        } else {
            combinedPeriods.push(period);
        }
    };

    let skipNextPeriod = false;

    sortedPeriods.forEach((period, index, array) => {
        if (!skipNextPeriod) {
            const nextPeriod = array[index + 1];
            if (nextPeriod) {
                const hasOverlapWithNextPeriod = nextPeriod.includesDate(period.tom);
                const periodsAreEdgeToEdge = checkIfPeriodsAreEdgeToEdge(period, nextPeriod);

                if (hasOverlapWithNextPeriod || periodsAreEdgeToEdge) {
                    const combinedPeriod = combinePeriods(period, nextPeriod);
                    combinedPeriods.push(combinedPeriod);
                    skipNextPeriod = true;
                } else {
                    addToListIfNotAdded(period);
                }
            } else {
                addToListIfNotAdded(period);
            }
        } else {
            skipNextPeriod = false;
        }
    });
    return combinedPeriods;
};

export const removeDatesFromPeriods = (
    periods: Periodeinfo<IArbeidstidPeriodeMedTimer | IOmsorgstid>[],
    datesToBeRemoved: Date[],
) =>
    periods
        .map((periodeMedTimer) => {
            const periode = new Periode(periodeMedTimer?.periode || {});
            const dateRange = periode.tilDateRange();
            if (countDatesInDateRange(dateRange) > 1) {
                const filteredDates = removeDatesFromDateRange(dateRange, datesToBeRemoved);
                const dateIntervals = findDateIntervalsFromDates(filteredDates);

                const nyePerioder = dateIntervals.map((dateArray) => ({
                    fom: dayjs(dateArray[0]).format(formats.YYYYMMDD),
                    tom: dayjs(dateArray[dateArray.length - 1]).format(formats.YYYYMMDD),
                }));
                const perioderMedArbeidstid = nyePerioder.map((nyPeriode) => ({
                    ...periodeMedTimer,
                    periode: nyPeriode,
                }));

                return perioderMedArbeidstid;
            }
            return datesToBeRemoved.some((date) => periode.includesDate(date)) ? false : periodeMedTimer;
        })
        .filter(Boolean)
        .flat();

export const includesDate = (periode: IPeriode, day: string | Date) => {
    const dateInQuestion = initializeDate(day);

    const fomDayjs = initializeDate(periode.fom);
    const tomDayjs = initializeDate(periode.tom);

    return (
        (dateInQuestion.isSame(fomDayjs) || dateInQuestion.isAfter(fomDayjs)) &&
        (dateInQuestion.isSame(tomDayjs) || dateInQuestion.isBefore(tomDayjs))
    );
};

/**
 * Sjekker om arbeidstidperioder er innenfor søknadsperioder
 * Hver arbeidstidperiode må være helt innenfor én søknadsperiode
 *
 * @param arbeidstidPerioder - Liste over arbeidstidperioder som skal valideres
 * @param soknadsperioder - Liste over søknadsperioder som arbeidstidperioder må være innenfor
 * @returns true hvis noen periode er utenfor søknadsperioder, false hvis alle perioder er innenfor
 */
export const checkArbeidstidWithinSoknadsperioder = (
    arbeidstidPerioder: Periodeinfo<IArbeidstidPeriodeMedTimer>[],
    soknadsperioder: IPeriode[],
): boolean => {
    // Hvis ingen søknadsperioder er definert, returnerer vi false (ingen validering)
    if (!soknadsperioder || soknadsperioder.length === 0) {
        return false;
    }

    // Går gjennom hver arbeidstidperiode
    for (const arbeidstidPeriode of arbeidstidPerioder) {
        // Hopp over perioder uten gyldig dato
        if (!arbeidstidPeriode.periode?.fom || !arbeidstidPeriode.periode?.tom) {
            continue;
        }

        const arbeidstidStart = dayjs(arbeidstidPeriode.periode.fom, formats.YYYYMMDD);
        const arbeidstidEnd = dayjs(arbeidstidPeriode.periode.tom, formats.YYYYMMDD);

        // Sjekker om arbeidstidperioden er helt innenfor minst én søknadsperiode
        const erInnenforEnSoknadsperiode = soknadsperioder.some((soknadsperiode) => {
            // Hopp over søknadsperioder uten gyldig dato
            if (!soknadsperiode.fom || !soknadsperiode.tom) {
                return false;
            }

            const soknadsStart = dayjs(soknadsperiode.fom, formats.YYYYMMDD);
            const soknadsEnd = dayjs(soknadsperiode.tom, formats.YYYYMMDD);

            // Arbeidstidperioden må være helt innenfor søknadsperioden
            // Starter på eller etter start av søknadsperiode og slutter på eller før slutt av søknadsperiode
            return arbeidstidStart.isSameOrAfter(soknadsStart) && arbeidstidEnd.isSameOrBefore(soknadsEnd);
        });

        // Hvis denne arbeidstidperioden ikke er innenfor noen søknadsperiode, returnerer vi true (validering feilet)
        if (!erInnenforEnSoknadsperiode) {
            return true;
        }
    }

    // Alle arbeidstidperioder er innenfor søknadsperioder
    return false;
};

/**
 * Formaterer søknadsperioder til lesbar tekst
 * @param soknadsperioder - Liste over søknadsperioder som skal formateres
 * @returns Formatert streng med perioder
 */
export const formatSoknadsperioder = (soknadsperioder: IPeriode[]): string => {
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

/**
 * Sjekker om perioder er innenfor søknadsperioder ved å validere hver enkelt dato
 * Hver dato i perioden må være innenfor minst én søknadsperiode
 * Dette tillater perioder som spenner over flere søknadsperioder, så lenge alle datoer er dekket
 *
 * @param perioder - Liste over perioder som skal valideres
 * @param soknadsperioder - Liste over søknadsperioder som perioder må være innenfor
 * @returns true hvis noen periode er utenfor søknadsperioder, false hvis alle perioder er innenfor
 */
export const validatePeriodsWithinSoknadsperioder = <T>(
    perioder: Periodeinfo<T>[],
    soknadsperioder: IPeriode[],
): boolean => {
    // Hvis ingen søknadsperioder er definert, returnerer vi false (ingen validering)
    if (!soknadsperioder || soknadsperioder.length === 0) {
        return false;
    }

    // Går gjennom hver periode
    for (const periode of perioder) {
        // Hopp over perioder uten gyldig dato
        if (!periode.periode?.fom || !periode.periode?.tom) {
            continue;
        }

        // Hent alle datoer i perioden
        const dateRange = {
            fom: dayjs(periode.periode.fom, formats.YYYYMMDD).toDate(),
            tom: dayjs(periode.periode.tom, formats.YYYYMMDD).toDate(),
        };
        const datesInPeriod = getDatesInDateRange(dateRange);

        // Sjekker om hver dato i perioden er innenfor minst én søknadsperiode
        for (const date of datesInPeriod) {
            const erInnenforEnSoknadsperiode = soknadsperioder.some((soknadsperiode) => {
                // Hopp over søknadsperioder uten gyldig dato
                if (!soknadsperiode.fom || !soknadsperiode.tom) {
                    return false;
                }

                // Sjekk om datoen er innenfor denne søknadsperioden
                return includesDate(soknadsperiode, date);
            });

            // Hvis denne datoen ikke er innenfor noen søknadsperiode, returnerer vi true (validering feilet)
            if (!erInnenforEnSoknadsperiode) {
                return true;
            }
        }
    }

    // Alle perioder er innenfor søknadsperioder
    return false;
};

/**
 * Sjekker om perioder overlapper hverandre
 * @param perioder - Liste over perioder som skal sjekkes
 * @returns true hvis perioder overlapper, false hvis ikke
 */
export const checkPeriodOverlap = <T>(periods: Periodeinfo<T>[]): boolean => {
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

/**
 * Generisk funksjon for å gruppere sammenhengende arbeidsdager
 * @param workDays - Liste over arbeidsdager
 * @param templatePeriod - Template periode som brukes for å lage nye perioder
 * @returns Liste over perioder med sammenhengende arbeidsdager
 */
const groupConsecutiveWorkDaysGeneric = <T>(workDays: Date[], templatePeriod: Periodeinfo<T>): Periodeinfo<T>[] => {
    if (workDays.length === 0) {
        return [];
    }

    const periods: Periodeinfo<T>[] = [];
    let currentGroup: Date[] = [workDays[0]];

    for (let i = 1; i < workDays.length; i++) {
        const currentDay = workDays[i];
        const previousDay = workDays[i - 1];

        // Sjekk om dagene er sammenhengende (ingen helger mellom)
        const daysDiff = dayjs(currentDay).diff(dayjs(previousDay), 'day');
        if (daysDiff <= 1) {
            currentGroup.push(currentDay);
        } else {
            // Avslutt nåværende gruppe og start ny
            if (currentGroup.length > 0) {
                periods.push({
                    ...templatePeriod,
                    periode: {
                        fom: dayjs(currentGroup[0]).format(formats.YYYYMMDD),
                        tom: dayjs(currentGroup[currentGroup.length - 1]).format(formats.YYYYMMDD),
                    },
                });
            }
            currentGroup = [currentDay];
        }
    }

    // Legg til siste gruppe
    if (currentGroup.length > 0) {
        periods.push({
            ...templatePeriod,
            periode: {
                fom: dayjs(currentGroup[0]).format(formats.YYYYMMDD),
                tom: dayjs(currentGroup[currentGroup.length - 1]).format(formats.YYYYMMDD),
            },
        });
    }

    return periods;
};

/**
 * Generisk funksjon for å filtrere bort helger fra perioder
 * @param periods - Liste over perioder som skal filtreres
 * @returns Liste over perioder kun med arbeidsdager
 */
export const filterWeekendsFromPeriodsGeneric = <T>(periods: Periodeinfo<T>[]): Periodeinfo<T>[] => {
    const workDayPeriods: Periodeinfo<T>[] = [];

    periods.forEach((period) => {
        if (!period.periode?.fom || !period.periode?.tom) {
            return;
        }

        const startDate = dayjs(period.periode.fom, formats.YYYYMMDD);
        const endDate = dayjs(period.periode.tom, formats.YYYYMMDD);

        // Hent alle arbeidsdager i perioden
        const allDays = getDatesInDateRange(
            { fom: startDate.toDate(), tom: endDate.toDate() },
            true, // onlyWeekDays = true
        );

        // Grupper sammenhengende arbeidsdager
        const workDayGroups = groupConsecutiveWorkDaysGeneric(allDays, period);
        workDayPeriods.push(...workDayGroups);
    });

    return workDayPeriods;
};

/**
 * Generisk funksjon for å håndtere overlapp mellom perioder
 *
 * @param newPeriod - Ny periode som skal legges til
 * @param existingPeriods - Liste over eksisterende perioder
 * @returns Oppdatert liste over perioder uten overlapp
 */
const handlePeriodOverlapsGeneric = <T>(
    newPeriod: Periodeinfo<T>,
    existingPeriods: Periodeinfo<T>[],
): Periodeinfo<T>[] => {
    if (!newPeriod.periode?.fom || !newPeriod.periode?.tom) {
        return existingPeriods;
    }

    const newStart = dayjs(newPeriod.periode.fom, formats.YYYYMMDD);
    const newEnd = dayjs(newPeriod.periode.tom, formats.YYYYMMDD);
    const updatedPeriods: Periodeinfo<T>[] = [];

    existingPeriods.forEach((existingPeriod) => {
        if (!existingPeriod.periode?.fom || !existingPeriod.periode?.tom) {
            updatedPeriods.push(existingPeriod);
            return;
        }

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
    return updatedPeriods;
};

/**
 * Hovedfunksjon for å behandle tilsynperioder
 *
 * @param newPeriods - Nye perioder som skal legges til
 * @param existingPeriods - Eksisterende perioder
 * @param options - Alternativer for behandling
 * @returns Behandlet liste over perioder
 */
export const processTilsynPeriods = (
    newPeriods: Periodeinfo<IOmsorgstid>[],
    existingPeriods: Periodeinfo<IOmsorgstid>[],
    options: { filterWeekends?: boolean } = {},
): Periodeinfo<IOmsorgstid>[] => {
    let allPeriods: Periodeinfo<IOmsorgstid>[] = [...existingPeriods];

    // Behandler nye perioder
    newPeriods.forEach((newPeriod) => {
        if (!newPeriod || !newPeriod.periode) return;

        // Filtrerer bort helger hvis det er aktivert
        let processedNewPeriods = [newPeriod];
        if (options.filterWeekends) {
            processedNewPeriods = filterWeekendsFromPeriodsGeneric([newPeriod]);
        }

        // Behandler hver behandlet periode
        processedNewPeriods.forEach((processedPeriod) => {
            allPeriods = handlePeriodOverlapsGeneric(processedPeriod, allPeriods);
        });
    });

    // Sorterer perioder etter startdato
    return allPeriods.sort(
        (a, b) => dayjs(a.periode?.fom, formats.YYYYMMDD).valueOf() - dayjs(b.periode?.fom, formats.YYYYMMDD).valueOf(),
    );
};

/**
 * Finner minste fom (fra og med) dato fra en liste over perioder
 * @param perioder - Liste over perioder (Periode[] eller IPeriode[])
 * @returns Minste fom dato som dayjs objekt, eller null hvis ingen gyldige perioder
 */
export const getMinFomFromPeriods = (perioder: (Periode | IPeriode)[]): ReturnType<typeof initializeDate> | null => {
    if (!perioder || perioder.length === 0) {
        return null;
    }

    return perioder.reduce(
        (min, periode) => {
            if (!periode.fom) {
                return min;
            }
            const periodeFom = initializeDate(periode.fom);
            return !min || periodeFom.isBefore(min) ? periodeFom : min;
        },
        null as ReturnType<typeof initializeDate> | null,
    );
};

/**
 * Finner største tom (til og med) dato fra en liste over perioder
 * @param perioder - Liste over perioder (Periode[] eller IPeriode[])
 * @returns Største tom dato som dayjs objekt, eller null hvis ingen gyldige perioder
 */
export const getMaxTomFromPeriods = (perioder: (Periode | IPeriode)[]): ReturnType<typeof initializeDate> | null => {
    if (!perioder || perioder.length === 0) {
        return null;
    }

    return perioder.reduce(
        (max, periode) => {
            if (!periode.tom) {
                return max;
            }
            const periodeTom = initializeDate(periode.tom);
            return !max || periodeTom.isAfter(max) ? periodeTom : max;
        },
        null as ReturnType<typeof initializeDate> | null,
    );
};

/**
 * Sjekker om noen perioder går utenfor grensene for eksisterende perioder
 * @param perioderSomSkalSjekkes - Perioder som skal sjekkes (IPeriode[])
 * @param eksisterendePerioder - Eksisterende perioder som definerer grensene (Periode[] eller IPeriode[])
 * @returns true hvis noen periode går utenfor grensene, false hvis alle perioder er innenfor
 */
export const checkPeriodsOutsideBounds = (
    perioderSomSkalSjekkes: IPeriode[],
    eksisterendePerioder: (Periode | IPeriode)[],
): boolean => {
    if (!perioderSomSkalSjekkes || perioderSomSkalSjekkes.length === 0) {
        return false;
    }

    if (!eksisterendePerioder || eksisterendePerioder.length === 0) {
        return false;
    }

    const minEksisterendeFom = getMinFomFromPeriods(eksisterendePerioder);
    const maxEksisterendeTom = getMaxTomFromPeriods(eksisterendePerioder);

    if (!minEksisterendeFom || !maxEksisterendeTom) {
        return false;
    }

    return perioderSomSkalSjekkes.some((periode) => {
        if (!periode.fom || !periode.tom) {
            return false;
        }
        const periodeFom = initializeDate(periode.fom);
        const periodeTom = initializeDate(periode.tom);
        return periodeFom.isBefore(minEksisterendeFom) || periodeTom.isAfter(maxEksisterendeTom);
    });
};
