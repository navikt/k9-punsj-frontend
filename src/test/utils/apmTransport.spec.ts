import { init } from '@nais/apm';
import {
    setManualJournalpostFlowSource,
    trackManualJournalpostFlowStarted,
    trackPsbStartedFromJournalpost,
} from '../../app/utils/faroEvents';
import { apmFaroOptions, filterTelemetry } from '../../app/utils/telemetryPrivacy';

it('sender tillatte rute- og journalposthendelser uten sesjonsmetadata eller journalpost-ID', async () => {
    const collector = 'https://collector.example/collect';
    const fetchMock = vi.fn().mockResolvedValue({ status: 202, ok: true, headers: new Headers() });
    vi.stubGlobal('fetch', fetchMock);
    window.nais = { app: { name: 'k9-punsj-frontend', version: 'test' }, telemetryCollectorURL: collector };

    const faro = init({
        app: 'k9-punsj-frontend',
        namespace: 'k9saksbehandling',
        telemetryUrl: collector,
        version: 'test-sha',
        environment: 'test',
        beforeSend: filterTelemetry,
        tracing: false,
        faro: apmFaroOptions,
    });

    faro.api.pushEvent('punsj_route_change', { route: '/' });
    expect(trackManualJournalpostFlowStarted()).toBe(true);
    expect(setManualJournalpostFlowSource('synthetic-journalpost-id')).toBe(true);
    expect(trackPsbStartedFromJournalpost('synthetic-journalpost-id')).toBe(true);

    await vi.waitFor(() => {
        expect(fetchMock).toHaveBeenCalledWith(collector, expect.objectContaining({ method: 'POST' }));
    });
    const [, request] = fetchMock.mock.calls.find(([url]) => url === collector)!;
    const payload = JSON.parse(request.body);
    expect(payload.events).toEqual(
        expect.arrayContaining([
            expect.objectContaining({ name: 'punsj_route_change', attributes: { route: '/' } }),
            expect.objectContaining({
                name: 'manual_journalpost_flow_started',
                attributes: { source: 'opprett_journalpost', route: '/opprett-journalpost', phase: 'page_opened' },
            }),
            expect.objectContaining({ name: 'punsj_started', attributes: { source: 'opprett_journalpost', sakstype: 'PSB' } }),
        ]),
    );
    expect(payload.meta).not.toHaveProperty('session');
    expect(request.body).not.toContain('synthetic-journalpost-id');
});
