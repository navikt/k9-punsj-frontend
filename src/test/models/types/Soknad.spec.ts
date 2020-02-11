import {JaNeiVetikke} from 'app/models/enums';
import {
    IArbeidstaker,
    IFrilanser,
    IPeriode,
    ITilleggsinformasjon,
    ITilsyn,
    Periodeinfo,
    Soknad
}                     from 'app/models/types';
import {createIntl}   from 'react-intl';

jest.mock('app/utils/envUtils');

describe('Soknad', () => {

    const datoTidligst = '2019-01-01';
    const dato1 = '2019-04-01';
    const dato2 = '2019-08-01';
    const dato3 = '2020-01-01';
    const dato4 = '2020-04-01';
    const dato5 = '2020-08-01';
    const datoSenest = '2020-12-31';

    const arbeidstaker0: Periodeinfo<IArbeidstaker> = {
        periode: {fraOgMed: dato3, tilOgMed: dato4},
        skalJobbeProsent: 50.00,
        organisasjonsnummer: '123456789'
    };

    const arbeidstaker1: Periodeinfo<IArbeidstaker> = {
        periode: {fraOgMed: dato2, tilOgMed: datoSenest},
        skalJobbeProsent: 50.00,
        norskIdent: '12345678901'
    };

    const arbeidstakerUtenTilstedevaerelsesgrad: Periodeinfo<IArbeidstaker> = {
        periode: {fraOgMed: dato2, tilOgMed: datoSenest},
        norskIdent: '12345678901'
    };

    const arbeidstakerUtenPeriode = {
        skalJobbeProsent: 100.00,
        organisasjonsnummer: '123456789'
    };

    const frilanser0: Periodeinfo<IFrilanser> = {periode: {fraOgMed: dato1, tilOgMed: dato5}};
    const beredskap0: Periodeinfo<ITilleggsinformasjon> = {periode: {fraOgMed: datoTidligst, tilOgMed: null}};

    const tilsyn0: Periodeinfo<ITilsyn> = {
        periode: {fraOgMed: dato2, tilOgMed: dato4},
        mandag: 'PT7H30M'
    };

    const tilsynUtenPeriode = {
        mandag: 'PT7H30M'
    };

    const soknadMedFlerePerioder = new Soknad({
        arbeid: {
            arbeidstaker: [arbeidstaker0, arbeidstaker1],
            frilanser: [frilanser0]
        },
        beredskap: [beredskap0],
        tilsynsordning: {
            iTilsynsordning: JaNeiVetikke.JA,
            opphold: [tilsyn0]
        }
    });

    const overordnedePerioder: IPeriode[] = [
        {fraOgMed: dato1, tilOgMed: dato4},
        {fraOgMed: dato2, tilOgMed: dato5}
    ];

    const soknadMedOverordnedePerioder = new Soknad({...soknadMedFlerePerioder.values(), perioder: overordnedePerioder});

    const soknadMedPeriodeUtenTilstedevaerelsesgrad = new Soknad({
        arbeid: {
            arbeidstaker: [
                arbeidstaker0,
                arbeidstakerUtenTilstedevaerelsesgrad,
                arbeidstaker1
            ]
        }
    });

    const soknadUtenPerioder = new Soknad({
        arbeid: {
            arbeidstaker: [arbeidstakerUtenPeriode],
        },
        tilsynsordning: {
            iTilsynsordning: JaNeiVetikke.JA,
            opphold: [tilsynUtenPeriode]
        }
    });

    const tomSoknad = new Soknad({});

    describe('Soknad.getFom', () => {

        it('Finner tidligste startdato', () => {
            expect(soknadMedFlerePerioder.getFom()).toEqual(datoTidligst);
        });

        it('Returnerer startdato fra overordnede perioder hvis disse er satt', () => {
            expect(soknadMedOverordnedePerioder.getFom()).toEqual(dato1);
        });

        it('Returnerer null når ingen perioder er satt', () => {
            expect(soknadUtenPerioder.getFom()).toBeNull();
        });

        it('Returnerer null når søknaden er tom', () => {
            expect(tomSoknad.getFom()).toBeNull();
        });
    });

    describe('Soknad.getTom', () => {

        it('Finner seneste sluttdato', () => {
            expect(soknadMedFlerePerioder.getTom()).toEqual(datoSenest);
        });

        it('Returnerer sluttdato fra overordnede perioder hvis disse er satt', () => {
            expect(soknadMedOverordnedePerioder.getTom()).toEqual(dato5);
        });

        it('Returnerer null når ingen perioder er satt', () => {
            expect(soknadUtenPerioder.getTom()).toBeNull();
        });

        it('Returnerer null når søknaden er tom', () => {
            expect(tomSoknad.getTom()).toBeNull();
        });
    });

    describe('Soknad.GetNumberOfWorkPeriods', () => {

        it('Finner antallet arbeidsperioder', () => {
            expect(soknadMedFlerePerioder.getNumberOfWorkPeriods()).toEqual(3);
        });

        it('Returnerer 0 når søknaden er tom', () => {
            expect(tomSoknad.getNumberOfWorkPeriods()).toEqual(0);
        });
    });

    describe('Soknad.generateTgStrings', () => {

        const intl = createIntl({locale: 'nb', defaultLocale: 'nb'});

        it('Lager array med strings av tilstedeværelsesgrad', () => {
            expect(soknadMedFlerePerioder.generateTgStrings(intl)).toEqual(["50,0", "50,0"]);
        });

        it('Lager array med strings av tilstedeværelsesgrad med "0,0" når tilstedeværelsesgrad er udefinert', () => {
            expect(soknadMedPeriodeUtenTilstedevaerelsesgrad.generateTgStrings(intl)).toEqual(["50,0", "0,0", "50,0"]);
        });
    });
});