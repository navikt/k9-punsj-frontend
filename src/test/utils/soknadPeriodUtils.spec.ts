import {
    harSoknadsperioderBlittEndretEllerSlettet,
    filtrerPerioderVedEndringAvSoknadsperiode,
} from '../../app/søknader/pleiepenger/utils/soknadPeriodUtils';
import { IPeriode, IArbeidstidPeriodeMedTimer, IOmsorgstid, Periodeinfo } from '../../app/models/types';
import { IPSBSoknadUt } from '../../app/models/types/PSBSoknadUt';
import { IArbeidstaker } from '../../app/models/types/Arbeidstaker';

describe('soknadPeriodUtils', () => {
    describe('harSoknadsperioderBlittEndretEllerSlettet', () => {
        const createPeriode = (fom: string, tom: string): IPeriode => ({ fom, tom });

        it('skal returnere false når nye perioder er undefined', () => {
            const eksisterende = [createPeriode('2024-01-01', '2024-01-31')];
            const result = harSoknadsperioderBlittEndretEllerSlettet(eksisterende, undefined);
            expect(result).toBe(false);
        });

        it('skal returnere true når antall perioder er redusert', () => {
            const eksisterende = [
                createPeriode('2024-01-01', '2024-01-15'),
                createPeriode('2024-01-16', '2024-01-31'),
            ];
            const nye = [createPeriode('2024-01-01', '2024-01-15')];
            const result = harSoknadsperioderBlittEndretEllerSlettet(eksisterende, nye);
            expect(result).toBe(true);
        });

        it('skal returnere true når datoer på eksisterende periode er endret', () => {
            const eksisterende = [createPeriode('2024-01-01', '2024-01-31')];
            const nye = [createPeriode('2024-01-01', '2024-01-15')]; // Tom endret
            const result = harSoknadsperioderBlittEndretEllerSlettet(eksisterende, nye);
            expect(result).toBe(true);
        });

        it('skal returnere true når fom på eksisterende periode er endret', () => {
            const eksisterende = [createPeriode('2024-01-01', '2024-01-31')];
            const nye = [createPeriode('2024-01-05', '2024-01-31')]; // Fom endret
            const result = harSoknadsperioderBlittEndretEllerSlettet(eksisterende, nye);
            expect(result).toBe(true);
        });

        it('skal returnere false når bare nye perioder er lagt til', () => {
            const eksisterende = [createPeriode('2024-01-01', '2024-01-15')];
            const nye = [
                createPeriode('2024-01-01', '2024-01-15'), // Samme som eksisterende
                createPeriode('2024-01-16', '2024-01-31'), // Ny periode
            ];
            const result = harSoknadsperioderBlittEndretEllerSlettet(eksisterende, nye);
            expect(result).toBe(false);
        });

        it('skal returnere false når ingen endringer', () => {
            const eksisterende = [createPeriode('2024-01-01', '2024-01-31')];
            const nye = [createPeriode('2024-01-01', '2024-01-31')];
            const result = harSoknadsperioderBlittEndretEllerSlettet(eksisterende, nye);
            expect(result).toBe(false);
        });

        it('skal håndtere flere perioder med endringer', () => {
            const eksisterende = [
                createPeriode('2024-01-01', '2024-01-15'),
                createPeriode('2024-01-16', '2024-01-31'),
            ];
            const nye = [
                createPeriode('2024-01-01', '2024-01-10'), // Første periode endret
                createPeriode('2024-01-16', '2024-01-31'), // Andre periode uendret
            ];
            const result = harSoknadsperioderBlittEndretEllerSlettet(eksisterende, nye);
            expect(result).toBe(true);
        });

        it('skal håndtere perioder uten gyldig dato', () => {
            const eksisterende = [createPeriode('2024-01-01', '2024-01-31'), { fom: '', tom: '' }];
            const nye = [createPeriode('2024-01-01', '2024-01-31')];
            const result = harSoknadsperioderBlittEndretEllerSlettet(eksisterende, nye);
            expect(result).toBe(true); // En periode mangler
        });
    });

    describe('filtrerPerioderVedEndringAvSoknadsperiode', () => {
        const createArbeidstidPeriode = (
            fom: string,
            tom: string,
        ): Periodeinfo<IArbeidstidPeriodeMedTimer> => ({
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

        const createArbeidstaker = (
            perioder: Periodeinfo<IArbeidstidPeriodeMedTimer>[],
        ): IArbeidstaker => ({
            arbeidstidInfo: { perioder },
            organisasjonsnummer: '123456789',
            norskIdent: null,
        });

        const createSoknadsperiode = (fom: string, tom: string): IPeriode => ({ fom, tom });

        const createMockSoknad = (arbeidstid?: any, tilsynsordning?: any): IPSBSoknadUt => ({
            soeknadId: 'test',
            soekerId: 'test',
            journalposter: [],
            mottattDato: '',
            klokkeslett: '',
            barn: {} as any,
            soeknadsperiode: [],
            opptjeningAktivitet: {} as any,
            arbeidstid,
            tilsynsordning,
        } as IPSBSoknadUt);

        it('skal returnere undefined når ingen perioder å filtrere', () => {
            const soknad = createMockSoknad();
            const nyeSoknadsperioder = [createSoknadsperiode('2024-01-01', '2024-01-31')];

            const result = filtrerPerioderVedEndringAvSoknadsperiode(soknad, nyeSoknadsperioder);

            expect(result).toBeUndefined();
        });

        it('skal filtrere arbeidstid perioder fra arbeidstakerList', () => {
            const arbeidstid = {
                arbeidstakerList: [
                    createArbeidstaker([createArbeidstidPeriode('2024-01-05', '2024-01-20')]),
                ],
            };
            const soknad = createMockSoknad(arbeidstid);
            const nyeSoknadsperioder = [createSoknadsperiode('2024-01-01', '2024-01-10')];

            const result = filtrerPerioderVedEndringAvSoknadsperiode(
                soknad,
                nyeSoknadsperioder,
                arbeidstid,
            );

            expect(result).toBeDefined();
            expect(result?.arbeidstid?.arbeidstakerList).toHaveLength(1);
            expect(result?.arbeidstid?.arbeidstakerList?.[0].arbeidstidInfo?.perioder).toHaveLength(1);
            expect(result?.arbeidstid?.arbeidstakerList?.[0].arbeidstidInfo?.perioder?.[0].periode?.fom).toBe(
                '2024-01-05',
            );
            expect(result?.arbeidstid?.arbeidstakerList?.[0].arbeidstidInfo?.perioder?.[0].periode?.tom).toBe(
                '2024-01-10',
            );
        });

        it('skal filtrere frilanser arbeidstid perioder', () => {
            const arbeidstid = {
                frilanserArbeidstidInfo: {
                    perioder: [createArbeidstidPeriode('2024-01-05', '2024-01-20')],
                },
            };
            const soknad = createMockSoknad(arbeidstid);
            const nyeSoknadsperioder = [createSoknadsperiode('2024-01-01', '2024-01-10')];

            const result = filtrerPerioderVedEndringAvSoknadsperiode(
                soknad,
                nyeSoknadsperioder,
                arbeidstid,
            );

            expect(result).toBeDefined();
            expect(result?.arbeidstid?.frilanserArbeidstidInfo?.perioder).toHaveLength(1);
            expect(result?.arbeidstid?.frilanserArbeidstidInfo?.perioder?.[0].periode?.fom).toBe('2024-01-05');
            expect(result?.arbeidstid?.frilanserArbeidstidInfo?.perioder?.[0].periode?.tom).toBe('2024-01-10');
        });

        it('skal filtrere selvstendig næringsdrivende arbeidstid perioder', () => {
            const arbeidstid = {
                selvstendigNæringsdrivendeArbeidstidInfo: {
                    perioder: [createArbeidstidPeriode('2024-01-05', '2024-01-20')],
                },
            };
            const soknad = createMockSoknad(arbeidstid);
            const nyeSoknadsperioder = [createSoknadsperiode('2024-01-01', '2024-01-10')];

            const result = filtrerPerioderVedEndringAvSoknadsperiode(
                soknad,
                nyeSoknadsperioder,
                arbeidstid,
            );

            expect(result).toBeDefined();
            expect(result?.arbeidstid?.selvstendigNæringsdrivendeArbeidstidInfo?.perioder).toHaveLength(1);
            expect(
                result?.arbeidstid?.selvstendigNæringsdrivendeArbeidstidInfo?.perioder?.[0].periode?.fom,
            ).toBe('2024-01-05');
            expect(
                result?.arbeidstid?.selvstendigNæringsdrivendeArbeidstidInfo?.perioder?.[0].periode?.tom,
            ).toBe('2024-01-10');
        });

        it('skal filtrere tilsynsordning perioder', () => {
            const tilsynsordning = {
                perioder: [createTilsynPeriode('2024-01-05', '2024-01-20')],
            };
            const soknad = createMockSoknad(undefined, tilsynsordning);
            const nyeSoknadsperioder = [createSoknadsperiode('2024-01-01', '2024-01-10')];

            const result = filtrerPerioderVedEndringAvSoknadsperiode(
                soknad,
                nyeSoknadsperioder,
                undefined,
                tilsynsordning,
            );

            expect(result).toBeDefined();
            expect(result?.tilsynsordning?.perioder).toHaveLength(1);
            expect(result?.tilsynsordning?.perioder?.[0].periode?.fom).toBe('2024-01-05');
            expect(result?.tilsynsordning?.perioder?.[0].periode?.tom).toBe('2024-01-10');
        });

        it('skal beholde alle felter fra arbeidstid når perioder filtreres', () => {
            const arbeidstid = {
                arbeidstakerList: [
                    createArbeidstaker([createArbeidstidPeriode('2024-01-05', '2024-01-20')]),
                ],
                frilanserArbeidstidInfo: {
                    perioder: [createArbeidstidPeriode('2024-01-01', '2024-01-10')],
                },
            };
            const soknad = createMockSoknad(arbeidstid);
            const nyeSoknadsperioder = [createSoknadsperiode('2024-01-01', '2024-01-10')];

            const result = filtrerPerioderVedEndringAvSoknadsperiode(
                soknad,
                nyeSoknadsperioder,
                arbeidstid,
            );

            expect(result).toBeDefined();
            expect(result?.arbeidstid?.arbeidstakerList).toBeDefined();
            expect(result?.arbeidstid?.frilanserArbeidstidInfo).toBeDefined();
        });

        it('skal fjerne perioder som er helt utenfor søknadsperioder', () => {
            const arbeidstid = {
                arbeidstakerList: [
                    createArbeidstaker([createArbeidstidPeriode('2024-02-01', '2024-02-10')]),
                ],
            };
            const soknad = createMockSoknad(arbeidstid);
            const nyeSoknadsperioder = [createSoknadsperiode('2024-01-01', '2024-01-31')];

            const result = filtrerPerioderVedEndringAvSoknadsperiode(
                soknad,
                nyeSoknadsperioder,
                arbeidstid,
            );

            expect(result).toBeDefined();
            expect(result?.arbeidstid?.arbeidstakerList?.[0].arbeidstidInfo?.perioder).toHaveLength(0);
        });

        it('skal bruke aktuell arbeidstid hvis den er gitt', () => {
            const arbeidstidFraStore = {
                arbeidstakerList: [createArbeidstaker([createArbeidstidPeriode('2024-01-01', '2024-01-10')])],
            };
            const aktuellArbeidstid = {
                arbeidstakerList: [createArbeidstaker([createArbeidstidPeriode('2024-01-05', '2024-01-20')])],
            };
            const soknad = createMockSoknad(arbeidstidFraStore);
            const nyeSoknadsperioder = [createSoknadsperiode('2024-01-01', '2024-01-10')];

            const result = filtrerPerioderVedEndringAvSoknadsperiode(
                soknad,
                nyeSoknadsperioder,
                aktuellArbeidstid,
            );

            // Skal bruke aktuellArbeidstid, ikke arbeidstidFraStore
            expect(result).toBeDefined();
            expect(result?.arbeidstid?.arbeidstakerList?.[0].arbeidstidInfo?.perioder?.[0].periode?.fom).toBe(
                '2024-01-05',
            );
        });

        it('skal bruke arbeidstid fra store hvis aktuell ikke er gitt', () => {
            const arbeidstidFraStore = {
                arbeidstakerList: [createArbeidstaker([createArbeidstidPeriode('2024-01-05', '2024-01-20')])],
            };
            const soknad = createMockSoknad(arbeidstidFraStore);
            const nyeSoknadsperioder = [createSoknadsperiode('2024-01-01', '2024-01-10')];

            const result = filtrerPerioderVedEndringAvSoknadsperiode(soknad, nyeSoknadsperioder);

            expect(result).toBeDefined();
            expect(result?.arbeidstid?.arbeidstakerList?.[0].arbeidstidInfo?.perioder?.[0].periode?.fom).toBe(
                '2024-01-05',
            );
        });
    });
});

