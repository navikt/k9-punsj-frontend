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

const datoMottatt: string = '2020-02-11';
const periode: IPeriode = {fraOgMed: '2020-01-01', tilOgMed: '2020-01-31'};
const tidligSoknadsperiode: IPeriode = {fraOgMed: '2020-01-02', tilOgMed: '2020-01-29'};
const senSoknadsperiode: IPeriode = {fraOgMed: '2020-01-03', tilOgMed: '2020-01-30'};
const perioder1: IPeriode[] = [tidligSoknadsperiode];
const perioder2: IPeriode[] = [senSoknadsperiode];
const arbeid1: IArbeid = {frilanser: [{periode}]};
const arbeid2: IArbeid = {selvstendigNaeringsdrivende: [{periode}]};
const spraak: Locale = 'nb';
const barn: IBarn = {norskIdent: '01012050190'};
const beredskap: Periodeinfo<ITilleggsinformasjon>[] = [{periode, tilleggsinformasjon: 'Lorem ipsum dolor sit amet.'}];
const nattevaak: Periodeinfo<ITilleggsinformasjon>[] = [{periode, tilleggsinformasjon: 'Mauris at sapien sit amet.'}];
const tilsynsordning: ITilsynsordning = {iTilsynsordning: JaNeiVetikke.JA, opphold: [{periode, mandag: 'PT4H40M'}]};

const felles = new SoknadFelles({
    datoMottatt,
    spraak,
    barn,
    beredskap,
    nattevaak,
    tilsynsordning
});

const soker1 = new SoknadIndividuelt({
    perioder: perioder1,
    arbeid: arbeid1
});

const soker2 = new SoknadIndividuelt({
    perioder: perioder2,
    arbeid: arbeid2
});

const soknad1: ISoknad = {
    datoMottatt,
    perioder: perioder1,
    spraak,
    arbeid: arbeid1,
    barn,
    beredskap,
    nattevaak,
    tilsynsordning
};

const soknad2: ISoknad = {
    datoMottatt,
    perioder: perioder2,
    spraak,
    arbeid: arbeid2,
    barn,
    beredskap,
    nattevaak,
    tilsynsordning
};

const dobbelSoknad = new DobbelSoknad(felles, soker1, soker2);
const dobbelSoknadMedKunEnSoker = new DobbelSoknad(felles, soker1);

describe('DobbelSoknad', () => {

    it('Skal generere Soknad for søker 1', () => {
        expect(dobbelSoknad.soknad1).toMatchObject(soknad1);
        expect(dobbelSoknadMedKunEnSoker.soknad1).toMatchObject(soknad1);
    });

    it('Skal generere Soknad for søker 2', () => {
        expect(dobbelSoknad.soknad2).toMatchObject(soknad2);
        expect(dobbelSoknadMedKunEnSoker.soknad2).toBeNull();
    });

    describe('DobbelSoknad.soknad', () => {
        it('Skal generere Soknad for valgt søker', () => {
            expect(dobbelSoknad.soknad(1)).toMatchObject(soknad1);
            expect(dobbelSoknadMedKunEnSoker.soknad(1)).toMatchObject(soknad1);
            expect(dobbelSoknad.soknad(2)).toMatchObject(soknad2);
            expect(dobbelSoknadMedKunEnSoker.soknad(2)).toBeNull();
        });
    });

    describe('DobbelSoknad.getFom', () => {
        it ('Skal returnere tidligste søknads starttidspunkt', () => {
            expect(dobbelSoknad.getFom()).toEqual(tidligSoknadsperiode.fraOgMed);
            expect(dobbelSoknadMedKunEnSoker.getFom()).toEqual(tidligSoknadsperiode.fraOgMed);
        });
    });

    describe('DobbelSoknad.getTom', () => {
        it ('Skal returnere seneste søknads sluttidspunkt', () => {
            expect(dobbelSoknad.getTom()).toEqual(senSoknadsperiode.tilOgMed);
            expect(dobbelSoknadMedKunEnSoker.getTom()).toEqual(tidligSoknadsperiode.tilOgMed);
        });
    });
});