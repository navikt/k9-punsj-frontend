import { TransportItemType, type TransportItem } from '@grafana/faro-web-sdk';
import { apiRouteTemplate, filterTelemetry, routeTemplate } from '../../app/utils/telemetryPrivacy';
import { ApiPath } from '../../app/apiConfig';

describe('filterTelemetry', () => {
    it('retains only CDN source positions without error text or request identifiers', () => {
        const item = {
            type: TransportItemType.EXCEPTION,
            payload: {
                timestamp: '2026-09-25T00:00:00Z',
                type: 'PrivateCaseError',
                value: 'raw-payload-synthetic-id',
                context: { token: 'synthetic-token' },
                stacktrace: {
                    frames: [
                        {
                            filename:
                                'https://cdn.nav.no/k9saksbehandling/k9-punsj-frontend/dist/js/main.abc123.js?token=synthetic-token',
                            function: 'synthetic-name',
                            lineno: 12,
                            colno: 3,
                        },
                        { filename: 'https://example.nav.no/journalpost/synthetic-id', function: 'privateFunction' },
                    ],
                },
            },
            meta: {
                page: { url: 'https://example.nav.no/journalpost/synthetic-id?q=raw-payload' },
                user: { id: 'synthetic-id' },
                app: { name: 'k9-punsj-frontend', namespace: 'k9saksbehandling' },
            },
        } as TransportItem;

        const result = filterTelemetry(item);

        expect(result).toMatchObject({
            payload: {
                type: 'Error',
                value: '[redacted]',
                stacktrace: {
                    frames: [
                        {
                            filename: 'https://cdn.nav.no/k9saksbehandling/k9-punsj-frontend/dist/js/main.abc123.js',
                            lineno: 12,
                            colno: 3,
                        },
                    ],
                },
            },
            meta: { page: { url: window.location.origin + '/' } },
        });
        expect(JSON.stringify(result)).not.toMatch(
            /synthetic-id|synthetic-token|raw-payload|PrivateCaseError|synthetic-name|privateFunction/,
        );
    });

    it('drops unclassified signals', () => {
        expect(
            filterTelemetry({
                type: TransportItemType.LOG,
                payload: { message: ['private'] },
                meta: {},
            } as TransportItem),
        ).toBeNull();
        expect(
            filterTelemetry({ type: TransportItemType.EXCEPTION, payload: null, meta: {} } as unknown as TransportItem),
        ).toBeNull();
        expect(
            filterTelemetry({
                type: TransportItemType.TRACE,
                payload: { resourceSpans: [{ scopeSpans: [{ spans: [{ traceId: 'a'.repeat(32) }] }] }] },
                meta: {},
            } as TransportItem),
        ).toBeNull();
    });

    it('retains only known error types and fixed safe messages or HTTP status', () => {
        const exception = (type: string, value: string) =>
            filterTelemetry({
                type: TransportItemType.EXCEPTION,
                payload: { type, value, timestamp: new Date().toISOString(), context: { payload: 'synthetic-secret' } },
                meta: {},
            } as TransportItem);

        expect(exception('React ErrorBoundary TypeError', 'Failed to fetch')?.payload).toMatchObject({
            type: 'TypeError',
            value: 'Failed to fetch',
        });
        expect(exception('Error', 'HTTP 503')?.payload).toMatchObject({ type: 'Error', value: 'HTTP 503' });
        expect(exception('SyntheticName-synthetic-secret', 'HTTP 503 body=synthetic-secret')?.payload).toMatchObject({
            type: 'Error',
            value: '[redacted]',
        });
        expect(JSON.stringify(exception('Error', 'HTTP 503'))).not.toContain('synthetic-secret');
    });

    it('retains only a classified API method and route on outgoing HTTP failures', () => {
        const url = `${window.location.origin}/api/k9-punsj/pleiepenger-sykt-barn-soknad/mappe/synthetic-id?token=synthetic-token`;
        expect(apiRouteTemplate(url)).toBe(ApiPath.PSB_SOKNAD_GET);
        expect(apiRouteTemplate(`${window.location.origin}${ApiPath.JOURNALPOST_MOTTAK}`)).toBe(
            ApiPath.JOURNALPOST_MOTTAK,
        );
        expect(apiRouteTemplate('https://other.nav.no/api/k9-punsj/person')).toBeNull();
        const item = {
            type: TransportItemType.EXCEPTION,
            payload: {
                timestamp: new Date().toISOString(),
                type: 'Error',
                value: 'HTTP 503',
                context: { method: 'GET', route: ApiPath.PSB_SOKNAD_GET, payload: 'synthetic-private-body' },
            },
            meta: { page: { url } },
        } as TransportItem;
        expect(filterTelemetry(item)?.payload).toMatchObject({
            value: 'HTTP 503',
            context: { method: 'GET', route: ApiPath.PSB_SOKNAD_GET },
        });
        expect(JSON.stringify(filterTelemetry(item))).not.toMatch(
            /synthetic-id|synthetic-token|synthetic-private-body/,
        );
        expect(
            filterTelemetry({ ...item, payload: { ...item.payload, context: { method: 'GET', route: url } } })?.payload,
        ).not.toMatchObject({ context: { route: url } });
    });

    it('keeps allowed product attributes but rejects untrusted values and keys', () => {
        const attributes = {
            source: 'opprett_journalpost',
            sakstype: 'PSB',
            used_field_groups: 'arbeidstid,periode',
            used_field_group_count: '2',
        };
        const item = {
            type: TransportItemType.EVENT,
            payload: { name: 'punsj_submit_snapshot', attributes },
            meta: {
                app: { name: 'private-id', version: 'private-id', release: 'private-id' },
                page: { url: 'https://example.nav.no/journalpost/private-id?token=private' },
            },
        } as TransportItem;

        expect(filterTelemetry(item)?.payload).toMatchObject({ name: 'punsj_submit_snapshot', attributes });
        expect(JSON.stringify(filterTelemetry(item))).not.toContain('private-id');
        expect(
            filterTelemetry({
                ...item,
                payload: { ...item.payload, attributes: { ...attributes, journalpostId: 'private-id' } },
            }),
        ).toBeNull();
        expect(
            filterTelemetry({
                ...item,
                payload: { ...item.payload, attributes: { ...attributes, sakstype: 'private-id' } },
            }),
        ).toBeNull();
        expect(filterTelemetry({ ...item, payload: { ...item.payload, attributes: {} } })).toBeNull();
        expect(
            filterTelemetry({
                ...item,
                payload: {
                    ...item.payload,
                    attributes: { ...attributes, used_field_groups: { value: 'synthetic-secret' } },
                },
            } as unknown as TransportItem),
        ).toBeNull();
    });

    it('reports only recognized route templates without journalpost IDs or queries', () => {
        const template = routeTemplate('/journalpost/private-id/pleiepenger-sykt-barn/skjema/private-form');
        expect(template).toBe('/journalpost/:journalpostid');
        expect(routeTemplate('/unknown/private-id')).toBeNull();
        const item = {
            type: TransportItemType.EVENT,
            payload: { name: 'punsj_route_change', attributes: { route: template } },
            meta: {},
        } as TransportItem;
        expect(JSON.stringify(filterTelemetry(item))).not.toContain('private-id');
        expect(
            filterTelemetry({
                ...item,
                payload: {
                    name: 'punsj_route_change',
                    timestamp: new Date().toISOString(),
                    attributes: { route: '/journalpost/private-id' },
                },
            }),
        ).toBeNull();
    });
});
