import { expect } from '@jest/globals';
import { shallow } from 'enzyme';
import { mocked } from 'jest-mock';
import * as React from 'react';
import { IntlShape } from 'react-intl';

import { PSBSoknadKvittering } from '../../../app/søknader/pleiepenger/SoknadKvittering/SoknadKvittering';
import { IPSBSoknadKvittering } from '../../../app/models/types/PSBSoknadKvittering';
import intlHelper from '../../../app/utils/intlUtils';

jest.mock('react-intl');
jest.mock('react-router');
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

const setupSoknadKvittering = (response: IPSBSoknadKvittering) => {
    mocked(intlHelper).mockImplementation((intl: IntlShape, id: string) => id);
    return shallow(<PSBSoknadKvittering innsendtSøknad={response} />);
};

describe('SoknadKvittering', () => {
    const soknadKvitteringFull = setupSoknadKvittering(fullResponse);
    const soknadKvitteringTom = setupSoknadKvittering(minimalResponse);

    it('Viser søknadsperioder', () => {
        expect(soknadKvitteringFull.text().includes('skjema.soknadskvittering.soknadsperiode')).toBe(true);
        expect(soknadKvitteringFull.text().includes('01.06.2021 - 30.06.2021')).toBe(true);

        expect(soknadKvitteringTom.text().includes('skjema.soknadskvittering.soknadsperiode')).toBe(true);
        expect(soknadKvitteringTom.text().includes('01.06.2021 - 30.06.2021')).toBe(true);
    });

    it('Viser opplysninger om mottatt dato', () => {
        expect(soknadKvitteringFull.text().includes('skjema.opplysningeromsoknad')).toBe(true);
        expect(soknadKvitteringFull.text().includes('skjema.mottakelsesdato:')).toBe(true);
        expect(soknadKvitteringFull.text().includes('12.10.2020')).toBe(true);
        expect(soknadKvitteringFull.text().includes('14:53')).toBe(true);

        expect(soknadKvitteringTom.text().includes('skjema.mottakelsesdato:')).toBe(true);
        expect(soknadKvitteringTom.text().includes('12.10.2020')).toBe(true);
        expect(soknadKvitteringTom.text().includes('14:53')).toBe(true);
    });

    it('Viser utenlandsoppehold', () => {
        expect(soknadKvitteringFull.text().includes('skjema.utenlandsopphold.opplysninger')).toBe(true);
        expect(soknadKvitteringTom.text().includes('skjema.utenlandsopphold.opplysninger')).toBe(false);
    });

    it('Viser opplysninger om soker', () => {
        expect(soknadKvitteringFull.text().includes('skjema.opplysningeromsoker')).toBe(true);
        expect(soknadKvitteringFull.text().includes('Medmor')).toBe(true);

        expect(soknadKvitteringTom.text().includes('skjema.opplysningeromsoker')).toBe(true);
        expect(soknadKvitteringTom.text().includes('Bestemor')).toBe(true);
    });

    it('Viser arbeidstaker', () => {
        expect(soknadKvitteringFull.text().includes('skjema.arbeid.arbeidstaker.orgnr:')).toBe(true);
        expect(soknadKvitteringFull.text().includes('1313123212323')).toBe(true);

        expect(soknadKvitteringTom.text().includes('skjema.arbeid.arbeidstaker.orgnr:')).toBe(false);
        expect(soknadKvitteringTom.text().includes('1313123212323')).toBe(false);
    });

    it('Viser frilanser', () => {
        expect(soknadKvitteringFull.text().includes('skjema.frilanserdato')).toBe(true);
        expect(soknadKvitteringFull.text().includes('01.01.2021')).toBe(true);

        expect(soknadKvitteringTom.text().includes('skjema.frilanserdato')).toBe(false);
        expect(soknadKvitteringTom.text().includes('01.01.2021')).toBe(false);
    });

    it('Viser SN', () => {
        expect(soknadKvitteringFull.text().includes('selvstendig')).toBe(true);
        expect(soknadKvitteringFull.find('VisningAvPerioderSNSoknadKvittering')).toHaveLength(1);

        expect(soknadKvitteringTom.text().includes('selvstendig')).toBe(false);
        expect(soknadKvitteringTom.find('VisningAvPerioderSNSoknadKvittering')).toHaveLength(0);
    });

    it('Viser omsorgstilbud', () => {
        expect(soknadKvitteringFull.text().includes('skjema.omsorgstilbud.overskrift')).toBe(true);
        expect(soknadKvitteringTom.text().includes('skjema.omsorgstilbud.overskrift')).toBe(false);
    });

    it('Viser beredskap og nattevåk', () => {
        expect(soknadKvitteringFull.text().includes('skjema.beredskap.overskrift')).toBe(true);
        expect(soknadKvitteringFull.text().includes('skjema.nattevaak.overskrift')).toBe(true);

        expect(soknadKvitteringTom.text().includes('skjema.beredskap.overskrift')).toBe(false);
        expect(soknadKvitteringTom.text().includes('skjema.nattevaak.overskrift')).toBe(false);
    });

    it('Viser medlemskap', () => {
        expect(soknadKvitteringFull.text().includes('skjema.medlemskap.overskrift')).toBe(true);
        expect(soknadKvitteringTom.text().includes('skjema.medlemskap.overskrift')).toBe(false);
    });

    it('Viser tilleggsopplysninger', () => {
        expect(soknadKvitteringFull.text().includes('skjema.soknadskvittering.tilleggsopplysninger')).toBe(true);
        expect(soknadKvitteringFull.text().includes('skjema.medisinskeopplysninger:')).toBe(true);
        expect(soknadKvitteringFull.text().includes('skjema.opplysningerikkepunsjet:')).toBe(true);

        expect(soknadKvitteringTom.text().includes('skjema.soknadskvittering.tilleggsopplysninger')).toBe(false);
        expect(soknadKvitteringTom.text().includes('skjema.medisinskeopplysninger:')).toBe(false);
        expect(soknadKvitteringTom.text().includes('skjema.opplysningerikkepunsjet:')).toBe(false);
    });

    it('Viser alle perioder', () => {
        expect(soknadKvitteringFull.find('VisningAvPerioderSoknadKvittering')).toHaveLength(8);
        expect(soknadKvitteringTom.find('VisningAvPerioderSoknadKvittering')).toHaveLength(0);
    });
});
