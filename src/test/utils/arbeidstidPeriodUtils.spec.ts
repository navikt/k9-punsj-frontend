import {
    groupConsecutiveWorkDays,
    filterWeekendsFromPeriods,
    handlePeriodOverlaps,
    processArbeidstidPeriods,
} from '../../app/utils/arbeidstidPeriodUtils';
import { IArbeidstidPeriodeMedTimer, Periodeinfo } from '../../app/models/types';

describe('arbeidstidPeriodUtils', () => {
    describe('groupConsecutiveWorkDays', () => {
        it('skal returnere tom liste når ingen arbeidsdager er gitt', () => {
            const templatePeriod: Periodeinfo<IArbeidstidPeriodeMedTimer> = {
                periode: { fom: '2024-01-01', tom: '2024-01-05' },
                faktiskArbeidPerDag: { timer: '8', minutter: '0' },
                jobberNormaltPerDag: { timer: '8', minutter: '0' },
            };

            const result = groupConsecutiveWorkDays([], templatePeriod);
            expect(result).toEqual([]);
        });

        it('skal gruppere sammenhengende arbeidsdager', () => {
            const templatePeriod: Periodeinfo<IArbeidstidPeriodeMedTimer> = {
                periode: { fom: '2024-01-01', tom: '2024-01-05' },
                faktiskArbeidPerDag: { timer: '8', minutter: '0' },
                jobberNormaltPerDag: { timer: '8', minutter: '0' },
            };

            const workDays = [
                new Date('2024-01-01'), // Mandag
                new Date('2024-01-02'), // Tirsdag
                new Date('2024-01-03'), // Onsdag
                new Date('2024-01-08'), // Mandag (neste uke)
                new Date('2024-01-09'), // Tirsdag
            ];

            const result = groupConsecutiveWorkDays(workDays, templatePeriod);

            expect(result).toHaveLength(2);
            expect(result[0].periode?.fom).toBe('2024-01-01');
            expect(result[0].periode?.tom).toBe('2024-01-03');
            expect(result[1].periode?.fom).toBe('2024-01-08');
            expect(result[1].periode?.tom).toBe('2024-01-09');
        });

        it('skal håndtere kun én arbeidsdag', () => {
            const templatePeriod: Periodeinfo<IArbeidstidPeriodeMedTimer> = {
                periode: { fom: '2024-01-01', tom: '2024-01-05' },
                faktiskArbeidPerDag: { timer: '8', minutter: '0' },
                jobberNormaltPerDag: { timer: '8', minutter: '0' },
            };

            const workDays = [new Date('2024-01-01')]; // Kun mandag

            const result = groupConsecutiveWorkDays(workDays, templatePeriod);

            expect(result).toHaveLength(1);
            expect(result[0].periode?.fom).toBe('2024-01-01');
            expect(result[0].periode?.tom).toBe('2024-01-01');
        });

        it('skal håndtere usorterte arbeidsdager', () => {
            const templatePeriod: Periodeinfo<IArbeidstidPeriodeMedTimer> = {
                periode: { fom: '2024-01-01', tom: '2024-01-05' },
                faktiskArbeidPerDag: { timer: '8', minutter: '0' },
                jobberNormaltPerDag: { timer: '8', minutter: '0' },
            };

            const workDays = [
                new Date('2024-01-03'), // Onsdag
                new Date('2024-01-01'), // Mandag
                new Date('2024-01-02'), // Tirsdag
            ];

            const result = groupConsecutiveWorkDays(workDays, templatePeriod);

            expect(result).toHaveLength(1);
            expect(result[0].periode?.fom).toBe('2024-01-01');
            expect(result[0].periode?.tom).toBe('2024-01-03');
        });

        it('skal kopiere andre felter fra template', () => {
            const templatePeriod: Periodeinfo<IArbeidstidPeriodeMedTimer> = {
                periode: { fom: '2024-01-01', tom: '2024-01-05' },
                faktiskArbeidPerDag: { timer: '7.5', minutter: '30' },
                jobberNormaltPerDag: { timer: '8', minutter: '0' },
            };

            const workDays = [new Date('2024-01-01')];

            const result = groupConsecutiveWorkDays(workDays, templatePeriod);

            expect(result[0].faktiskArbeidPerDag).toEqual({ timer: '7.5', minutter: '30' });
            expect(result[0].jobberNormaltPerDag).toEqual({ timer: '8', minutter: '0' });
        });
    });

    describe('filterWeekendsFromPeriods', () => {
        it('skal filtrere bort helger fra perioder', () => {
            const periods: Periodeinfo<IArbeidstidPeriodeMedTimer>[] = [
                {
                    periode: { fom: '2024-01-01', tom: '2024-01-07' }, // Mandag til søndag
                    faktiskArbeidPerDag: { timer: '8', minutter: '0' },
                    jobberNormaltPerDag: { timer: '8', minutter: '0' },
                },
            ];

            const result = filterWeekendsFromPeriods(periods);

            expect(result).toHaveLength(1);
            expect(result[0].periode?.fom).toBe('2024-01-01');
            expect(result[0].periode?.tom).toBe('2024-01-05'); // Kun mandag til fredag
        });

        it('skal håndtere periode som kun inneholder helger', () => {
            const periods: Periodeinfo<IArbeidstidPeriodeMedTimer>[] = [
                {
                    periode: { fom: '2024-01-06', tom: '2024-01-07' }, // Lørdag til søndag
                    faktiskArbeidPerDag: { timer: '8', minutter: '0' },
                    jobberNormaltPerDag: { timer: '8', minutter: '0' },
                },
            ];

            const result = filterWeekendsFromPeriods(periods);

            expect(result).toHaveLength(0); // Ingen arbeidsdager
        });

        it('skal håndtere periode som starter på helg og slutter på arbeidsdag', () => {
            const periods: Periodeinfo<IArbeidstidPeriodeMedTimer>[] = [
                {
                    periode: { fom: '2024-01-06', tom: '2024-01-08' }, // Lørdag til mandag
                    faktiskArbeidPerDag: { timer: '8', minutter: '0' },
                    jobberNormaltPerDag: { timer: '8', minutter: '0' },
                },
            ];

            const result = filterWeekendsFromPeriods(periods);

            expect(result).toHaveLength(1);
            expect(result[0].periode?.fom).toBe('2024-01-08');
            expect(result[0].periode?.tom).toBe('2024-01-08'); // Kun mandag
        });

        it('skal håndtere periode som starter på arbeidsdag og slutter på helg', () => {
            const periods: Periodeinfo<IArbeidstidPeriodeMedTimer>[] = [
                {
                    periode: { fom: '2024-01-03', tom: '2024-01-06' }, // Onsdag til lørdag
                    faktiskArbeidPerDag: { timer: '8', minutter: '0' },
                    jobberNormaltPerDag: { timer: '8', minutter: '0' },
                },
            ];

            const result = filterWeekendsFromPeriods(periods);

            expect(result).toHaveLength(1);
            expect(result[0].periode?.fom).toBe('2024-01-03');
            expect(result[0].periode?.tom).toBe('2024-01-05'); // Onsdag til fredag
        });

        it('skal håndtere flere perioder samtidig', () => {
            const periods: Periodeinfo<IArbeidstidPeriodeMedTimer>[] = [
                {
                    periode: { fom: '2024-01-01', tom: '2024-01-07' }, // Mandag til søndag
                    faktiskArbeidPerDag: { timer: '8', minutter: '0' },
                    jobberNormaltPerDag: { timer: '8', minutter: '0' },
                },
                {
                    periode: { fom: '2024-01-08', tom: '2024-01-14' }, // Mandag til søndag
                    faktiskArbeidPerDag: { timer: '7.5', minutter: '30' },
                    jobberNormaltPerDag: { timer: '8', minutter: '0' },
                },
            ];

            const result = filterWeekendsFromPeriods(periods);

            expect(result).toHaveLength(2);
            expect(result[0].periode?.fom).toBe('2024-01-01');
            expect(result[0].periode?.tom).toBe('2024-01-05');
            expect(result[1].periode?.fom).toBe('2024-01-08');
            expect(result[1].periode?.tom).toBe('2024-01-12');
        });

        it('skal håndtere periode uten gyldig dato', () => {
            const periods: Periodeinfo<IArbeidstidPeriodeMedTimer>[] = [
                {
                    periode: { fom: '', tom: '2024-01-07' },
                    faktiskArbeidPerDag: { timer: '8', minutter: '0' },
                    jobberNormaltPerDag: { timer: '8', minutter: '0' },
                },
            ];

            const result = filterWeekendsFromPeriods(periods);

            expect(result).toHaveLength(0);
        });
    });

    describe('handlePeriodOverlaps', () => {
        it('skal håndtere perioder uten overlapp', () => {
            const newPeriod: Periodeinfo<IArbeidstidPeriodeMedTimer> = {
                periode: { fom: '2024-01-01', tom: '2024-01-05' },
                faktiskArbeidPerDag: { timer: '8', minutter: '0' },
                jobberNormaltPerDag: { timer: '8', minutter: '0' },
            };

            const existingPeriods: Periodeinfo<IArbeidstidPeriodeMedTimer>[] = [
                {
                    periode: { fom: '2024-01-10', tom: '2024-01-15' },
                    faktiskArbeidPerDag: { timer: '8', minutter: '0' },
                    jobberNormaltPerDag: { timer: '8', minutter: '0' },
                },
            ];

            const result = handlePeriodOverlaps(newPeriod, existingPeriods);

            expect(result).toHaveLength(2); // Ny periode + eksisterende periode
        });

        it('skal håndtere ny periode som overlapper eksisterende periode', () => {
            const newPeriod: Periodeinfo<IArbeidstidPeriodeMedTimer> = {
                periode: { fom: '2024-01-03', tom: '2024-01-07' },
                faktiskArbeidPerDag: { timer: '8', minutter: '0' },
                jobberNormaltPerDag: { timer: '8', minutter: '0' },
            };

            const existingPeriods: Periodeinfo<IArbeidstidPeriodeMedTimer>[] = [
                {
                    periode: { fom: '2024-01-01', tom: '2024-01-05' },
                    faktiskArbeidPerDag: { timer: '8', minutter: '0' },
                    jobberNormaltPerDag: { timer: '8', minutter: '0' },
                },
            ];

            const result = handlePeriodOverlaps(newPeriod, existingPeriods);

            expect(result).toHaveLength(2); // Del av eksisterende + ny periode
            expect(result[0].periode?.fom).toBe('2024-01-06'); // Del av eksisterende periode
            expect(result[1].periode?.fom).toBe('2024-01-03'); // Ny periode
        });

        it('skal håndtere ny periode som er helt innenfor eksisterende periode', () => {
            const newPeriod: Periodeinfo<IArbeidstidPeriodeMedTimer> = {
                periode: { fom: '2024-01-03', tom: '2024-01-04' },
                faktiskArbeidPerDag: { timer: '8', minutter: '0' },
                jobberNormaltPerDag: { timer: '8', minutter: '0' },
            };

            const existingPeriods: Periodeinfo<IArbeidstidPeriodeMedTimer>[] = [
                {
                    periode: { fom: '2024-01-01', tom: '2024-01-05' },
                    faktiskArbeidPerDag: { timer: '8', minutter: '0' },
                    jobberNormaltPerDag: { timer: '8', minutter: '0' },
                },
            ];

            const result = handlePeriodOverlaps(newPeriod, existingPeriods);

            expect(result).toHaveLength(3); // Første del + ny periode + siste del
        });

        it('skal håndtere ny periode som inneholder eksisterende periode', () => {
            const newPeriod: Periodeinfo<IArbeidstidPeriodeMedTimer> = {
                periode: { fom: '2024-01-01', tom: '2024-01-10' },
                faktiskArbeidPerDag: { timer: '8', minutter: '0' },
                jobberNormaltPerDag: { timer: '8', minutter: '0' },
            };

            const existingPeriods: Periodeinfo<IArbeidstidPeriodeMedTimer>[] = [
                {
                    periode: { fom: '2024-01-03', tom: '2024-01-07' },
                    faktiskArbeidPerDag: { timer: '8', minutter: '0' },
                    jobberNormaltPerDag: { timer: '8', minutter: '0' },
                },
            ];

            const result = handlePeriodOverlaps(newPeriod, existingPeriods);

            expect(result).toHaveLength(1); // Kun ny periode (eksisterende fjernet)
        });

        it('skal håndtere periode uten gyldig dato', () => {
            const newPeriod: Periodeinfo<IArbeidstidPeriodeMedTimer> = {
                periode: { fom: '', tom: '2024-01-05' },
                faktiskArbeidPerDag: { timer: '8', minutter: '0' },
                jobberNormaltPerDag: { timer: '8', minutter: '0' },
            };

            const existingPeriods: Periodeinfo<IArbeidstidPeriodeMedTimer>[] = [
                {
                    periode: { fom: '2024-01-01', tom: '2024-01-05' },
                    faktiskArbeidPerDag: { timer: '8', minutter: '0' },
                    jobberNormaltPerDag: { timer: '8', minutter: '0' },
                },
            ];

            const result = handlePeriodOverlaps(newPeriod, existingPeriods);

            expect(result).toHaveLength(1); // Kun eksisterende periode
        });

        it('skal håndtere eksisterende periode uten gyldig dato', () => {
            const newPeriod: Periodeinfo<IArbeidstidPeriodeMedTimer> = {
                periode: { fom: '2024-01-01', tom: '2024-01-05' },
                faktiskArbeidPerDag: { timer: '8', minutter: '0' },
                jobberNormaltPerDag: { timer: '8', minutter: '0' },
            };

            const existingPeriods: Periodeinfo<IArbeidstidPeriodeMedTimer>[] = [
                {
                    periode: { fom: '', tom: '2024-01-05' },
                    faktiskArbeidPerDag: { timer: '8', minutter: '0' },
                    jobberNormaltPerDag: { timer: '8', minutter: '0' },
                },
            ];

            const result = handlePeriodOverlaps(newPeriod, existingPeriods);

            expect(result).toHaveLength(2); // Eksisterende + ny periode
        });
    });

    describe('processArbeidstidPeriods', () => {
        it('skal behandle perioder med helgefiltrering', () => {
            const newPeriods: Periodeinfo<IArbeidstidPeriodeMedTimer>[] = [
                {
                    periode: { fom: '2024-01-01', tom: '2024-01-07' }, // Mandag til søndag
                    faktiskArbeidPerDag: { timer: '8', minutter: '0' },
                    jobberNormaltPerDag: { timer: '8', minutter: '0' },
                },
            ];

            const existingPeriods: Periodeinfo<IArbeidstidPeriodeMedTimer>[] = [];

            const result = processArbeidstidPeriods(newPeriods, existingPeriods, { filterWeekends: true });

            expect(result).toHaveLength(1);
            expect(result[0].periode?.fom).toBe('2024-01-01');
            expect(result[0].periode?.tom).toBe('2024-01-05'); // Kun mandag til fredag
        });

        it('skal behandle perioder uten helgefiltrering', () => {
            const newPeriods: Periodeinfo<IArbeidstidPeriodeMedTimer>[] = [
                {
                    periode: { fom: '2024-01-01', tom: '2024-01-07' },
                    faktiskArbeidPerDag: { timer: '8', minutter: '0' },
                    jobberNormaltPerDag: { timer: '8', minutter: '0' },
                },
            ];

            const existingPeriods: Periodeinfo<IArbeidstidPeriodeMedTimer>[] = [];

            const result = processArbeidstidPeriods(newPeriods, existingPeriods, { filterWeekends: false });

            expect(result).toHaveLength(1);
            expect(result[0].periode?.fom).toBe('2024-01-01');
            expect(result[0].periode?.tom).toBe('2024-01-07'); // Hele perioden inkludert helger
        });

        it('skal behandle perioder med overlapp og helgefiltrering', () => {
            const newPeriods: Periodeinfo<IArbeidstidPeriodeMedTimer>[] = [
                {
                    periode: { fom: '2024-01-01', tom: '2024-01-07' }, // Mandag til søndag
                    faktiskArbeidPerDag: { timer: '8', minutter: '0' },
                    jobberNormaltPerDag: { timer: '8', minutter: '0' },
                },
            ];

            const existingPeriods: Periodeinfo<IArbeidstidPeriodeMedTimer>[] = [
                {
                    periode: { fom: '2024-01-03', tom: '2024-01-05' }, // Onsdag til fredag
                    faktiskArbeidPerDag: { timer: '7.5', minutter: '30' },
                    jobberNormaltPerDag: { timer: '8', minutter: '0' },
                },
            ];

            const result = processArbeidstidPeriods(newPeriods, existingPeriods, { filterWeekends: true });

            expect(result).toHaveLength(1); // Kun filtrert ny periode (eksisterende fjernet)
            expect(result[0].periode?.fom).toBe('2024-01-01');
            expect(result[0].periode?.tom).toBe('2024-01-05'); // Kun mandag til fredag
        });

        it('skal sortere perioder etter startdato', () => {
            const newPeriods: Periodeinfo<IArbeidstidPeriodeMedTimer>[] = [
                {
                    periode: { fom: '2024-01-10', tom: '2024-01-12' },
                    faktiskArbeidPerDag: { timer: '8', minutter: '0' },
                    jobberNormaltPerDag: { timer: '8', minutter: '0' },
                },
                {
                    periode: { fom: '2024-01-01', tom: '2024-01-05' },
                    faktiskArbeidPerDag: { timer: '8', minutter: '0' },
                    jobberNormaltPerDag: { timer: '8', minutter: '0' },
                },
            ];

            const existingPeriods: Periodeinfo<IArbeidstidPeriodeMedTimer>[] = [];

            const result = processArbeidstidPeriods(newPeriods, existingPeriods);

            expect(result).toHaveLength(2);
            expect(result[0].periode?.fom).toBe('2024-01-01'); // Første periode først
            expect(result[1].periode?.fom).toBe('2024-01-10'); // Andre periode sist
        });

        it('skal håndtere periode uten gyldig dato', () => {
            const newPeriods: Periodeinfo<IArbeidstidPeriodeMedTimer>[] = [
                {
                    periode: { fom: '', tom: '2024-01-07' },
                    faktiskArbeidPerDag: { timer: '8', minutter: '0' },
                    jobberNormaltPerDag: { timer: '8', minutter: '0' },
                },
            ];

            const existingPeriods: Periodeinfo<IArbeidstidPeriodeMedTimer>[] = [];

            const result = processArbeidstidPeriods(newPeriods, existingPeriods);

            expect(result).toHaveLength(0);
        });

        it('skal håndtere tomme lister', () => {
            const newPeriods: Periodeinfo<IArbeidstidPeriodeMedTimer>[] = [];
            const existingPeriods: Periodeinfo<IArbeidstidPeriodeMedTimer>[] = [];

            const result = processArbeidstidPeriods(newPeriods, existingPeriods);

            expect(result).toHaveLength(0);
        });

        it('skal håndtere standard alternativer (ingen helgefiltrering)', () => {
            const newPeriods: Periodeinfo<IArbeidstidPeriodeMedTimer>[] = [
                {
                    periode: { fom: '2024-01-01', tom: '2024-01-07' },
                    faktiskArbeidPerDag: { timer: '8', minutter: '0' },
                    jobberNormaltPerDag: { timer: '8', minutter: '0' },
                },
            ];

            const existingPeriods: Periodeinfo<IArbeidstidPeriodeMedTimer>[] = [];

            const result = processArbeidstidPeriods(newPeriods, existingPeriods); // Ingen options

            expect(result).toHaveLength(1);
            expect(result[0].periode?.fom).toBe('2024-01-01');
            expect(result[0].periode?.tom).toBe('2024-01-07'); // Hele perioden
        });

        it('skal konvertere perioder til riktig format med konverterPeriodeTilTimerOgMinutter', () => {
            const newPeriods: Periodeinfo<IArbeidstidPeriodeMedTimer>[] = [
                {
                    periode: { fom: '2024-01-01', tom: '2024-01-05' },
                    faktiskArbeidPerDag: { timer: '8', minutter: '0' },
                    jobberNormaltPerDag: { timer: '8', minutter: '0' },
                    tidsformat: 1, // Desimaler
                    faktiskArbeidTimerPerDag: '8.5',
                    jobberNormaltTimerPerDag: '8.0',
                },
            ];

            const existingPeriods: Periodeinfo<IArbeidstidPeriodeMedTimer>[] = [];

            const result = processArbeidstidPeriods(newPeriods, existingPeriods);

            expect(result).toHaveLength(1);
            expect(result[0]).toBeInstanceOf(Object);
            expect(result[0].periode?.fom).toBe('2024-01-01');
            expect(result[0].periode?.tom).toBe('2024-01-05');
        });
    });
});
