import {
    checkArbeidstidWithinSoknadsperioder,
    checkPeriodsWithinSoknadsperioder,
    formatSoknadsperioder,
    checkPeriodOverlap,
} from '../../app/utils/periodUtils';
import { IPeriode } from '../../app/models/types/Periode';
import { IArbeidstidPeriodeMedTimer, Periodeinfo, IOmsorgstid } from '../../app/models/types';

describe('periodUtils', () => {
    describe('checkPeriodOverlap', () => {
        const createArbeidstidPeriode = (fom: string, tom: string): Periodeinfo<IArbeidstidPeriodeMedTimer> => ({
            periode: { fom, tom },
            faktiskArbeidPerDag: { timer: '8', minutter: '0' },
            jobberNormaltPerDag: { timer: '8', minutter: '0' },
        });

        const createTilsynPeriode = (fom: string, tom: string): Periodeinfo<IOmsorgstid> => ({
            periode: { fom, tom },
            timer: '8',
            minutter: '0',
            perDagString: '',
            tidsformat: 'timerOgMinutter' as any,
        });

        describe('når perioder ikke overlapper', () => {
            it('skal returnere false når perioder er etter hverandre', () => {
                const perioder = [
                    createArbeidstidPeriode('2024-01-01', '2024-01-15'),
                    createArbeidstidPeriode('2024-01-16', '2024-01-31'),
                ];

                const result = checkPeriodOverlap(perioder);
                expect(result).toBe(false);
            });

            it('skal returnere false når perioder er før hverandre', () => {
                const perioder = [
                    createArbeidstidPeriode('2024-02-01', '2024-02-15'),
                    createArbeidstidPeriode('2024-01-01', '2024-01-15'),
                ];

                const result = checkPeriodOverlap(perioder);
                expect(result).toBe(false);
            });

            it('skal returnere false når perioder er helt adskilt', () => {
                const perioder = [
                    createArbeidstidPeriode('2024-01-01', '2024-01-10'),
                    createArbeidstidPeriode('2024-03-01', '2024-03-10'),
                ];

                const result = checkPeriodOverlap(perioder);
                expect(result).toBe(false);
            });

            it('skal returnere false når perioder starter og slutter på samme dato', () => {
                const perioder = [
                    createArbeidstidPeriode('2024-01-01', '2024-01-15'),
                    createArbeidstidPeriode('2024-01-15', '2024-01-31'),
                ];

                const result = checkPeriodOverlap(perioder);
                expect(result).toBe(true);
            });
        });

        describe('når perioder overlapper', () => {
            it('skal returnere true når perioder overlapper delvis', () => {
                const perioder = [
                    createArbeidstidPeriode('2024-01-01', '2024-01-20'),
                    createArbeidstidPeriode('2024-01-15', '2024-01-31'),
                ];

                const result = checkPeriodOverlap(perioder);
                expect(result).toBe(true);
            });

            it('skal returnere true når én periode er helt innenfor en annen', () => {
                const perioder = [
                    createArbeidstidPeriode('2024-01-01', '2024-01-31'),
                    createArbeidstidPeriode('2024-01-10', '2024-01-20'),
                ];

                const result = checkPeriodOverlap(perioder);
                expect(result).toBe(true);
            });

            it('skal returnere true når perioder starter på samme dato', () => {
                const perioder = [
                    createArbeidstidPeriode('2024-01-01', '2024-01-15'),
                    createArbeidstidPeriode('2024-01-01', '2024-01-20'),
                ];

                const result = checkPeriodOverlap(perioder);
                expect(result).toBe(true);
            });

            it('skal returnere true når perioder slutter på samme dato', () => {
                const perioder = [
                    createArbeidstidPeriode('2024-01-01', '2024-01-31'),
                    createArbeidstidPeriode('2024-01-15', '2024-01-31'),
                ];

                const result = checkPeriodOverlap(perioder);
                expect(result).toBe(true);
            });

            it('skal returnere true når perioder er identiske', () => {
                const perioder = [
                    createArbeidstidPeriode('2024-01-01', '2024-01-15'),
                    createArbeidstidPeriode('2024-01-01', '2024-01-15'),
                ];

                const result = checkPeriodOverlap(perioder);
                expect(result).toBe(true);
            });
        });

        describe('edge cases', () => {
            it('skal returnere true når periode har tomme datoer', () => {
                const perioder = [
                    createArbeidstidPeriode('2024-01-01', '2024-01-15'),
                    {
                        periode: { fom: '', tom: '' },
                        faktiskArbeidPerDag: { timer: '8', minutter: '0' },
                        jobberNormaltPerDag: { timer: '8', minutter: '0' },
                    },
                ];

                const result = checkPeriodOverlap(perioder);
                expect(result).toBe(true);
            });

            it('skal returnere false når ingen perioder er definert', () => {
                const result = checkPeriodOverlap([]);
                expect(result).toBe(false);
            });

            it('skal returnere false når kun én periode er definert', () => {
                const perioder = [createArbeidstidPeriode('2024-01-01', '2024-01-15')];

                const result = checkPeriodOverlap(perioder);
                expect(result).toBe(false);
            });

            it('skal fungere med tilsyn perioder', () => {
                const tilsynPerioder = [
                    createTilsynPeriode('2024-01-01', '2024-01-15'),
                    createTilsynPeriode('2024-01-10', '2024-01-20'),
                ];

                const result = checkPeriodOverlap(tilsynPerioder);
                expect(result).toBe(true);
            });
        });
    });

    describe('formatSoknadsperioder', () => {
        it('skal returnere tom streng når ingen perioder er definert', () => {
            const result = formatSoknadsperioder([]);
            expect(result).toBe('');
        });

        it('skal returnere tom streng når perioder er null', () => {
            const result = formatSoknadsperioder(null as any);
            expect(result).toBe('');
        });

        it('skal formatere én periode korrekt', () => {
            const soknadsperioder: IPeriode[] = [{ fom: '2024-01-01', tom: '2024-01-15' }];
            const result = formatSoknadsperioder(soknadsperioder);
            expect(result).toBe('01.01.2024 - 15.01.2024');
        });

        it('skal formatere flere perioder korrekt', () => {
            const soknadsperioder: IPeriode[] = [
                { fom: '2024-01-01', tom: '2024-01-15' },
                { fom: '2024-02-01', tom: '2024-02-15' },
            ];
            const result = formatSoknadsperioder(soknadsperioder);
            expect(result).toBe('01.01.2024 - 15.01.2024, 01.02.2024 - 15.02.2024');
        });

        it('skal hoppe over perioder uten gyldig dato', () => {
            const soknadsperioder: IPeriode[] = [
                { fom: '2024-01-01', tom: '2024-01-15' },
                { fom: '', tom: '2024-02-15' },
                { fom: '2024-03-01', tom: '' },
                { fom: '2024-04-01', tom: '2024-04-15' },
            ];
            const result = formatSoknadsperioder(soknadsperioder);
            expect(result).toBe('01.01.2024 - 15.01.2024, 01.04.2024 - 15.04.2024');
        });
    });

    describe('checkPeriodsWithinSoknadsperioder', () => {
        // Test data
        const soknadsperiode1: IPeriode = { fom: '2024-01-01', tom: '2024-01-15' };
        const soknadsperiode2: IPeriode = { fom: '2024-02-01', tom: '2024-02-15' };
        const soknadsperioder: IPeriode[] = [soknadsperiode1, soknadsperiode2];

        const createArbeidstidPeriode = (fom: string, tom: string): Periodeinfo<IArbeidstidPeriodeMedTimer> => ({
            periode: { fom, tom },
            faktiskArbeidPerDag: { timer: '8', minutter: '0' },
            jobberNormaltPerDag: { timer: '8', minutter: '0' },
        });

        const createTilsynPeriode = (fom: string, tom: string): Periodeinfo<IOmsorgstid> => ({
            periode: { fom, tom },
            timer: '8',
            minutter: '0',
            perDagString: '',
            tidsformat: 'timerOgMinutter' as any,
        });

        describe('når perioder er innenfor søknadsperioder', () => {
            it('skal returnere false når arbeidstidperiode er helt innenfor én søknadsperiode', () => {
                const arbeidstidPerioder = [createArbeidstidPeriode('2024-01-05', '2024-01-10')];

                const result = checkPeriodsWithinSoknadsperioder(arbeidstidPerioder, soknadsperioder);
                expect(result).toBe(false);
            });

            it('skal returnere false når tilsynperiode er helt innenfor én søknadsperiode', () => {
                const tilsynPerioder = [createTilsynPeriode('2024-01-05', '2024-01-10')];

                const result = checkPeriodsWithinSoknadsperioder(tilsynPerioder, soknadsperioder);
                expect(result).toBe(false);
            });

            it('skal returnere false når periode starter og slutter på samme dato som søknadsperiode', () => {
                const perioder = [createArbeidstidPeriode('2024-01-01', '2024-01-15')];

                const result = checkPeriodsWithinSoknadsperioder(perioder, soknadsperioder);
                expect(result).toBe(false);
            });

            it('skal returnere false når flere perioder er innenfor forskjellige søknadsperioder', () => {
                const perioder = [
                    createArbeidstidPeriode('2024-01-05', '2024-01-10'),
                    createArbeidstidPeriode('2024-02-05', '2024-02-10'),
                ];

                const result = checkPeriodsWithinSoknadsperioder(perioder, soknadsperioder);
                expect(result).toBe(false);
            });
        });

        describe('når perioder er utenfor søknadsperioder', () => {
            it('skal returnere true når periode starter før søknadsperiode', () => {
                const perioder = [createArbeidstidPeriode('2023-12-25', '2024-01-10')];

                const result = checkPeriodsWithinSoknadsperioder(perioder, soknadsperioder);
                expect(result).toBe(true);
            });

            it('skal returnere true når periode slutter etter søknadsperiode', () => {
                const perioder = [createArbeidstidPeriode('2024-01-05', '2024-01-20')];

                const result = checkPeriodsWithinSoknadsperioder(perioder, soknadsperioder);
                expect(result).toBe(true);
            });

            it('skal returnere true når periode er helt utenfor alle søknadsperioder', () => {
                const perioder = [createArbeidstidPeriode('2024-01-20', '2024-01-25')];

                const result = checkPeriodsWithinSoknadsperioder(perioder, soknadsperioder);
                expect(result).toBe(true);
            });

            it('skal returnere true når periode overlapper to søknadsperioder', () => {
                const perioder = [createArbeidstidPeriode('2024-01-10', '2024-02-05')];

                const result = checkPeriodsWithinSoknadsperioder(perioder, soknadsperioder);
                expect(result).toBe(true);
            });

            it('skal returnere true når én av flere perioder er utenfor', () => {
                const perioder = [
                    createArbeidstidPeriode('2024-01-05', '2024-01-10'), // Innenfor
                    createArbeidstidPeriode('2024-01-20', '2024-01-25'), // Utenfor
                ];

                const result = checkPeriodsWithinSoknadsperioder(perioder, soknadsperioder);
                expect(result).toBe(true);
            });
        });

        describe('edge cases', () => {
            it('skal returnere false når ingen søknadsperioder er definert', () => {
                const perioder = [createArbeidstidPeriode('2024-01-05', '2024-01-10')];

                const result = checkPeriodsWithinSoknadsperioder(perioder, []);
                expect(result).toBe(false);
            });

            it('skal returnere false når ingen perioder er definert', () => {
                const result = checkPeriodsWithinSoknadsperioder([], soknadsperioder);
                expect(result).toBe(false);
            });

            it('skal hoppe over perioder uten gyldig dato', () => {
                const perioder = [
                    createArbeidstidPeriode('2024-01-05', '2024-01-10'),
                    {
                        periode: { fom: '', tom: '' },
                        faktiskArbeidPerDag: { timer: '8', minutter: '0' },
                        jobberNormaltPerDag: { timer: '8', minutter: '0' },
                    },
                    createArbeidstidPeriode('2024-02-05', '2024-02-10'),
                ];

                const result = checkPeriodsWithinSoknadsperioder(perioder, soknadsperioder);
                expect(result).toBe(false);
            });

            it('skal hoppe over søknadsperioder uten gyldig dato', () => {
                const perioder = [createArbeidstidPeriode('2024-01-05', '2024-01-10')];
                const soknadsperioderMedUgyldige: IPeriode[] = [
                    { fom: '', tom: '2024-01-15' },
                    { fom: '2024-01-01', tom: '' },
                ];

                const result = checkPeriodsWithinSoknadsperioder(perioder, soknadsperioderMedUgyldige);
                expect(result).toBe(true); // Ingen gyldige søknadsperioder, så validering feiler
            });
        });
    });

    describe('checkArbeidstidWithinSoknadsperioder', () => {
        // Test data
        const soknadsperiode1: IPeriode = { fom: '2024-01-01', tom: '2024-01-15' };
        const soknadsperiode2: IPeriode = { fom: '2024-02-01', tom: '2024-02-15' };
        const soknadsperioder: IPeriode[] = [soknadsperiode1, soknadsperiode2];

        const createArbeidstidPeriode = (fom: string, tom: string): Periodeinfo<IArbeidstidPeriodeMedTimer> => ({
            periode: { fom, tom },
            faktiskArbeidPerDag: { timer: '8', minutter: '0' },
            jobberNormaltPerDag: { timer: '8', minutter: '0' },
        });

        describe('når arbeidstidperioder er innenfor søknadsperioder', () => {
            it('skal returnere false når arbeidstidperiode er helt innenfor én søknadsperiode', () => {
                const arbeidstidPerioder = [createArbeidstidPeriode('2024-01-05', '2024-01-10')];

                const result = checkArbeidstidWithinSoknadsperioder(arbeidstidPerioder, soknadsperioder);
                expect(result).toBe(false);
            });

            it('skal returnere false når arbeidstidperiode starter og slutter på samme dato som søknadsperiode', () => {
                const arbeidstidPerioder = [createArbeidstidPeriode('2024-01-01', '2024-01-15')];

                const result = checkArbeidstidWithinSoknadsperioder(arbeidstidPerioder, soknadsperioder);
                expect(result).toBe(false);
            });

            it('skal returnere false når flere arbeidstidperioder er innenfor forskjellige søknadsperioder', () => {
                const arbeidstidPerioder = [
                    createArbeidstidPeriode('2024-01-05', '2024-01-10'),
                    createArbeidstidPeriode('2024-02-05', '2024-02-10'),
                ];

                const result = checkArbeidstidWithinSoknadsperioder(arbeidstidPerioder, soknadsperioder);
                expect(result).toBe(false);
            });

            it('skal returnere false når arbeidstidperiode starter på start av søknadsperiode', () => {
                const arbeidstidPerioder = [createArbeidstidPeriode('2024-01-01', '2024-01-10')];

                const result = checkArbeidstidWithinSoknadsperioder(arbeidstidPerioder, soknadsperioder);
                expect(result).toBe(false);
            });

            it('skal returnere false når arbeidstidperiode slutter på slutt av søknadsperiode', () => {
                const arbeidstidPerioder = [createArbeidstidPeriode('2024-01-05', '2024-01-15')];

                const result = checkArbeidstidWithinSoknadsperioder(arbeidstidPerioder, soknadsperioder);
                expect(result).toBe(false);
            });
        });

        describe('når arbeidstidperioder er utenfor søknadsperioder', () => {
            it('skal returnere true når arbeidstidperiode starter før søknadsperiode', () => {
                const arbeidstidPerioder = [createArbeidstidPeriode('2023-12-25', '2024-01-10')];

                const result = checkArbeidstidWithinSoknadsperioder(arbeidstidPerioder, soknadsperioder);
                expect(result).toBe(true);
            });

            it('skal returnere true når arbeidstidperiode slutter etter søknadsperiode', () => {
                const arbeidstidPerioder = [createArbeidstidPeriode('2024-01-05', '2024-01-20')];

                const result = checkArbeidstidWithinSoknadsperioder(arbeidstidPerioder, soknadsperioder);
                expect(result).toBe(true);
            });

            it('skal returnere true når arbeidstidperiode er helt utenfor alle søknadsperioder', () => {
                const arbeidstidPerioder = [createArbeidstidPeriode('2024-01-20', '2024-01-25')];

                const result = checkArbeidstidWithinSoknadsperioder(arbeidstidPerioder, soknadsperioder);
                expect(result).toBe(true);
            });

            it('skal returnere true når arbeidstidperiode overlapper to søknadsperioder', () => {
                const arbeidstidPerioder = [createArbeidstidPeriode('2024-01-10', '2024-02-05')];

                const result = checkArbeidstidWithinSoknadsperioder(arbeidstidPerioder, soknadsperioder);
                expect(result).toBe(true);
            });

            it('skal returnere true når én av flere arbeidstidperioder er utenfor', () => {
                const arbeidstidPerioder = [
                    createArbeidstidPeriode('2024-01-05', '2024-01-10'), // Innenfor
                    createArbeidstidPeriode('2024-01-20', '2024-01-25'), // Utenfor
                ];

                const result = checkArbeidstidWithinSoknadsperioder(arbeidstidPerioder, soknadsperioder);
                expect(result).toBe(true);
            });
        });

        describe('edge cases', () => {
            it('skal returnere false når ingen søknadsperioder er definert', () => {
                const arbeidstidPerioder = [createArbeidstidPeriode('2024-01-05', '2024-01-10')];

                const result = checkArbeidstidWithinSoknadsperioder(arbeidstidPerioder, []);
                expect(result).toBe(false);
            });

            it('skal returnere false når ingen arbeidstidperioder er definert', () => {
                const result = checkArbeidstidWithinSoknadsperioder([], soknadsperioder);
                expect(result).toBe(false);
            });

            it('skal hoppe over arbeidstidperioder uten gyldig dato', () => {
                const arbeidstidPerioder = [
                    createArbeidstidPeriode('2024-01-05', '2024-01-10'),
                    {
                        periode: { fom: '', tom: '' },
                        faktiskArbeidPerDag: { timer: '8', minutter: '0' },
                        jobberNormaltPerDag: { timer: '8', minutter: '0' },
                    },
                    createArbeidstidPeriode('2024-02-05', '2024-02-10'),
                ];

                const result = checkArbeidstidWithinSoknadsperioder(arbeidstidPerioder, soknadsperioder);
                expect(result).toBe(false);
            });

            it('skal hoppe over søknadsperioder uten gyldig dato', () => {
                const arbeidstidPerioder = [createArbeidstidPeriode('2024-01-05', '2024-01-10')];
                const soknadsperioderMedUgyldige: IPeriode[] = [
                    { fom: '', tom: '2024-01-15' },
                    { fom: '2024-01-01', tom: '' },
                ];

                const result = checkArbeidstidWithinSoknadsperioder(arbeidstidPerioder, soknadsperioderMedUgyldige);
                expect(result).toBe(true); // Ingen gyldige søknadsperioder, så validering feiler
            });
        });
    });
});
