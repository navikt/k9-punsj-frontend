import { faro } from '@grafana/faro-web-sdk';
import {
    PUNSJ_SUBMIT_FIELD_GROUP_EVENT,
    PUNSJ_SUBMIT_SNAPSHOT_EVENT,
    PUNSJ_STARTED_EVENT,
    OLP_FIELD_GROUPS,
    OMPKS_FIELD_GROUPS,
    OMPMA_FIELD_GROUPS,
    OMPUT_FIELD_GROUPS,
    PLS_FIELD_GROUPS,
    PSB_FIELD_GROUPS,
    MANUAL_JOURNALPOST_FLOW_STARTED_EVENT,
    clearManualJournalpostFlowSource,
    getOlpSubmittedFieldGroups,
    getOmpksSubmittedFieldGroups,
    getOmpmaSubmittedFieldGroups,
    getOmputSubmittedFieldGroups,
    getPlsSubmittedFieldGroups,
    getPsbSubmittedFieldGroups,
    getPunsjSourceForJournalpost,
    pushFaroEvent,
    setManualJournalpostFlowSource,
    trackManualJournalpostFlowStarted,
    trackOlpStartedFromJournalpost,
    trackOlpSubmitFromJournalpost,
    trackOmpksStartedFromJournalpost,
    trackOmpksSubmitFromJournalpost,
    trackOmpmaStartedFromJournalpost,
    trackOmpmaSubmitFromJournalpost,
    trackOmputStartedFromJournalpost,
    trackOmputSubmitFromJournalpost,
    trackPlsStartedFromJournalpost,
    trackPlsSubmitFromJournalpost,
    trackPsbStartedFromJournalpost,
    trackPsbSubmitFromJournalpost,
} from '../../app/utils/faroEvents';
import { IPSBSoknadKvittering } from '../../app/models/types/PSBSoknadKvittering';
import { IOMPKSSoknadKvittering } from '../../app/søknader/omsorgspenger-kronisk-sykt-barn/types/OMPKSSoknadKvittering';
import { IOMPMASoknadKvittering } from '../../app/søknader/omsorgspenger-midlertidig-alene/types/OMPMASoknadKvittering';
import { IOMPUTSoknadKvittering } from '../../app/søknader/omsorgspenger-utbetaling/types/OMPUTSoknadKvittering';
import { IOLPSoknadKvittering } from '../../app/søknader/opplæringspenger/OLPSoknadKvittering';
import { IPLSSoknadKvittering } from '../../app/søknader/pleiepenger-livets-sluttfase/types/IPLSSoknadKvittering';

jest.mock('@grafana/faro-web-sdk', () => ({
    faro: {
        api: {
            pushEvent: jest.fn(),
        },
    },
}));

describe('faroEvents', () => {
    const pushEventMock = faro.api.pushEvent as jest.Mock;
    const journalpostId = 'jp-123';
    const psbKvittering: IPSBSoknadKvittering = {
        journalposter: [],
        mottattDato: '2026-04-17T10:00:00.000Z',
        ytelse: {
            type: 'PSB',
            barn: {
                norskIdentitetsnummer: '12345678910',
                fødselsdato: null,
            },
            søknadsperiode: ['2026-04-01/2026-04-10'],
            bosteder: {
                perioder: {
                    '2026-04-01/2026-04-03': { land: 'SWE' },
                },
            },
            utenlandsopphold: {
                perioder: {
                    '2026-04-04/2026-04-05': { land: 'DNK' },
                },
            },
            beredskap: {
                perioder: {
                    '2026-04-06/2026-04-07': { tilleggsinformasjon: 'beredskap' },
                },
            },
            nattevåk: {
                perioder: {
                    '2026-04-07/2026-04-08': { tilleggsinformasjon: 'nattevåk' },
                },
            },
            tilsynsordning: {
                perioder: {
                    '2026-04-08/2026-04-09': { etablertTilsynTimerPerDag: 'PT5H' },
                },
            },
            lovbestemtFerie: {
                perioder: {
                    '2026-04-10/2026-04-10': { skalHaFerie: 'true' },
                },
            },
            arbeidstid: {
                arbeidstakerList: [
                    {
                        norskIdentitetsnummer: null,
                        organisasjonsnummer: '123456789',
                        arbeidstidInfo: {
                            perioder: {
                                '2026-04-01/2026-04-02': {
                                    jobberNormaltTimerPerDag: 'PT7H30M',
                                    faktiskArbeidTimerPerDag: 'PT4H',
                                },
                            },
                        },
                    },
                ],
                frilanserArbeidstidInfo: null,
                selvstendigNæringsdrivendeArbeidstidInfo: null,
            },
            uttak: {
                perioder: {
                    '2026-04-11/2026-04-12': { timerPleieAvBarnetPerDag: 'PT6H' },
                },
            },
            omsorg: {
                relasjonTilBarnet: 'mor',
                beskrivelseAvOmsorgsrollen: null,
            },
            opptjeningAktivitet: {
                frilanser: {
                    startdato: '2026-01-01',
                    sluttdato: null,
                    jobberFortsattSomFrilans: true,
                },
            },
            trekkKravPerioder: ['2026-04-13/2026-04-14'],
        },
        begrunnelseForInnsending: { tekst: '' },
    };
    const plsKvittering: IPLSSoknadKvittering = {
        journalposter: [],
        mottattDato: '2026-04-17T10:00:00.000Z',
        ytelse: {
            type: 'PLS',
            søknadsperiode: ['2026-04-01/2026-04-10'],
            pleietrengende: {
                norskIdentitetsnummer: '12345678910',
            },
            arbeidstid: {
                arbeidstakerList: [
                    {
                        norskIdentitetsnummer: null,
                        organisasjonsnummer: '123456789',
                        arbeidstidInfo: {
                            perioder: {
                                '2026-04-01/2026-04-02': {
                                    jobberNormaltTimerPerDag: 'PT7H30M',
                                    faktiskArbeidTimerPerDag: 'PT4H',
                                },
                            },
                        },
                    },
                ],
                frilanserArbeidstidInfo: null,
                selvstendigNæringsdrivendeArbeidstidInfo: null,
            },
            opptjeningAktivitet: {
                frilanser: {
                    startdato: '2026-01-01',
                    sluttdato: null,
                    jobberFortsattSomFrilans: true,
                },
            },
            lovbestemtFerie: {
                perioder: {
                    '2026-04-10/2026-04-10': { skalHaFerie: 'true' },
                },
            },
            bosteder: {
                perioder: {
                    '2026-04-01/2026-04-03': { land: 'SWE' },
                },
            },
            utenlandsopphold: {
                perioder: {
                    '2026-04-04/2026-04-05': { land: 'DNK' },
                },
            },
            trekkKravPerioder: ['2026-04-13/2026-04-14'],
        },
        begrunnelseForInnsending: { tekst: '' },
    };
    const ompksKvittering: IOMPKSSoknadKvittering = {
        journalposter: [],
        mottattDato: '2026-04-17T10:00:00.000Z',
        ytelse: {
            type: 'OMPKS',
            barn: {
                norskIdentitetsnummer: '12345678910',
                fødselsdato: null,
            },
            kroniskEllerFunksjonshemming: true,
        },
        begrunnelseForInnsending: { tekst: '' },
    };
    const ompmaKvittering: IOMPMASoknadKvittering = {
        journalposter: [],
        mottattDato: '2026-04-17T10:00:00.000Z',
        ytelse: {
            type: 'OMPMA',
            barn: [
                {
                    norskIdentitetsnummer: '12345678910',
                },
            ],
            annenForelder: {
                norskIdentitetsnummer: '10987654321',
                situasjon: 'INNLAGT_I_HELSEINSTITUSJON',
                situasjonBeskrivelse: '',
                periode: '2026-04-01/2026-04-10',
            },
        },
        begrunnelseForInnsending: { tekst: '' },
    };
    const olpKvittering: IOLPSoknadKvittering = {
        journalposter: [],
        mottattDato: '2026-04-17T10:00:00.000Z',
        språk: 'nb',
        søker: {
            norskIdentitetsnummer: '12345678910',
        },
        søknadId: '',
        versjon: '1',
        ytelse: {
            type: 'OLP',
            barn: {
                norskIdentitetsnummer: '12345678910',
                fødselsdato: null,
            },
            søknadsperiode: ['2026-04-01/2026-04-10'],
            trekkKravPerioder: ['2026-04-11/2026-04-12'],
            opptjeningAktivitet: {
                frilanser: {
                    startdato: '2026-01-01',
                    sluttdato: null,
                    jobberFortsattSomFrilans: true,
                },
                selvstendigNæringsdrivende: [],
            },
            dataBruktTilUtledning: null,
            bosteder: {
                perioder: {
                    '2026-04-01/2026-04-03': { land: 'SWE' },
                },
                perioderSomSkalSlettes: {},
            },
            utenlandsopphold: {
                perioder: {
                    '2026-04-04/2026-04-05': { land: 'DNK' },
                },
                perioderSomSkalSlettes: {},
            },
            lovbestemtFerie: {
                perioder: {
                    '2026-04-10/2026-04-10': { skalHaFerie: 'true' },
                },
            },
            arbeidstid: {
                arbeidstakerList: [
                    {
                        norskIdentitetsnummer: null,
                        organisasjonsnummer: '123456789',
                        arbeidstidInfo: {
                            perioder: {
                                '2026-04-01/2026-04-02': {
                                    jobberNormaltTimerPerDag: 'PT7H30M',
                                    faktiskArbeidTimerPerDag: 'PT4H',
                                },
                            },
                        },
                    },
                ],
                frilanserArbeidstidInfo: null,
                selvstendigNæringsdrivendeArbeidstidInfo: {
                    perioder: {},
                },
            },
            uttak: {
                perioder: {
                    '2026-04-11/2026-04-12': { timerPleieAvBarnetPerDag: 'PT6H' },
                },
            },
            omsorg: {
                relasjonTilBarnet: 'MOR',
                beskrivelseAvOmsorgsrollen: '',
            },
            kurs: {
                kursholder: {
                    navn: '',
                    institusjonsidentifikator: 'institusjon-1',
                },
                kursperioder: ['2026-04-01/2026-04-10'],
                reise: {
                    reisedager: ['2026-04-03'],
                    reisedagerBeskrivelse: '',
                },
            },
        },
        begrunnelseForInnsending: { tekst: '' },
    };
    const omputKvittering: IOMPUTSoknadKvittering = {
        journalposter: [],
        mottattDato: '2026-04-17T10:00:00.000Z',
        språk: 'nb',
        søker: {
            norskIdentitetsnummer: '12345678910',
        },
        søknadId: '',
        versjon: '1',
        ytelse: {
            type: 'OMPUT',
            aktivitet: {
                frilanser: {
                    startdato: '2026-01-01',
                    sluttdato: null,
                    jobberFortsattSomFrilans: true,
                },
                selvstendigNæringsdrivende: {
                    perioder: {},
                    organisasjonsnummer: '',
                    virksomhetNavn: '',
                },
            },
            fraværsperioder: [
                {
                    aktivitetFravær: ['ARBEIDSTAKER'],
                    arbeidsgiverOrgNr: '123456789',
                    duration: 'PT7H30M',
                    delvisFravær: {
                        fravær: 'PT4H',
                        normalarbeidstid: 'PT7H30M',
                    },
                    periode: '2026-04-01/2026-04-02',
                    søknadÅrsak: 'ARBEIDSGIVER_KONKURS',
                    årsak: 'ORDINÆRT_FRAVÆR',
                },
                {
                    aktivitetFravær: ['FRILANSER', 'SELVSTENDIG_VIRKSOMHET'],
                    duration: 'PT7H30M',
                    delvisFravær: {
                        fravær: 'PT4H',
                        normalarbeidstid: 'PT7H30M',
                    },
                    periode: '2026-04-03/2026-04-04',
                    søknadÅrsak: 'ARBEIDSGIVER_KONKURS',
                    årsak: 'ORDINÆRT_FRAVÆR',
                },
            ],
        },
        begrunnelseForInnsending: { tekst: '' },
    };

    beforeEach(() => {
        pushEventMock.mockClear();
        delete window.nais;
        window.sessionStorage.clear();
    });

    it('Skal ikke sende event når collector url ikke er tilgjengelig', () => {
        const result = pushFaroEvent('test_event', { source: 'test' });

        expect(result).toBeFalsy();
        expect(pushEventMock).not.toHaveBeenCalled();
    });

    it('Skal videresende Faro-event options til SDK-et', () => {
        window.nais = {
            telemetryCollectorURL: 'https://collector.example/collect',
            app: { name: 'k9-punsj-frontend', version: 'test' },
        };

        const result = pushFaroEvent('test_event', { source: 'test' }, { skipDedupe: true });

        expect(result).toBeTruthy();
        expect(pushEventMock).toHaveBeenCalledWith('test_event', { source: 'test' }, undefined, { skipDedupe: true });
    });

    it('Skal sende custom Faro-event for manuelt opprettet journalpost med trygge attributter', () => {
        window.nais = {
            telemetryCollectorURL: 'https://collector.example/collect',
            app: { name: 'k9-punsj-frontend', version: 'test' },
        };

        const result = trackManualJournalpostFlowStarted();

        expect(result).toBeTruthy();
        expect(pushEventMock).toHaveBeenCalledWith(MANUAL_JOURNALPOST_FLOW_STARTED_EVENT, {
            source: 'opprett_journalpost',
            route: '/opprett-journalpost',
            phase: 'page_opened',
        }, undefined, { skipDedupe: true });
    });

    it('Skal lagre og rydde manuelt opprettet journalpost som kilde for senere punsjflyt', () => {
        expect(getPunsjSourceForJournalpost(journalpostId)).toBe('unknown');

        expect(setManualJournalpostFlowSource(journalpostId)).toBeTruthy();
        expect(getPunsjSourceForJournalpost(journalpostId)).toBe('opprett_journalpost');

        expect(clearManualJournalpostFlowSource(journalpostId)).toBeTruthy();
        expect(getPunsjSourceForJournalpost(journalpostId)).toBe('unknown');
    });

    it('Skal lese journalpostIder fra sessionStorage med trimmet format', () => {
        window.sessionStorage.setItem('manualJournalpostSourceIds', JSON.stringify(['  jp-123  ']));

        expect(getPunsjSourceForJournalpost(journalpostId)).toBe('opprett_journalpost');
        expect(clearManualJournalpostFlowSource(journalpostId)).toBeTruthy();
        expect(window.sessionStorage.getItem('manualJournalpostSourceIds')).toBeNull();
    });

    it('Skal mappe PSB-kvittering til forventede feltgrupper', () => {
        expect(getPsbSubmittedFieldGroups(psbKvittering)).toEqual([
            PSB_FIELD_GROUPS.ARBEIDSTID,
            PSB_FIELD_GROUPS.TREKK_AV_PERIODE,
            PSB_FIELD_GROUPS.PERIODE,
            PSB_FIELD_GROUPS.TILSYN,
            PSB_FIELD_GROUPS.BEREDSKAP,
            PSB_FIELD_GROUPS.NATTEVAAK,
            PSB_FIELD_GROUPS.FERIE,
            PSB_FIELD_GROUPS.UTENLANDSOPPHOLD,
            PSB_FIELD_GROUPS.BOSTED,
            PSB_FIELD_GROUPS.UTTAK,
            PSB_FIELD_GROUPS.OMSORG,
            PSB_FIELD_GROUPS.OPPTJENING,
        ]);
    });

    it('Skal ikke mappe tomme PSB-seksjoner til annet', () => {
        expect(getPsbSubmittedFieldGroups({
            ...psbKvittering,
            ytelse: {
                ...psbKvittering.ytelse,
                søknadsperiode: [],
                bosteder: { perioder: {} },
                utenlandsopphold: { perioder: {} },
                beredskap: { perioder: {} },
                nattevåk: { perioder: {} },
                tilsynsordning: { perioder: {} },
                lovbestemtFerie: { perioder: {} },
                arbeidstid: {
                    arbeidstakerList: [],
                    frilanserArbeidstidInfo: null,
                    selvstendigNæringsdrivendeArbeidstidInfo: null,
                },
                uttak: { perioder: {} },
                omsorg: {
                    relasjonTilBarnet: null,
                    beskrivelseAvOmsorgsrollen: '',
                },
                opptjeningAktivitet: {},
                trekkKravPerioder: [],
            },
        })).toEqual([]);
    });

    it('Skal mappe PLS-kvittering til forventede feltgrupper', () => {
        expect(getPlsSubmittedFieldGroups(plsKvittering)).toEqual([
            PLS_FIELD_GROUPS.ARBEIDSTID,
            PLS_FIELD_GROUPS.TREKK_AV_PERIODE,
            PLS_FIELD_GROUPS.PERIODE,
            PLS_FIELD_GROUPS.FERIE,
            PLS_FIELD_GROUPS.UTENLANDSOPPHOLD,
            PLS_FIELD_GROUPS.BOSTED,
            PLS_FIELD_GROUPS.OPPTJENING,
        ]);
    });

    it('Skal ikke mappe tomme PLS-seksjoner til feltgrupper', () => {
        expect(getPlsSubmittedFieldGroups({
            ...plsKvittering,
            ytelse: {
                ...plsKvittering.ytelse,
                søknadsperiode: [],
                arbeidstid: {
                    arbeidstakerList: [],
                    frilanserArbeidstidInfo: null,
                    selvstendigNæringsdrivendeArbeidstidInfo: null,
                },
                opptjeningAktivitet: {},
                lovbestemtFerie: { perioder: {} },
                bosteder: { perioder: {} },
                utenlandsopphold: { perioder: {} },
                trekkKravPerioder: [],
            },
        })).toEqual([]);
    });

    it('Skal mappe OMPKS-kvittering til forventede feltgrupper', () => {
        expect(getOmpksSubmittedFieldGroups(ompksKvittering)).toEqual([
            OMPKS_FIELD_GROUPS.KRONISK_ELLER_FUNKSJONSHEMMING,
        ]);
    });

    it('Skal mappe OMPMA-kvittering til forventede feltgrupper', () => {
        expect(getOmpmaSubmittedFieldGroups(ompmaKvittering)).toEqual([
            OMPMA_FIELD_GROUPS.BARN,
            OMPMA_FIELD_GROUPS.ANNEN_FORELDER,
        ]);
    });

    it('Skal mappe OLP-kvittering til forventede feltgrupper', () => {
        expect(getOlpSubmittedFieldGroups(olpKvittering)).toEqual([
            OLP_FIELD_GROUPS.ARBEIDSTID,
            OLP_FIELD_GROUPS.TREKK_AV_PERIODE,
            OLP_FIELD_GROUPS.PERIODE,
            OLP_FIELD_GROUPS.KURS,
            OLP_FIELD_GROUPS.REISE,
            OLP_FIELD_GROUPS.FERIE,
            OLP_FIELD_GROUPS.UTENLANDSOPPHOLD,
            OLP_FIELD_GROUPS.BOSTED,
            OLP_FIELD_GROUPS.UTTAK,
            OLP_FIELD_GROUPS.OMSORG,
            OLP_FIELD_GROUPS.OPPTJENING,
        ]);
    });

    it('Skal mappe OMPUT-kvittering til forventede feltgrupper', () => {
        expect(getOmputSubmittedFieldGroups(omputKvittering)).toEqual([
            OMPUT_FIELD_GROUPS.ARBEIDSTAKER,
            OMPUT_FIELD_GROUPS.FRILANSER,
            OMPUT_FIELD_GROUPS.SELVSTENDIG,
        ]);
    });

    it('Skal sende PSB start-event for manuell journalpostflyt', () => {
        window.nais = {
            telemetryCollectorURL: 'https://collector.example/collect',
            app: { name: 'k9-punsj-frontend', version: 'test' },
        };

        setManualJournalpostFlowSource(journalpostId);

        const result = trackPsbStartedFromJournalpost(journalpostId);

        expect(result).toBeTruthy();
        expect(pushEventMock).toHaveBeenCalledWith(PUNSJ_STARTED_EVENT, {
            source: 'opprett_journalpost',
            sakstype: 'PSB',
        }, undefined, { skipDedupe: true });
        expect(getPunsjSourceForJournalpost(journalpostId)).toBe('opprett_journalpost');
    });

    it('Skal sende PSB submit snapshot og feltgruppe-events for manuell journalpostflyt', () => {
        window.nais = {
            telemetryCollectorURL: 'https://collector.example/collect',
            app: { name: 'k9-punsj-frontend', version: 'test' },
        };

        setManualJournalpostFlowSource(journalpostId);

        const fieldGroups = trackPsbSubmitFromJournalpost(journalpostId, psbKvittering);

        expect(fieldGroups).toEqual(getPsbSubmittedFieldGroups(psbKvittering));
        expect(pushEventMock).toHaveBeenNthCalledWith(1, PUNSJ_SUBMIT_SNAPSHOT_EVENT, {
            source: 'opprett_journalpost',
            sakstype: 'PSB',
            used_field_groups: fieldGroups.join(','),
            used_field_group_count: String(fieldGroups.length),
        }, undefined, { skipDedupe: true });
        expect(pushEventMock).toHaveBeenCalledTimes(1 + fieldGroups.length);
        expect(pushEventMock).toHaveBeenCalledWith(PUNSJ_SUBMIT_FIELD_GROUP_EVENT, {
            source: 'opprett_journalpost',
            sakstype: 'PSB',
            field_group: PSB_FIELD_GROUPS.ARBEIDSTID,
        }, undefined, { skipDedupe: true });
        expect(getPunsjSourceForJournalpost(journalpostId)).toBe('unknown');
    });

    it('Skal ikke sende PSB submit-events når journalposten ikke kommer fra manuell opprettelse', () => {
        const fieldGroups = trackPsbSubmitFromJournalpost(journalpostId, psbKvittering);

        expect(fieldGroups).toEqual([]);
        expect(pushEventMock).not.toHaveBeenCalled();
    });

    it('Skal sende PLS start-event for manuell journalpostflyt', () => {
        window.nais = {
            telemetryCollectorURL: 'https://collector.example/collect',
            app: { name: 'k9-punsj-frontend', version: 'test' },
        };

        setManualJournalpostFlowSource(journalpostId);

        const result = trackPlsStartedFromJournalpost(journalpostId);

        expect(result).toBeTruthy();
        expect(pushEventMock).toHaveBeenCalledWith(PUNSJ_STARTED_EVENT, {
            source: 'opprett_journalpost',
            sakstype: 'PLS',
        }, undefined, { skipDedupe: true });
        expect(getPunsjSourceForJournalpost(journalpostId)).toBe('opprett_journalpost');
    });

    it('Skal sende PLS submit snapshot og feltgruppe-events for manuell journalpostflyt', () => {
        window.nais = {
            telemetryCollectorURL: 'https://collector.example/collect',
            app: { name: 'k9-punsj-frontend', version: 'test' },
        };

        setManualJournalpostFlowSource(journalpostId);

        const fieldGroups = trackPlsSubmitFromJournalpost(journalpostId, plsKvittering);

        expect(fieldGroups).toEqual(getPlsSubmittedFieldGroups(plsKvittering));
        expect(pushEventMock).toHaveBeenNthCalledWith(1, PUNSJ_SUBMIT_SNAPSHOT_EVENT, {
            source: 'opprett_journalpost',
            sakstype: 'PLS',
            used_field_groups: fieldGroups.join(','),
            used_field_group_count: String(fieldGroups.length),
        }, undefined, { skipDedupe: true });
        expect(pushEventMock).toHaveBeenCalledTimes(1 + fieldGroups.length);
        expect(pushEventMock).toHaveBeenCalledWith(PUNSJ_SUBMIT_FIELD_GROUP_EVENT, {
            source: 'opprett_journalpost',
            sakstype: 'PLS',
            field_group: PLS_FIELD_GROUPS.ARBEIDSTID,
        }, undefined, { skipDedupe: true });
        expect(getPunsjSourceForJournalpost(journalpostId)).toBe('unknown');
    });

    it('Skal ikke sende PLS submit-events når journalposten ikke kommer fra manuell opprettelse', () => {
        const fieldGroups = trackPlsSubmitFromJournalpost(journalpostId, plsKvittering);

        expect(fieldGroups).toEqual([]);
        expect(pushEventMock).not.toHaveBeenCalled();
    });

    it('Skal sende OMPKS start-event for manuell journalpostflyt', () => {
        window.nais = {
            telemetryCollectorURL: 'https://collector.example/collect',
            app: { name: 'k9-punsj-frontend', version: 'test' },
        };

        setManualJournalpostFlowSource(journalpostId);

        const result = trackOmpksStartedFromJournalpost(journalpostId);

        expect(result).toBeTruthy();
        expect(pushEventMock).toHaveBeenCalledWith(PUNSJ_STARTED_EVENT, {
            source: 'opprett_journalpost',
            sakstype: 'OMPKS',
        }, undefined, { skipDedupe: true });
        expect(getPunsjSourceForJournalpost(journalpostId)).toBe('opprett_journalpost');
    });

    it('Skal sende OMPKS submit snapshot og feltgruppe-events for manuell journalpostflyt', () => {
        window.nais = {
            telemetryCollectorURL: 'https://collector.example/collect',
            app: { name: 'k9-punsj-frontend', version: 'test' },
        };

        setManualJournalpostFlowSource(journalpostId);

        const fieldGroups = trackOmpksSubmitFromJournalpost(journalpostId, ompksKvittering);

        expect(fieldGroups).toEqual(getOmpksSubmittedFieldGroups(ompksKvittering));
        expect(pushEventMock).toHaveBeenNthCalledWith(1, PUNSJ_SUBMIT_SNAPSHOT_EVENT, {
            source: 'opprett_journalpost',
            sakstype: 'OMPKS',
            used_field_groups: fieldGroups.join(','),
            used_field_group_count: String(fieldGroups.length),
        }, undefined, { skipDedupe: true });
        expect(pushEventMock).toHaveBeenCalledTimes(1 + fieldGroups.length);
        expect(pushEventMock).toHaveBeenCalledWith(PUNSJ_SUBMIT_FIELD_GROUP_EVENT, {
            source: 'opprett_journalpost',
            sakstype: 'OMPKS',
            field_group: OMPKS_FIELD_GROUPS.KRONISK_ELLER_FUNKSJONSHEMMING,
        }, undefined, { skipDedupe: true });
        expect(getPunsjSourceForJournalpost(journalpostId)).toBe('unknown');
    });

    it('Skal ikke sende OMPKS submit-events når journalposten ikke kommer fra manuell opprettelse', () => {
        const fieldGroups = trackOmpksSubmitFromJournalpost(journalpostId, ompksKvittering);

        expect(fieldGroups).toEqual([]);
        expect(pushEventMock).not.toHaveBeenCalled();
    });

    it('Skal sende OMPMA start-event for manuell journalpostflyt', () => {
        window.nais = {
            telemetryCollectorURL: 'https://collector.example/collect',
            app: { name: 'k9-punsj-frontend', version: 'test' },
        };

        setManualJournalpostFlowSource(journalpostId);

        const result = trackOmpmaStartedFromJournalpost(journalpostId);

        expect(result).toBeTruthy();
        expect(pushEventMock).toHaveBeenCalledWith(PUNSJ_STARTED_EVENT, {
            source: 'opprett_journalpost',
            sakstype: 'OMPMA',
        }, undefined, { skipDedupe: true });
        expect(getPunsjSourceForJournalpost(journalpostId)).toBe('opprett_journalpost');
    });

    it('Skal sende OMPMA submit snapshot og feltgruppe-events for manuell journalpostflyt', () => {
        window.nais = {
            telemetryCollectorURL: 'https://collector.example/collect',
            app: { name: 'k9-punsj-frontend', version: 'test' },
        };

        setManualJournalpostFlowSource(journalpostId);

        const fieldGroups = trackOmpmaSubmitFromJournalpost(journalpostId, ompmaKvittering);

        expect(fieldGroups).toEqual(getOmpmaSubmittedFieldGroups(ompmaKvittering));
        expect(pushEventMock).toHaveBeenNthCalledWith(1, PUNSJ_SUBMIT_SNAPSHOT_EVENT, {
            source: 'opprett_journalpost',
            sakstype: 'OMPMA',
            used_field_groups: fieldGroups.join(','),
            used_field_group_count: String(fieldGroups.length),
        }, undefined, { skipDedupe: true });
        expect(pushEventMock).toHaveBeenCalledTimes(1 + fieldGroups.length);
        expect(pushEventMock).toHaveBeenCalledWith(PUNSJ_SUBMIT_FIELD_GROUP_EVENT, {
            source: 'opprett_journalpost',
            sakstype: 'OMPMA',
            field_group: OMPMA_FIELD_GROUPS.ANNEN_FORELDER,
        }, undefined, { skipDedupe: true });
        expect(getPunsjSourceForJournalpost(journalpostId)).toBe('unknown');
    });

    it('Skal ikke sende OMPMA submit-events når journalposten ikke kommer fra manuell opprettelse', () => {
        const fieldGroups = trackOmpmaSubmitFromJournalpost(journalpostId, ompmaKvittering);

        expect(fieldGroups).toEqual([]);
        expect(pushEventMock).not.toHaveBeenCalled();
    });

    it('Skal sende OLP start-event for manuell journalpostflyt', () => {
        window.nais = {
            telemetryCollectorURL: 'https://collector.example/collect',
            app: { name: 'k9-punsj-frontend', version: 'test' },
        };

        setManualJournalpostFlowSource(journalpostId);

        const result = trackOlpStartedFromJournalpost(journalpostId);

        expect(result).toBeTruthy();
        expect(pushEventMock).toHaveBeenCalledWith(PUNSJ_STARTED_EVENT, {
            source: 'opprett_journalpost',
            sakstype: 'OLP',
        }, undefined, { skipDedupe: true });
        expect(getPunsjSourceForJournalpost(journalpostId)).toBe('opprett_journalpost');
    });

    it('Skal sende OLP submit snapshot og feltgruppe-events for manuell journalpostflyt', () => {
        window.nais = {
            telemetryCollectorURL: 'https://collector.example/collect',
            app: { name: 'k9-punsj-frontend', version: 'test' },
        };

        setManualJournalpostFlowSource(journalpostId);

        const fieldGroups = trackOlpSubmitFromJournalpost(journalpostId, olpKvittering);

        expect(fieldGroups).toEqual(getOlpSubmittedFieldGroups(olpKvittering));
        expect(pushEventMock).toHaveBeenNthCalledWith(1, PUNSJ_SUBMIT_SNAPSHOT_EVENT, {
            source: 'opprett_journalpost',
            sakstype: 'OLP',
            used_field_groups: fieldGroups.join(','),
            used_field_group_count: String(fieldGroups.length),
        }, undefined, { skipDedupe: true });
        expect(pushEventMock).toHaveBeenCalledTimes(1 + fieldGroups.length);
        expect(pushEventMock).toHaveBeenCalledWith(PUNSJ_SUBMIT_FIELD_GROUP_EVENT, {
            source: 'opprett_journalpost',
            sakstype: 'OLP',
            field_group: OLP_FIELD_GROUPS.KURS,
        }, undefined, { skipDedupe: true });
        expect(getPunsjSourceForJournalpost(journalpostId)).toBe('unknown');
    });

    it('Skal ikke sende OLP submit-events når journalposten ikke kommer fra manuell opprettelse', () => {
        const fieldGroups = trackOlpSubmitFromJournalpost(journalpostId, olpKvittering);

        expect(fieldGroups).toEqual([]);
        expect(pushEventMock).not.toHaveBeenCalled();
    });

    it('Skal sende OMPUT start-event for manuell journalpostflyt', () => {
        window.nais = {
            telemetryCollectorURL: 'https://collector.example/collect',
            app: { name: 'k9-punsj-frontend', version: 'test' },
        };

        setManualJournalpostFlowSource(journalpostId);

        const result = trackOmputStartedFromJournalpost(journalpostId);

        expect(result).toBeTruthy();
        expect(pushEventMock).toHaveBeenCalledWith(PUNSJ_STARTED_EVENT, {
            source: 'opprett_journalpost',
            sakstype: 'OMPUT',
        }, undefined, { skipDedupe: true });
        expect(getPunsjSourceForJournalpost(journalpostId)).toBe('opprett_journalpost');
    });

    it('Skal sende OMPUT submit snapshot og feltgruppe-events for manuell journalpostflyt', () => {
        window.nais = {
            telemetryCollectorURL: 'https://collector.example/collect',
            app: { name: 'k9-punsj-frontend', version: 'test' },
        };

        setManualJournalpostFlowSource(journalpostId);

        const fieldGroups = trackOmputSubmitFromJournalpost(journalpostId, omputKvittering);

        expect(fieldGroups).toEqual(getOmputSubmittedFieldGroups(omputKvittering));
        expect(pushEventMock).toHaveBeenNthCalledWith(1, PUNSJ_SUBMIT_SNAPSHOT_EVENT, {
            source: 'opprett_journalpost',
            sakstype: 'OMPUT',
            used_field_groups: fieldGroups.join(','),
            used_field_group_count: String(fieldGroups.length),
        }, undefined, { skipDedupe: true });
        expect(pushEventMock).toHaveBeenCalledTimes(1 + fieldGroups.length);
        expect(pushEventMock).toHaveBeenCalledWith(PUNSJ_SUBMIT_FIELD_GROUP_EVENT, {
            source: 'opprett_journalpost',
            sakstype: 'OMPUT',
            field_group: OMPUT_FIELD_GROUPS.FRILANSER,
        }, undefined, { skipDedupe: true });
        expect(getPunsjSourceForJournalpost(journalpostId)).toBe('unknown');
    });

    it('Skal ikke sende OMPUT submit-events når journalposten ikke kommer fra manuell opprettelse', () => {
        const fieldGroups = trackOmputSubmitFromJournalpost(journalpostId, omputKvittering);

        expect(fieldGroups).toEqual([]);
        expect(pushEventMock).not.toHaveBeenCalled();
    });
});
