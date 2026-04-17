import { faro } from '@grafana/faro-web-sdk';
import {
    MANUAL_JOURNALPOST_FLOW_STARTED_EVENT,
    pushFaroEvent,
    trackManualJournalpostFlowStarted,
} from '../../app/utils/faroEvents';

jest.mock('@grafana/faro-web-sdk', () => ({
    faro: {
        api: {
            pushEvent: jest.fn(),
        },
    },
}));

describe('faroEvents', () => {
    const pushEventMock = faro.api.pushEvent as jest.Mock;

    beforeEach(() => {
        pushEventMock.mockClear();
        delete window.nais;
    });

    it('Skal ikke sende event når collector url ikke er tilgjengelig', () => {
        const result = pushFaroEvent('test_event', { source: 'test' });

        expect(result).toBeFalsy();
        expect(pushEventMock).not.toHaveBeenCalled();
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
        });
    });
});
