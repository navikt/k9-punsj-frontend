import React from 'react';

import { render, screen } from '@testing-library/react';
import { mocked } from 'jest-mock';
import { useSelector } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { IPSBSoknadKvittering } from '../../../app/models/types/PSBSoknadKvittering';
import { PSBSoknadKvittering } from '../../../app/søknader/pleiepenger/containers/SoknadKvittering/SoknadKvittering';
import intlHelper from '../../../app/utils/intlUtils';

jest.mock('react-intl', () => ({
    ...jest.requireActual('react-intl'),
    FormattedMessage: ({ id }: { id: string }) => id,
}));

jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useSelector: jest.fn(),
}));

jest.mock('app/utils/browserUtils');
jest.mock('app/utils/envUtils');
jest.mock('app/utils/intlUtils');
jest.mock('app/utils/pathUtils');

const fullResponse: IPSBSoknadKvittering = {
    journalposter: [
        {
            journalpostId: '',
            inneholderInformasjonSomIkkeKanPunsjes: false,
            inneholderMedisinskeOpplysninger: false,
        },
    ],
    mottattDato: '2020-10-12T12:53:00.000Z',
    ytelse: {
        type: 'PLEIEPENGER_SYKT_BARN',
        barn: {
            norskIdentitetsnummer: '23123123123',
            fødselsdato: null,
        },
        søknadsperiode: ['2021-06-01/2021-06-30'],
        opptjeningAktivitet: {
            frilanser: {
                startdato: '2021-01-01',
                sluttdato: null,
                jobberFortsattSomFrilans: false,
            },
            selvstendigNæringsdrivende: [
                {
                    perioder: {
                        '2015-06-11/..': {
                            virksomhetstyper: ['FISKE', 'DAGMAMMA'],
                            regnskapsførerNavn: 'Test ',
                            regnskapsførerTlf: '46320852',
                            erVarigEndring: true,
                            endringDato: '2021-02-24',
                            endringBegrunnelse: 'begunnelse',
                            bruttoInntekt: 1000000,
                            erNyoppstartet: false,
                            registrertIUtlandet: false,
                            landkode: 'USA',
                        },
                    },
                    organisasjonsnummer: '231232321323',
                    virksomhetNavn: 'Navn As',
                },
            ],
        },
        bosteder: {
            perioder: {
                '2021-04-13/2021-06-01': {
                    land: 'AZE',
                },
            },
        },
        utenlandsopphold: {
            perioder: {
                '2021-06-01/2021-06-16': {
                    land: 'BHR',
                    årsak: null,
                },
            },
        },
        beredskap: {
            perioder: {
                '2021-06-01/2021-06-10': {
                    tilleggsinformasjon: 'Beredskap',
                },
            },
        },
        nattevåk: {
            perioder: {
                '2021-06-21/2021-06-25': {
                    tilleggsinformasjon: 'Nattevåk',
                },
            },
        },
        tilsynsordning: {
            perioder: {
                '2021-06-14/2021-06-19': {
                    etablertTilsynTimerPerDag: 'PT7H30M',
                },
            },
        },
        lovbestemtFerie: {
            perioder: {
                '2021-06-01/2021-06-04': {
                    skalHaFerie: 'true',
                },
            },
        },
        arbeidstid: {
            arbeidstakerList: [
                {
                    norskIdentitetsnummer: null,
                    organisasjonsnummer: '1313123212323',
                    arbeidstidInfo: {
                        perioder: {
                            '2021-06-01/2021-06-30': {
                                jobberNormaltTimerPerDag: 'PT8H',
                                faktiskArbeidTimerPerDag: 'PT5H',
                            },
                        },
                    },
                },
            ],
            frilanserArbeidstidInfo: {
                perioder: {
                    '2021-06-01/2021-06-30': {
                        jobberNormaltTimerPerDag: 'PT8H',
                        faktiskArbeidTimerPerDag: 'PT5H',
                    },
                },
            },
            selvstendigNæringsdrivendeArbeidstidInfo: null,
        },
        uttak: {
            perioder: {
                '2021-06-01/2021-06-30': {
                    timerPleieAvBarnetPerDag: 'PT7H30M',
                },
            },
        },
        omsorg: {
            relasjonTilBarnet: 'MEDMOR',
            beskrivelseAvOmsorgsrollen: '',
        },
        trekkKravPerioder: ['2021-06-01/2021-06-30'],
    },
    begrunnelseForInnsending: { tekst: '' },
};

const minimalResponse: IPSBSoknadKvittering = {
    journalposter: [],
    mottattDato: '2020-10-12T12:53:00.000Z',
    ytelse: {
        type: 'PLEIEPENGER_SYKT_BARN',
        barn: {
            norskIdentitetsnummer: '23123123123',
            fødselsdato: null,
        },
        søknadsperiode: ['2021-06-01/2021-06-30'],
        opptjeningAktivitet: {},
        bosteder: {
            perioder: {},
        },
        utenlandsopphold: {
            perioder: {},
        },
        beredskap: {
            perioder: {},
        },
        nattevåk: {
            perioder: {},
        },
        tilsynsordning: {
            perioder: {},
        },
        lovbestemtFerie: {
            perioder: {},
        },
        arbeidstid: {
            arbeidstakerList: [],
            frilanserArbeidstidInfo: null,
            selvstendigNæringsdrivendeArbeidstidInfo: null,
        },
        uttak: {
            perioder: {},
        },
        omsorg: {
            relasjonTilBarnet: 'ANNET',
            beskrivelseAvOmsorgsrollen: 'Bestemor',
        },
        trekkKravPerioder: ['2021-06-01/2021-06-30'],
    },
    begrunnelseForInnsending: { tekst: '' },
};

describe('SoknadKvittering', () => {
    beforeAll(() => {
        (useSelector as unknown as jest.Mock).mockImplementation((callback) =>
            callback({
                identState: {
                    annenSokerIdent: '12345678901', // mock the annenSokerIdent value
                },
                felles: { kopierJournalpostSuccess: false },
            }),
        );

        mocked(intlHelper).mockImplementation((intl, id) => id);
    });

    const setupSoknadKvittering = (response: IPSBSoknadKvittering) => {
        mocked(intlHelper).mockImplementation((intl, id) => id);
        return render(
            <IntlProvider locale="en" messages={{}}>
                <PSBSoknadKvittering innsendtSøknad={response} />
            </IntlProvider>,
        );
    };

    it('Viser full kvittering', () => {
        setupSoknadKvittering(fullResponse);

        // screen.debug();

        // Viser kvittering side
        expect(screen.getByTestId('kvittering.oppsummering').textContent).toContain('skjema.kvittering.oppsummering');

        //Viser søknadsperioder
        const søknadsperiode = screen.getByTestId('soknadsperiode').textContent;
        expect(søknadsperiode).toContain('skjema.soknadskvittering.soknadsperiode');
        expect(søknadsperiode).toContain('01.06.2021 - 30.06.2021');

        // Viser opplysninger om mottatt dato
        const mottattDato = screen.getByTestId('mottatt-dato').textContent;
        expect(mottattDato).toContain('skjema.opplysningeromsoknad');
        expect(mottattDato).toContain('skjema.mottakelsesdato');
        expect(mottattDato).toContain('12.10.2020');
        expect(mottattDato).toContain('14:53');
        expect(mottattDato).toContain('12.10.2020');

        // Viser utenlandsoppehold
        const utenlandsopphold = screen.getByTestId('utenlandsopphold').textContent;
        expect(utenlandsopphold).toContain('skjema.utenlandsopphold.opplysninger');
        expect(utenlandsopphold).toContain('01.06.2021 - 16.06.2021');
        expect(utenlandsopphold).toContain('Bahrain');

        // ferie
        const ferie = screen.getByTestId('ferie').textContent;
        expect(ferie).toContain('skjema.ferieskjema.periode.overskrift');
        expect(ferie).toContain('01.06.2021 - 04.06.2021');

        // Viser opplysninger om soker
        const opplysningerOmSoker = screen.getByTestId('opplysningerOmSoker').textContent;
        expect(opplysningerOmSoker).toContain('skjema.opplysningeromsoker');
        expect(opplysningerOmSoker).toContain('skjema.relasjontilbarnet.kvittering');
        expect(opplysningerOmSoker).toContain('Medmor');

        // Viser arbeidstaker
        const arbeidsforhold = screen.getByTestId('arbeidsforhold').textContent;

        expect(arbeidsforhold).toContain('arbeidstaker');
        expect(arbeidsforhold).toContain('skjema.arbeid.arbeidstaker.orgnr');
        expect(arbeidsforhold).toContain('1313123212323');
        expect(arbeidsforhold).toContain('skjema.periode.overskrift');
        expect(arbeidsforhold).toContain('01.06.2021 - 30.06.2021');
        expect(arbeidsforhold).toContain('skjema.arbeid.arbeidstaker.timernormalt');
        expect(arbeidsforhold).toContain('8 timer');
        expect(arbeidsforhold).toContain('skjema.arbeid.arbeidstaker.timerfaktisk');
        expect(arbeidsforhold).toContain('5 timer');

        // Viser frilanser
        const frilanser = screen.getByTestId('frilanser').textContent;
        expect(frilanser).toContain('frilanser');
        expect(frilanser).toContain('skjema.frilanserdato');
        expect(frilanser).toContain('01.01.2021');
        expect(frilanser).toContain('skjema.periode.overskrift');
        expect(frilanser).toContain('01.06.2021 - 30.06.20218');
        expect(frilanser).toContain('skjema.arbeid.arbeidstaker.timernormalt');
        expect(frilanser).toContain('8 timer');
        expect(frilanser).toContain('5 timer');
        expect(frilanser).toContain('skjema.arbeid.arbeidstaker.timerfaktisk');

        // Viser selvstendig næringsdrivende
        const selvstendigNæringsdrivende = screen.getByTestId('selvstendignæringsdrivende').textContent;
        expect(selvstendigNæringsdrivende).toContain('selvstendig');
        expect(selvstendigNæringsdrivende).toContain('skjema.arbeid.arbeidstaker.orgnr');
        expect(selvstendigNæringsdrivende).toContain('231232321323');
        expect(selvstendigNæringsdrivende).toContain('skjema.arbeid.sn.virksomhetsnavn');
        expect(selvstendigNæringsdrivende).toContain('Navn As');
        expect(selvstendigNæringsdrivende).toContain('skjema.arbeid.sn.når');
        expect(selvstendigNæringsdrivende).toContain('11.06.2015');
        expect(selvstendigNæringsdrivende).toContain('skjema.arbeid.sn.type');
        expect(selvstendigNæringsdrivende).toContain('Fiske, Dagmamma i eget hjem/familiebarnehage');
        expect(selvstendigNæringsdrivende).toContain('skjema.sn.registrertINorge');
        expect(selvstendigNæringsdrivende).toContain('Ja');
        expect(selvstendigNæringsdrivende).toContain('skjema.sn.registrertLand');
        expect(selvstendigNæringsdrivende).toContain('USA');
        expect(selvstendigNæringsdrivende).toContain('skjema.sn.varigendring');
        expect(selvstendigNæringsdrivende).toContain('Ja');
        expect(selvstendigNæringsdrivende).toContain('skjema.sn.varigendringdato');
        expect(selvstendigNæringsdrivende).toContain('24.02.2021');
        expect(selvstendigNæringsdrivende).toContain('skjema.sn.endringbegrunnelse');
        expect(selvstendigNæringsdrivende).toContain('begunnelse');
        expect(selvstendigNæringsdrivende).toContain('skjema.sn.endringinntekt');
        expect(selvstendigNæringsdrivende).toContain('1000000');
        expect(selvstendigNæringsdrivende).toContain('skjema.arbeid.sn.regnskapsførernavn');
        expect(selvstendigNæringsdrivende).toContain('Test');
        expect(selvstendigNæringsdrivende).toContain('skjema.arbeid.sn.regnskapsførertlf');
        expect(selvstendigNæringsdrivende).toContain('46320852');

        // Viser omsorgstilbud
        const omsorgstilbud = screen.getByTestId('visOmsorgstilbud').textContent;
        expect(omsorgstilbud).toContain('skjema.omsorgstilbud.overskrift');
        expect(omsorgstilbud).toContain('skjema.periode.overskrift');
        expect(omsorgstilbud).toContain('skjema.omsorgstilbud.gjennomsnittlig');
        expect(omsorgstilbud).toContain('14.06.2021 - 19.06.2021');
        expect(omsorgstilbud).toContain('7 timer og 30 minutter');

        // Viser beredskap og nattevåk
        const beredskapnettevaak = screen.getByTestId('beredskapnettevaak').textContent;
        expect(beredskapnettevaak).toContain('skjema.beredskapognattevaak.overskrift');

        const beredskap = screen.getByTestId('beredskap').textContent;
        expect(beredskap).toContain('skjema.beredskap.overskrift');
        expect(beredskap).toContain('Beredskap');
        expect(beredskap).toContain('skjema.periode.overskrift');
        expect(beredskap).toContain('01.06.2021 - 10.06.2021');
        expect(beredskap).toContain('skjema.beredskap.tilleggsinfo.kvittering');

        const nattevaak = screen.getByTestId('nattevak').textContent;
        expect(nattevaak).toContain('skjema.nattevaak.overskrift');
        expect(nattevaak).toContain('Nattevåk');
        expect(nattevaak).toContain('skjema.periode.overskrift');
        expect(nattevaak).toContain('21.06.2021 - 25.06.2021');
        expect(nattevaak).toContain('skjema.beredskap.tilleggsinfo.kvittering');

        // Viser medlemskap
        const medlemskap = screen.getByTestId('medlemskap').textContent;
        expect(medlemskap).toContain('skjema.medlemskap.overskrift');
        expect(medlemskap).toContain('skjema.periode.overskrift');
        expect(medlemskap).toContain('13.04.2021 - 01.06.2021');
        expect(medlemskap).toContain('skjema.utenlandsopphold.land');
        expect(medlemskap).toContain('Aserbajdsjan');

        // Viser tilleggsopplysninger
        const tilleggsopplysninger = screen.getByTestId('tilleggsopplysninger').textContent;
        expect(tilleggsopplysninger).toContain('skjema.soknadskvittering.tilleggsopplysninger');
        expect(tilleggsopplysninger).toContain('skjema.medisinskeopplysninger.kvittering Nei');
        expect(tilleggsopplysninger).toContain('skjema.opplysningerikkepunsjet.kvittering Nei');
    });

    it('Viser minimal kvittering', () => {
        setupSoknadKvittering(minimalResponse);

        // screen.debug();

        // Viser kvittering side
        expect(screen.getByTestId('kvittering.oppsummering').textContent).toContain('skjema.kvittering.oppsummering');

        //Viser søknadsperioder
        const søknadsperiode = screen.getByTestId('soknadsperiode').textContent;
        expect(søknadsperiode).toContain('skjema.soknadskvittering.soknadsperiode');
        expect(søknadsperiode).toContain('01.06.2021 - 30.06.2021');

        // Viser opplysninger om mottatt dato
        const mottattDato = screen.getByTestId('mottatt-dato').textContent;
        expect(mottattDato).toContain('skjema.opplysningeromsoknad');
        expect(mottattDato).toContain('skjema.mottakelsesdato');
        expect(mottattDato).toContain('12.10.2020');
        expect(mottattDato).toContain('14:53');
        expect(mottattDato).toContain('12.10.2020');

        // Viser opplysninger om soker
        const opplysningerOmSoker = screen.getByTestId('opplysningerOmSoker').textContent;
        expect(opplysningerOmSoker).toContain('skjema.opplysningeromsoker');
        expect(opplysningerOmSoker).toContain('skjema.relasjontilbarnet.kvittering');
        expect(opplysningerOmSoker).toContain('Bestemor');

        // Ikke viser BegrunnelseForEndring

        expect(screen.queryByTestId('begrunnelseForEndring')).not.toBeInTheDocument();

        // Viser period som fjernet
        const periodSomFjernet = screen.getByTestId('perioderSomFjernet').textContent;
        expect(periodSomFjernet).toContain('skjema.perioderSomFjernet');
        expect(periodSomFjernet).toContain('01.06.2021 - 30.06.2021');

        // Ikke viser utenlandsoppehold
        expect(screen.queryByTestId('utenlandsopphold')).not.toBeInTheDocument();

        // Ikke viser arbeidstaker
        expect(screen.queryByTestId('arbeidsforhold')).not.toBeInTheDocument();

        // Ikke viser frilanser
        expect(screen.queryByTestId('frilanser')).not.toBeInTheDocument();

        // Ikke viser selvstendig næringsdrivende
        expect(screen.queryByTestId('selvstendignæringsdrivende')).not.toBeInTheDocument();

        // Ikke viser omsorgstilbud
        expect(screen.queryByTestId('visOmsorgstilbud')).not.toBeInTheDocument();

        // Ikke viser beredskap og nattevåk
        expect(screen.queryByTestId('beredskapnettevaak')).not.toBeInTheDocument();

        // Ikke viser medlemskap
        expect(screen.queryByTestId('medlemskap')).not.toBeInTheDocument();

        // Ikke viser tilleggsopplysninger
        expect(screen.queryByTestId('tilleggsopplysninger')).not.toBeInTheDocument();
    });
});
