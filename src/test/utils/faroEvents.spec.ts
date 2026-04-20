import { faro } from '@grafana/faro-web-sdk';
import {
    PUNSJ_SUBMIT_FIELD_GROUP_EVENT,
    PUNSJ_SUBMIT_SNAPSHOT_EVENT,
    PUNSJ_STARTED_EVENT,
    PSB_FIELD_GROUPS,
    MANUAL_JOURNALPOST_FLOW_STARTED_EVENT,
    clearManualJournalpostFlowSource,
    getPsbSubmittedFieldGroups,
    getPunsjSourceForJournalpost,
    pushFaroEvent,
    setManualJournalpostFlowSource,
    trackManualJournalpostFlowStarted,
    trackPsbStartedFromJournalpost,
    trackPsbSubmitFromJournalpost,
} from '../../app/utils/faroEvents';
import { IPSBSoknadKvittering } from '../../app/models/types/PSBSoknadKvittering';

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
            nattevåk: { perioder: {} },
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
        begrunnelseForInnsending: { tekst: 'test' },
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

    it('Skal mappe PSB-kvittering til forventede feltgrupper', () => {
        expect(getPsbSubmittedFieldGroups(psbKvittering)).toEqual([
            PSB_FIELD_GROUPS.ARBEIDSTID,
            PSB_FIELD_GROUPS.TREKK_AV_PERIODE,
            PSB_FIELD_GROUPS.PERIODE,
            PSB_FIELD_GROUPS.ANNET,
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
});
