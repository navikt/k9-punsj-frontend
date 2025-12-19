import {
    groupConsecutiveWorkDays,
    filterWeekendsFromPeriods,
    handlePeriodOverlaps,
    processArbeidstidPeriods,
    filterArbeidstidPeriodsBySoknadsperioder,
    filterPeriodsBySoknadsperioder,
} from '../../app/utils/arbeidstidPeriodUtils';
import { IArbeidstidPeriodeMedTimer, IPeriode, Periodeinfo, IOmsorgstid } from '../../app/models/types';

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

    describe('filterArbeidstidPeriodsBySoknadsperioder', () => {
        const createArbeidstidPeriode = (
            fom: string,
            tom: string,
            timer: string = '8',
            minutter: string = '0',
        ): Periodeinfo<IArbeidstidPeriodeMedTimer> => ({
            periode: { fom, tom },
            faktiskArbeidPerDag: { timer, minutter },
            jobberNormaltPerDag: { timer, minutter },
        });

        const createSoknadsperiode = (fom: string, tom: string): IPeriode => ({ fom, tom });

        it('skal beholde perioder som er helt innenfor søknadsperioder', () => {
            const arbeidstidPerioder = [createArbeidstidPeriode('2024-01-02', '2024-01-05')];
            const soknadsperioder = [createSoknadsperiode('2024-01-01', '2024-01-10')];

            const result = filterArbeidstidPeriodsBySoknadsperioder(arbeidstidPerioder, soknadsperioder);

            expect(result).toHaveLength(1);
            expect(result[0].periode?.fom).toBe('2024-01-02');
            expect(result[0].periode?.tom).toBe('2024-01-05');
            expect(result[0].faktiskArbeidPerDag).toEqual({ timer: '8', minutter: '0' });
        });

        it('skal fjerne perioder som er helt utenfor søknadsperioder', () => {
            const arbeidstidPerioder = [createArbeidstidPeriode('2024-01-15', '2024-01-20')];
            const soknadsperioder = [createSoknadsperiode('2024-01-01', '2024-01-10')];

            const result = filterArbeidstidPeriodsBySoknadsperioder(arbeidstidPerioder, soknadsperioder);

            expect(result).toHaveLength(0);
        });

        it('skal kutte ned perioder som delvis overlapper søknadsperioder', () => {
            const arbeidstidPerioder = [createArbeidstidPeriode('2024-01-05', '2024-01-15')];
            const soknadsperioder = [createSoknadsperiode('2024-01-01', '2024-01-10')];

            const result = filterArbeidstidPeriodsBySoknadsperioder(arbeidstidPerioder, soknadsperioder);

            expect(result).toHaveLength(1);
            expect(result[0].periode?.fom).toBe('2024-01-05');
            expect(result[0].periode?.tom).toBe('2024-01-10');
            expect(result[0].faktiskArbeidPerDag).toEqual({ timer: '8', minutter: '0' });
        });

        it('skal dele opp perioder som overlapper flere søknadsperioder med gap', () => {
            const arbeidstidPerioder = [createArbeidstidPeriode('2024-01-05', '2024-01-25')];
            const soknadsperioder = [
                createSoknadsperiode('2024-01-01', '2024-01-10'),
                createSoknadsperiode('2024-01-20', '2024-01-30'),
            ];

            const result = filterArbeidstidPeriodsBySoknadsperioder(arbeidstidPerioder, soknadsperioder);

            expect(result).toHaveLength(2);
            expect(result[0].periode?.fom).toBe('2024-01-05');
            expect(result[0].periode?.tom).toBe('2024-01-10');
            expect(result[1].periode?.fom).toBe('2024-01-20');
            expect(result[1].periode?.tom).toBe('2024-01-25');
        });

        it('skal håndtere flere arbeidstidperioder med forskjellige scenarier', () => {
            const arbeidstidPerioder = [
                createArbeidstidPeriode('2024-01-02', '2024-01-05', '8', '0'), // Helt innenfor
                createArbeidstidPeriode('2024-01-15', '2024-01-20', '7.5', '30'), // Helt utenfor
                createArbeidstidPeriode('2024-01-08', '2024-01-12', '6', '0'), // Delvis overlapp
            ];
            const soknadsperioder = [createSoknadsperiode('2024-01-01', '2024-01-10')];

            const result = filterArbeidstidPeriodsBySoknadsperioder(arbeidstidPerioder, soknadsperioder);

            expect(result).toHaveLength(2);
            expect(result[0].periode?.fom).toBe('2024-01-02');
            expect(result[0].periode?.tom).toBe('2024-01-05');
            expect(result[0].faktiskArbeidPerDag).toEqual({ timer: '8', minutter: '0' });
            expect(result[1].periode?.fom).toBe('2024-01-08');
            expect(result[1].periode?.tom).toBe('2024-01-10');
            expect(result[1].faktiskArbeidPerDag).toEqual({ timer: '6', minutter: '0' });
        });

        it('skal returnere tom liste når ingen søknadsperioder er gitt', () => {
            const arbeidstidPerioder = [createArbeidstidPeriode('2024-01-02', '2024-01-05')];
            const soknadsperioder: IPeriode[] = [];

            const result = filterArbeidstidPeriodsBySoknadsperioder(arbeidstidPerioder, soknadsperioder);

            expect(result).toHaveLength(0);
        });

        it('skal håndtere periode uten gyldig dato', () => {
            const arbeidstidPerioder = [
                createArbeidstidPeriode('', '2024-01-05'),
                createArbeidstidPeriode('2024-01-02', ''),
                createArbeidstidPeriode('2024-01-02', '2024-01-05'),
            ];
            const soknadsperioder = [createSoknadsperiode('2024-01-01', '2024-01-10')];

            const result = filterArbeidstidPeriodsBySoknadsperioder(arbeidstidPerioder, soknadsperioder);

            expect(result).toHaveLength(1);
            expect(result[0].periode?.fom).toBe('2024-01-02');
            expect(result[0].periode?.tom).toBe('2024-01-05');
        });

        it('skal håndtere søknadsperioder uten gyldig dato', () => {
            const arbeidstidPerioder = [createArbeidstidPeriode('2024-01-02', '2024-01-05')];
            const soknadsperioder: IPeriode[] = [
                { fom: '', tom: '2024-01-10' },
                { fom: '2024-01-01', tom: '' },
                createSoknadsperiode('2024-01-01', '2024-01-10'),
            ];

            const result = filterArbeidstidPeriodsBySoknadsperioder(arbeidstidPerioder, soknadsperioder);

            expect(result).toHaveLength(1);
            expect(result[0].periode?.fom).toBe('2024-01-02');
            expect(result[0].periode?.tom).toBe('2024-01-05');
        });

        it('skal håndtere tomme lister', () => {
            const arbeidstidPerioder: Periodeinfo<IArbeidstidPeriodeMedTimer>[] = [];
            const soknadsperioder = [createSoknadsperiode('2024-01-01', '2024-01-10')];

            const result = filterArbeidstidPeriodsBySoknadsperioder(arbeidstidPerioder, soknadsperioder);

            expect(result).toHaveLength(0);
        });

        it('skal beholde alle felter fra original periode når perioden kuttes ned', () => {
            const arbeidstidPeriode: Periodeinfo<IArbeidstidPeriodeMedTimer> = {
                periode: { fom: '2024-01-05', tom: '2024-01-15' },
                faktiskArbeidPerDag: { timer: '7.5', minutter: '30' },
                jobberNormaltPerDag: { timer: '8', minutter: '0' },
                tidsformat: 1,
                faktiskArbeidTimerPerDag: '7.5',
                jobberNormaltTimerPerDag: '8.0',
            };
            const soknadsperioder = [createSoknadsperiode('2024-01-01', '2024-01-10')];

            const result = filterArbeidstidPeriodsBySoknadsperioder([arbeidstidPeriode], soknadsperioder);

            expect(result).toHaveLength(1);
            expect(result[0].faktiskArbeidPerDag).toEqual({ timer: '7.5', minutter: '30' });
            expect(result[0].jobberNormaltPerDag).toEqual({ timer: '8', minutter: '0' });
            expect(result[0].tidsformat).toBe(1);
            expect(result[0].faktiskArbeidTimerPerDag).toBe('7.5');
            expect(result[0].jobberNormaltTimerPerDag).toBe('8.0');
        });

        it('skal håndtere periode som starter før og slutter etter søknadsperiode', () => {
            const arbeidstidPerioder = [createArbeidstidPeriode('2024-01-01', '2024-01-20')];
            const soknadsperioder = [createSoknadsperiode('2024-01-05', '2024-01-15')];

            const result = filterArbeidstidPeriodsBySoknadsperioder(arbeidstidPerioder, soknadsperioder);

            expect(result).toHaveLength(1);
            expect(result[0].periode?.fom).toBe('2024-01-05');
            expect(result[0].periode?.tom).toBe('2024-01-15');
        });
    });

    describe('filterPeriodsBySoknadsperioder (universal)', () => {
        const createArbeidstidPeriode = (
            fom: string,
            tom: string,
            timer: string = '8',
            minutter: string = '0',
        ): Periodeinfo<IArbeidstidPeriodeMedTimer> => ({
            periode: { fom, tom },
            faktiskArbeidPerDag: { timer, minutter },
            jobberNormaltPerDag: { timer, minutter },
        });

        const createTilsynPeriode = (
            fom: string,
            tom: string,
            timer: string = '8',
            minutter: string = '0',
        ): Periodeinfo<IOmsorgstid> => ({
            periode: { fom, tom },
            timer,
            minutter,
            perDagString: '',
            tidsformat: 'timerOgMinutter' as any,
        });

        const createSoknadsperiode = (fom: string, tom: string): IPeriode => ({ fom, tom });

        it('skal fungere med arbeidstidperioder', () => {
            const perioder = [createArbeidstidPeriode('2024-01-02', '2024-01-05')];
            const soknadsperioder = [createSoknadsperiode('2024-01-01', '2024-01-10')];

            const result = filterPeriodsBySoknadsperioder(perioder, soknadsperioder);

            expect(result).toHaveLength(1);
            expect(result[0].periode?.fom).toBe('2024-01-02');
            expect(result[0].periode?.tom).toBe('2024-01-05');
        });

        it('skal fungere med tilsynperioder', () => {
            const perioder = [createTilsynPeriode('2024-01-02', '2024-01-05')];
            const soknadsperioder = [createSoknadsperiode('2024-01-01', '2024-01-10')];

            const result = filterPeriodsBySoknadsperioder(perioder, soknadsperioder);

            expect(result).toHaveLength(1);
            expect(result[0].periode?.fom).toBe('2024-01-02');
            expect(result[0].periode?.tom).toBe('2024-01-05');
            expect((result[0] as Periodeinfo<IOmsorgstid>).timer).toBe('8');
            expect((result[0] as Periodeinfo<IOmsorgstid>).minutter).toBe('0');
        });

        it('skal fjerne tilsynperioder som er helt utenfor søknadsperioder', () => {
            const perioder = [createTilsynPeriode('2024-01-15', '2024-01-20')];
            const soknadsperioder = [createSoknadsperiode('2024-01-01', '2024-01-10')];

            const result = filterPeriodsBySoknadsperioder(perioder, soknadsperioder);

            expect(result).toHaveLength(0);
        });

        it('skal kutte ned tilsynperioder som delvis overlapper', () => {
            const perioder = [createTilsynPeriode('2024-01-05', '2024-01-15', '7.5', '30')];
            const soknadsperioder = [createSoknadsperiode('2024-01-01', '2024-01-10')];

            const result = filterPeriodsBySoknadsperioder(perioder, soknadsperioder);

            expect(result).toHaveLength(1);
            expect(result[0].periode?.fom).toBe('2024-01-05');
            expect(result[0].periode?.tom).toBe('2024-01-10');
            expect((result[0] as Periodeinfo<IOmsorgstid>).timer).toBe('7.5');
            expect((result[0] as Periodeinfo<IOmsorgstid>).minutter).toBe('30');
        });

        it('skal håndtere mix av arbeidstid og tilsynperioder (hvis brukt separat)', () => {
            const arbeidstidPerioder = [createArbeidstidPeriode('2024-01-02', '2024-01-05')];
            const tilsynPerioder = [createTilsynPeriode('2024-01-12', '2024-01-18')];
            const soknadsperioder = [
                createSoknadsperiode('2024-01-01', '2024-01-10'),
                createSoknadsperiode('2024-01-15', '2024-01-20'),
            ];

            const arbeidstidResult = filterPeriodsBySoknadsperioder(arbeidstidPerioder, soknadsperioder);
            const tilsynResult = filterPeriodsBySoknadsperioder(tilsynPerioder, soknadsperioder);

            expect(arbeidstidResult).toHaveLength(1);
            expect(tilsynResult).toHaveLength(1); // Tilsynperiode delvis overlapper - kuttes ned til 15-18
            expect(tilsynResult[0].periode?.fom).toBe('2024-01-15');
            expect(tilsynResult[0].periode?.tom).toBe('2024-01-18');
        });
    });
});
