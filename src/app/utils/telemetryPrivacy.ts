import {
    TransportItemType,
    type BeforeSendHook,
    type EventEvent,
    type ExceptionEvent,
    type TransportItem,
} from '@grafana/faro-web-sdk';
import { matchPath } from 'react-router';
import { ApiPath } from 'app/apiConfig';
import {
    MANUAL_JOURNALPOST_FLOW_STARTED_EVENT,
    OLP_FIELD_GROUPS,
    OMPAO_FIELD_GROUPS,
    OMPKS_FIELD_GROUPS,
    OMPMA_FIELD_GROUPS,
    OMPUT_FIELD_GROUPS,
    PLS_FIELD_GROUPS,
    PSB_FIELD_GROUPS,
    PUNSJ_STARTED_EVENT,
    PUNSJ_SUBMIT_COMPLETED_EVENT,
    PUNSJ_SUBMIT_FIELD_GROUP_EVENT,
    PUNSJ_SUBMIT_SNAPSHOT_EVENT,
} from './faroEvents';
import { ROUTES } from 'app/constants/routes';

const CDN_BUNDLE_PATH = /^\/k9saksbehandling\/k9-punsj-frontend\/dist\/js\/[a-zA-Z0-9_.-]+\.js$/;
const ERROR_TYPES = new Set([
    'Error',
    'TypeError',
    'RangeError',
    'ReferenceError',
    'SyntaxError',
    'URIError',
    'AbortError',
    'NetworkError',
    'ChunkLoadError',
]);
const SAFE_MESSAGES = new Set(['Failed to fetch', 'Load failed', 'Network request failed', 'Script error.']);
const HTTP_METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);
const API_ROUTES = Object.values(ApiPath).filter((path) => path.startsWith('/api/'));
export const apiRouteTemplate = (rawUrl: string): string | null => {
    try {
        const url = new URL(rawUrl, window.location.origin);
        if (url.origin !== window.location.origin) return null;
        const exactRoute = API_ROUTES.find((route) => route === url.pathname || `${route}/` === url.pathname);
        if (exactRoute) return exactRoute;
        return (
            API_ROUTES.find(
                (route) =>
                    route.includes('{') &&
                    matchPath({ path: route.replace(/\{([a-zA-Z]+)\}/g, ':$1'), end: true }, url.pathname),
            ) ?? null
        );
    } catch {
        return null;
    }
};
const safeErrorType = (type: string): string => {
    const name = type.replace(/^React ErrorBoundary /, '');
    return ERROR_TYPES.has(name) ? name : 'Error';
};
const safeErrorMessage = (value: string): string => {
    if (/^HTTP (?:4|5)\d{2}$/.test(value)) return value;
    if (SAFE_MESSAGES.has(value)) return value;
    const propertyError = value.match(/^Cannot (read|set) propert(?:y|ies) of (undefined|null)\b/);
    if (propertyError) return `Cannot ${propertyError[1]} properties of ${propertyError[2]}`;
    if (/^Loading chunk .+ failed\b/.test(value)) return 'Loading chunk failed';
    if (/^.+ is not a function$/.test(value)) return 'Value is not a function';
    if (/^.+ is not defined$/.test(value)) return 'Reference is not defined';
    return '[redacted]';
};
const EVENT_KEYS: Record<string, string[]> = {
    [MANUAL_JOURNALPOST_FLOW_STARTED_EVENT]: ['source', 'route', 'phase'],
    [PUNSJ_STARTED_EVENT]: ['source', 'sakstype'],
    [PUNSJ_SUBMIT_COMPLETED_EVENT]: ['source', 'sakstype'],
    [PUNSJ_SUBMIT_FIELD_GROUP_EVENT]: ['source', 'sakstype', 'field_group'],
    [PUNSJ_SUBMIT_SNAPSHOT_EVENT]: ['source', 'sakstype', 'used_field_groups', 'used_field_group_count'],
    punsj_route_change: ['route'],
};
const ROUTE_TEMPLATES = new Set([
    ROUTES.HOME,
    ROUTES.AUTH_CALLBACK,
    ROUTES.OPPRETT_JOURNALPOST,
    ROUTES.BREV_AVSLUTTET_SAK,
    '/journalpost/:journalpostid',
]);
export const routeTemplate = (pathname: string): string | null => {
    if (matchPath(ROUTES.JOURNALPOST_ROOT, pathname)) {
        return '/journalpost/:journalpostid';
    }
    return (
        [ROUTES.HOME, ROUTES.AUTH_CALLBACK, ROUTES.OPPRETT_JOURNALPOST, ROUTES.BREV_AVSLUTTET_SAK].find((route) =>
            matchPath({ path: route, end: true }, pathname),
        ) ?? null
    );
};
const FIELD_GROUPS = new Set<string>(
    Object.values({
        ...PSB_FIELD_GROUPS,
        ...PLS_FIELD_GROUPS,
        ...OLP_FIELD_GROUPS,
        ...OMPKS_FIELD_GROUPS,
        ...OMPMA_FIELD_GROUPS,
        ...OMPAO_FIELD_GROUPS,
        ...OMPUT_FIELD_GROUPS,
    }),
);
const VALUES: Record<string, (value: string) => boolean> = {
    source: (value) => ['opprett_journalpost', 'other'].includes(value),
    route: (value) => ROUTE_TEMPLATES.has(value),
    phase: (value) => value === 'page_opened',
    sakstype: (value) => ['PSB', 'PLS', 'OMPKS', 'OMPMA', 'OMPAO', 'OLP', 'OMPUT'].includes(value),
    field_group: (value) => FIELD_GROUPS.has(value),
    used_field_groups: (value) => value === 'none' || value.split(',').every((group) => FIELD_GROUPS.has(group)),
    used_field_group_count: (value) => /^(?:[0-9]|1[0-5])$/.test(value),
};

const safeMeta = (): TransportItem['meta'] => ({
    app: {
        name: 'k9-punsj-frontend',
        namespace: 'k9saksbehandling',
        version: process.env.APP_VERSION || 'unknown',
        release: process.env.APP_VERSION || 'unknown',
        environment: window.location.hostname,
    },
    page: { url: window.location.origin + '/' },
});

export const filterTelemetry: BeforeSendHook = (item) => {
    if (!item.payload || typeof item.payload !== 'object') {
        return null;
    }

    if (item.type === TransportItemType.EVENT) {
        const event = item.payload as EventEvent;
        const attributes = event.attributes ?? {};
        const keys = Object.keys(attributes);
        if (
            !EVENT_KEYS[event.name] ||
            keys.length !== EVENT_KEYS[event.name].length ||
            !keys.every(
                (key) =>
                    EVENT_KEYS[event.name].includes(key) &&
                    typeof attributes[key] === 'string' &&
                    VALUES[key]?.(attributes[key]),
            )
        ) {
            return null;
        }
        return {
            type: item.type,
            payload: { name: event.name, timestamp: new Date().toISOString(), attributes },
            meta: safeMeta(),
        };
    }

    if (item.type !== TransportItemType.EXCEPTION) {
        return null;
    }

    const error = item.payload as ExceptionEvent;
    const frames = (Array.isArray(error.stacktrace?.frames) ? error.stacktrace.frames : []).flatMap((frame) => {
        try {
            if (typeof frame.filename !== 'string') {
                return [];
            }
            const url = new URL(frame.filename);
            if (url.origin !== 'https://cdn.nav.no' || !CDN_BUNDLE_PATH.test(url.pathname)) {
                return [];
            }
            return [
                {
                    filename: url.origin + url.pathname,
                    function: '[redacted]',
                    ...(typeof frame.lineno === 'number' && Number.isSafeInteger(frame.lineno) && frame.lineno > 0
                        ? { lineno: frame.lineno }
                        : {}),
                    ...(typeof frame.colno === 'number' && Number.isSafeInteger(frame.colno) && frame.colno > 0
                        ? { colno: frame.colno }
                        : {}),
                },
            ];
        } catch {
            return [];
        }
    });

    return {
        type: item.type,
        payload: {
            timestamp: new Date().toISOString(),
            type: typeof error.type === 'string' ? safeErrorType(error.type) : 'Error',
            value: typeof error.value === 'string' ? safeErrorMessage(error.value) : '[redacted]',
            ...(frames?.length ? { stacktrace: { frames } } : {}),
            ...(error.context && typeof error.context.method === 'string' && HTTP_METHODS.has(error.context.method)
                ? {
                      context: {
                          method: error.context.method,
                          ...(typeof error.context.route === 'string' && API_ROUTES.includes(error.context.route)
                              ? { route: error.context.route }
                              : {}),
                      },
                  }
                : {}),
        },
        meta: safeMeta(),
    } satisfies TransportItem;
};
