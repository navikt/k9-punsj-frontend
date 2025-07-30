import { checkArbeidstidWithinSoknadsperioder } from '../../app/utils/periodUtils';
import { IPeriode } from '../../app/models/types/Periode';
import { IArbeidstidPeriodeMedTimer, Periodeinfo } from '../../app/models/types';

describe('periodUtils', () => {
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

                const ugyldigeSoknadsperioder: IPeriode[] = [
                    { fom: '', tom: '2024-01-15' },
                    { fom: '2024-02-01', tom: '' },
                    { fom: '', tom: '' },
                ];

                const result = checkArbeidstidWithinSoknadsperioder(arbeidstidPerioder, ugyldigeSoknadsperioder);
                expect(result).toBe(true); // Ingen gyldige søknadsperioder, så validering feiler
            });

            it('skal håndtere null/undefined verdier', () => {
                const arbeidstidPerioder = [createArbeidstidPeriode('2024-01-05', '2024-01-10')];

                const result = checkArbeidstidWithinSoknadsperioder(arbeidstidPerioder, null as any);
                expect(result).toBe(false);
            });
        });

        describe('komplekse scenarier', () => {
            it('skal håndtere flere søknadsperioder med mellomrom', () => {
                const komplekseSoknadsperioder: IPeriode[] = [
                    { fom: '2024-01-01', tom: '2024-01-15' },
                    { fom: '2024-03-01', tom: '2024-03-15' },
                    { fom: '2024-05-01', tom: '2024-05-15' },
                ];

                const arbeidstidPerioder = [
                    createArbeidstidPeriode('2024-01-05', '2024-01-10'), // Innenfor første
                    createArbeidstidPeriode('2024-03-05', '2024-03-10'), // Innenfor andre
                    createArbeidstidPeriode('2024-05-05', '2024-05-10'), // Innenfor tredje
                ];

                const result = checkArbeidstidWithinSoknadsperioder(arbeidstidPerioder, komplekseSoknadsperioder);
                expect(result).toBe(false);
            });

            it('skal returnere true når minst én periode er utenfor i komplekst scenario', () => {
                const komplekseSoknadsperioder: IPeriode[] = [
                    { fom: '2024-01-01', tom: '2024-01-15' },
                    { fom: '2024-03-01', tom: '2024-03-15' },
                ];

                const arbeidstidPerioder = [
                    createArbeidstidPeriode('2024-01-05', '2024-01-10'), // Innenfor
                    createArbeidstidPeriode('2024-02-05', '2024-02-10'), // Utenfor (mellom perioder)
                ];

                const result = checkArbeidstidWithinSoknadsperioder(arbeidstidPerioder, komplekseSoknadsperioder);
                expect(result).toBe(true);
            });
        });
    });
});
