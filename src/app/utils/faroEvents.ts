import { EventAttributes, faro } from '@grafana/faro-web-sdk';
import { ROUTES } from 'app/constants/routes';

export const MANUAL_JOURNALPOST_FLOW_STARTED_EVENT = 'manual_journalpost_flow_started';

export const pushFaroEvent = (name: string, attributes?: EventAttributes): boolean => {
    if (typeof window === 'undefined' || !window.nais?.telemetryCollectorURL) {
        return false;
    }

    try {
        faro.api.pushEvent(name, attributes);
        return true;
    } catch {
        return false;
    }
};

export const trackManualJournalpostFlowStarted = (): boolean =>
    pushFaroEvent(MANUAL_JOURNALPOST_FLOW_STARTED_EVENT, {
        source: 'opprett_journalpost',
        route: ROUTES.OPPRETT_JOURNALPOST,
        phase: 'page_opened',
    });
