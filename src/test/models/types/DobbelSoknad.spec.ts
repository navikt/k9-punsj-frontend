import {JaNeiVetikke} from 'app/models/enums';
import {
    DobbelSoknad,
    IArbeid,
    IBarn,
    IPeriode,
    ISoknad,
    ITilleggsinformasjon,
    ITilsynsordning,
    Locale,
    Periodeinfo,
    SoknadFelles,
    SoknadIndividuelt
}                     from 'app/models/types';

jest.mock('app/utils/envUtils');

const periode: IPeriode = {fraOgMed: '2020-01-01', tilOgMed: '2020-01-31'};
const arbeid1: IArbeid = {frilanser: [{periode}]};
const arbeid2: IArbeid = {selvstendigNaeringsdrivende: [{periode}]};
const spraak1: Locale = 'nn';
const spraak2: Locale = 'nb';
const barn: IBarn = {norskIdent: '01012050190'};
const beredskap: Array<Periodeinfo<ITilleggsinformasjon>> = [{periode, tilleggsinformasjon: 'Lorem ipsum dolor sit amet.'}];
const nattevaak: Array<Periodeinfo<ITilleggsinformasjon>> = [{periode, tilleggsinformasjon: 'Mauris at sapien sit amet.'}];
const tilsynsordning: ITilsynsordning = {iTilsynsordning: JaNeiVetikke.JA, opphold: [{periode, mandag: 'PT4H40M'}]};

const felles = new SoknadFelles({
    periode,
    barn,
    beredskap,
    nattevaak,
    tilsynsordning
});

const soker1 = new SoknadIndividuelt({
    spraak: spraak1,
    arbeid: arbeid1
});

const soker2 = new SoknadIndividuelt({
    spraak: spraak2,
    arbeid: arbeid2
});

const soknad1: ISoknad = {
    periode,
    spraak: spraak1,
    arbeid: arbeid1,
    barn,
    beredskap,
    nattevaak,
    tilsynsordning
};

const soknad2: ISoknad = {
    periode,
    spraak: spraak2,
    arbeid: arbeid2,
    barn,
    beredskap,
    nattevaak,
    tilsynsordning
};

const dobbelSoknad = new DobbelSoknad(felles, soker1, soker2);

describe('DobbelSoknad', () => {

    it('Skal generere Soknad for søker 1', () => {
        expect(dobbelSoknad.soknad1).toMatchObject(soknad1);
    });

    it('Skal generere Soknad for søker 2', () => {
        expect(dobbelSoknad.soknad2).toMatchObject(soknad2);
    });

    describe('DobbelSoknad.soknad', () => {
        it('Skal generere Soknad for valgt søker', () => {
            expect(dobbelSoknad.soknad(1)).toMatchObject(soknad1);
            expect(dobbelSoknad.soknad(2)).toMatchObject(soknad2);
        });
    });

    describe('DobbelSoknad.getFom', () => {

        it ('Skal returnere søknadens starttidspunkt når overordnet periode er satt', () => {
            expect(dobbelSoknad.getFom()).toEqual(periode.fraOgMed);
        });

        it ('Skal returnere starttidspunkt for tidligste periode når overordnet periode ikke er satt', () => {
            const tidligStart = '2019-01-01';
            const fellesSoknadUtenFraOgMed = new SoknadFelles({...felles, periode: {fraOgMed: null, tilOgMed: periode.tilOgMed}});
            const soker1MedTidligArbeidsperiode = new SoknadIndividuelt({...soker1, arbeid: {frilanser: [{periode: {...periode, fraOgMed: tidligStart}}]}});
            const dobbelSoknadUtenOverordnetFraOgMedOgMedTidligArbeidsperiode = new DobbelSoknad(fellesSoknadUtenFraOgMed, soker1MedTidligArbeidsperiode, soker2);
            expect(dobbelSoknadUtenOverordnetFraOgMedOgMedTidligArbeidsperiode.getFom()).toEqual(tidligStart);
        });
    });

    describe('DobbelSoknad.getTom', () => {

        it ('Skal returnere søknadens sluttidspunkt når overordnet periode er satt', () => {
            expect(dobbelSoknad.getTom()).toEqual(periode.tilOgMed);
        });

        it ('Skal returnere sluttidspunkt for seneste periode når overordnet periode ikke er satt', () => {
            const senSlutt = '2021-12-31';
            const fellesSoknadUtenTilOgMed = new SoknadFelles({...felles, periode: {tilOgMed: null, fraOgMed: periode.fraOgMed}});
            const soker1MedSenArbeidsperiode = new SoknadIndividuelt({...soker1, arbeid: {frilanser: [{periode: {...periode, tilOgMed: senSlutt}}]}});
            const dobbelSoknadUtenOverordnetTilOgMedOgMedSenArbeidsperiode = new DobbelSoknad(fellesSoknadUtenTilOgMed, soker1MedSenArbeidsperiode, soker2);
            expect(dobbelSoknadUtenOverordnetTilOgMedOgMedSenArbeidsperiode.getTom()).toEqual(senSlutt);
        });
    });
});