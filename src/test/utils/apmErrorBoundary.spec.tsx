import { init } from '@nais/apm';
import { ApmErrorBoundary } from '@nais/apm/react';
import { BaseTransport, TransportItemType, type TransportItem } from '@grafana/faro-web-sdk';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { filterTelemetry } from '../../app/utils/telemetryPrivacy';

const BrokenComponent = (): React.ReactNode => {
    const error = new TypeError('HTTP 503');
    Object.assign(error, { cause: new Error('synthetic-journalpost-id?token=synthetic-token') });
    throw error;
};

class TestTransport extends BaseTransport {
    readonly name = 'test';
    readonly version = '1';
    send = jest.fn();
}

it('sends one safe render error through the SDK and privacy filter with the nested fallback', () => {
    const filteredItems: TransportItem[] = [];
    const transport = new TestTransport();
    init({
        app: 'k9-punsj-frontend',
        namespace: 'k9saksbehandling',
        telemetryUrl: 'https://collector.example/collect',
        beforeSend: (item) => {
            const filtered = filterTelemetry(item);
            if (filtered) filteredItems.push(filtered);
            return filtered;
        },
        faro: { url: undefined, instrumentations: [], transports: [transport] },
    });
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
        render(
            <ApmErrorBoundary fallback={<div role="alert">Journalpost error</div>}>
                <BrokenComponent />
            </ApmErrorBoundary>,
        );

        expect(screen.getByRole('alert')).toHaveTextContent('Journalpost error');
        expect(filteredItems).toHaveLength(1);
        expect(filteredItems[0]).toMatchObject({
            type: TransportItemType.EXCEPTION,
            payload: { type: 'TypeError', value: 'HTTP 503' },
        });
        expect(transport.send).toHaveBeenCalledTimes(1);
        expect(transport.send).toHaveBeenCalledWith(filteredItems[0]);
        expect(JSON.stringify(transport.send.mock.calls)).not.toMatch(/synthetic-journalpost-id|synthetic-token/);
    } finally {
        consoleError.mockRestore();
    }
});
