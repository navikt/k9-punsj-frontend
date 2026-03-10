import { IPeriode } from 'app/models/types/Periode';

const periodPathRegex = /^(.+?)\.perioder(?:\.)?\[(?:'([^']*)'|"([^"]*)"|([^\]]+))\](?:\.(.+))?$/;
export const ENDRING_BEGRUNNELSE_INPUT_ID = 'endringavsoknadsperioder-begrunnelse';

const replaceNorwegianChars = (value: string): string =>
    value
        .replace(/æ/g, 'ae')
        .replace(/ø/g, 'o')
        .replace(/å/g, 'a')
        .replace(/Æ/g, 'ae')
        .replace(/Ø/g, 'o')
        .replace(/Å/g, 'a');

const normaliserAnchorSegment = (value: string): string =>
    replaceNorwegianChars(value)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/--+/g, '-');

const stripQuotes = (value?: string): string | undefined => value?.trim().replace(/^['"]|['"]$/g, '');
// TEMPORARY: backend can emit open-ended periods as 9999-12-31 in some paths.
// Normalize to ".." so anchors stay stable until backend contract is canonical.
const normalizeOpenEndedPeriodKey = (value: string): string => value.replace(/\/9999-12-31$/i, '/..');
const normalizePeriodKeyForAnchor = (periodKey?: string, fallbackKey?: string): string =>
    normalizeOpenEndedPeriodKey(stripQuotes(periodKey) || fallbackKey || 'periode')
        .replace(/\.\./g, 'open')
        .replace(/\//g, '-to-');

export const periodKeyFromPeriode = (periode?: IPeriode): string | undefined => {
    if (!periode) {
        return undefined;
    }

    const fom = periode.fom?.trim() || '..';
    const tom = periode.tom?.trim() || '..';
    return `${fom}/${tom}`;
};

export const createPeriodInputIds = (
    feilkodeprefiks?: string,
    periodKey?: string,
    fallbackKey?: string,
): { fomId: string; tomId: string } => {
    const prefix = normaliserAnchorSegment(feilkodeprefiks || 'periode');
    const key = normaliserAnchorSegment(normalizePeriodKeyForAnchor(periodKey, fallbackKey));
    const baseId = `k9-period-${prefix}-${key}`;

    return {
        fomId: `${baseId}-fom`,
        tomId: `${baseId}-tom`,
    };
};

export const createLandInputId = (feilkodeprefiks?: string, periodKey?: string, fallbackKey?: string): string => {
    const prefix = normaliserAnchorSegment(feilkodeprefiks || 'periode');
    const key = normaliserAnchorSegment(normalizePeriodKeyForAnchor(periodKey, fallbackKey));
    return `k9-field-${prefix}-${key}-land`;
};

export const parsePeriodFeltPath = (
    felt?: string,
): { prefix: string; periodKey: string; suffix?: string } | undefined => {
    if (!felt) {
        return undefined;
    }

    const match = felt.trim().match(periodPathRegex);
    if (!match) {
        return undefined;
    }

    const [, prefix, quotedSingle, quotedDouble, raw, suffix] = match;
    const periodKey = (quotedSingle || quotedDouble || raw || '').trim();

    if (!periodKey) {
        return undefined;
    }

    return {
        prefix,
        periodKey,
        suffix: suffix?.trim() || undefined,
    };
};

export const resolvePeriodInputPart = (suffix?: string, feilmelding?: string): 'fom' | 'tom' => {
    // TEMPORARY: infer FOM/TOM from suffix/message because backend errors do not always
    // provide a precise field target for period-related validation messages.
    const normalizedSuffix = suffix?.toLowerCase() || '';
    if (normalizedSuffix.includes('tom') || normalizedSuffix.includes('tilogmed') || normalizedSuffix.includes('til-og-med')) {
        return 'tom';
    }
    if (normalizedSuffix.includes('fom') || normalizedSuffix.includes('fraogmed') || normalizedSuffix.includes('fra-og-med')) {
        return 'fom';
    }

    const normalizedMessage = feilmelding?.toLowerCase() || '';
    if (normalizedMessage.includes('tom') || normalizedMessage.includes('til og med')) {
        return 'tom';
    }

    return 'fom';
};
