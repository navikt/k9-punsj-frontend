import { resolveConfig } from '@nais/apm';

afterEach(() => {
    vi.unstubAllGlobals();
});

it.each([
    ['k9-punsj-frontend.intern.dev.nav.no', 'https://telemetry.ekstern.dev.nav.no/collect'],
    ['k9-punsj-frontend.intern.nav.no', 'https://telemetry.nav.no/collect'],
])('velger riktig APM-kollektor for %s', (hostname, telemetryUrl) => {
    vi.stubGlobal('window', { location: { hostname } });

    expect(resolveConfig({ app: 'k9-punsj-frontend', namespace: 'k9saksbehandling' }).telemetryUrl).toBe(telemetryUrl);
});
