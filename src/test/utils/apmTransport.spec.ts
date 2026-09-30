import { init } from '@nais/apm';
import { apmFaroOptions, filterTelemetry } from '../../app/utils/telemetryPrivacy';

it('sender tillatt rutehendelse til Nais APM uten sesjonsmetadata', async () => {
    const collector = 'https://collector.example/collect';
    const fetchMock = vi.fn().mockResolvedValue({ status: 202, ok: true, headers: new Headers() });
    vi.stubGlobal('fetch', fetchMock);

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

    await vi.waitFor(() => {
        expect(fetchMock).toHaveBeenCalledWith(collector, expect.objectContaining({ method: 'POST' }));
    });
    const [, request] = fetchMock.mock.calls.find(([url]) => url === collector)!;
    expect(request.body).toContain('punsj_route_change');
    expect(request.body).not.toContain('session');
});
