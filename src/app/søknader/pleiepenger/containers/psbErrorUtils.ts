import { IntlShape } from 'react-intl';

import { IInputError } from 'app/models/types';
import intlHelper from 'app/utils/intlUtils';

interface GetUnhandledErrorsParams {
    attribute: string;
    inputErrors?: IInputError[];
    feilmeldingStier: Set<string>;
}

interface GetPSBErrorMessageParams {
    attribute: string;
    indeks?: number;
    inputErrors?: IInputError[];
    mottattDato?: string | null;
    klokkeslett?: string | null;
    erFremITidKlokkeslett: (klokkeslett: string) => boolean;
    intl: IntlShape;
}

interface LegacyFeilPayload {
    felt?: string;
    feilkode?: string;
    feilmelding?: string;
}

/**
 * TEMPORARY PSB compatibility utilities.
 * These path and message normalizers compensate for unstable validation paths
 * returned from backend/k9-format. Remove after backend exposes canonical field paths.
 */
const canonicalizeSnOrgnummerPath = (path: string): string =>
    path
        .replace(
            /^(ytelse\.opptjeningAktivitet\.selvstendigNæringsdrivende\[\d+])\.okOrganisasjonsnummer$/,
            '$1.organisasjonsnummer',
        )
        .replace(
            /^(ytelse\.opptjeningAktivitet\.selvstendigNæringsdrivende\[\d+])\.organisasjonsnummer\.(valid|verdi)$/,
            '$1.organisasjonsnummer',
        );

const normalizePath = (path?: string): string | undefined => {
    if (!path) return undefined;

    return canonicalizeSnOrgnummerPath(path.trim())
        .replace(/\.?\[(?:'[^']*'|"[^"]*"|[^[\]]+)\]/g, '[*]')
        .replace(/^\.+|\.+$/g, '');
};

const canonicalizePath = (path?: string): string | undefined => {
    if (!path) return undefined;

    return canonicalizeSnOrgnummerPath(path.trim())
        .replace(/\.?\[(?:'([^']*)'|"([^"]*)"|([^[\]]+))\]/g, (_match, singleQuoted, doubleQuoted, raw) => {
            const segment = (singleQuoted || doubleQuoted || raw || '').trim();
            const normalizedSegment = segment.replace(/\/9999-12-31$/i, '/..');
            return `[${normalizedSegment}]`;
        })
        .replace(/^\.+|\.+$/g, '');
};

const splitNormalizedPath = (path?: string): string[] => {
    const normalizedPath = normalizePath(path);
    return normalizedPath ? normalizedPath.split('.').filter(Boolean) : [];
};

const parseLegacyFeilPayload = (feilkode: unknown): LegacyFeilPayload | undefined => {
    if (typeof feilkode !== 'string') {
        return undefined;
    }

    // TEMPORARY: k9-format can serialize nested validation errors into `feilkode`
    // as a string like Feil{felt='...', feilkode='...', feilmelding='...'}.
    const match = feilkode
        .trim()
        .match(/^Feil\{felt='([^']*)',\s*feilkode='([^']*)',\s*feilmelding='([\s\S]*)'\}$/);

    if (!match) {
        return undefined;
    }

    const [, felt, parsedFeilkode, feilmelding] = match;
    return {
        felt: felt?.trim(),
        feilkode: parsedFeilkode?.trim(),
        feilmelding: feilmelding?.trim(),
    };
};

const mapLegacyNestedFelt = (felt?: string, legacyPayload?: LegacyFeilPayload): string | undefined => {
    const normalizedFelt = felt?.trim();
    if (!normalizedFelt) {
        return undefined;
    }

    const nestedFelt = legacyPayload?.felt?.trim();
    if (!nestedFelt || !nestedFelt.startsWith('.')) {
        return normalizedFelt;
    }

    // TEMPORARY: remap nested k9-format feil payload for registrert utlandet
    // to a concrete landkode field path so UI can bind the error to the country input.
    if (normalizedFelt.endsWith('.valideringRegistrertUtlandet')) {
        return normalizedFelt.replace(/\.valideringRegistrertUtlandet$/, nestedFelt);
    }

    return normalizedFelt;
};

export const getInputErrorMessage = (error?: IInputError): string | undefined => {
    if (!error) {
        return undefined;
    }

    const directMessage = error.feilmelding?.trim();
    if (directMessage) {
        return directMessage;
    }

    const legacyPayload = parseLegacyFeilPayload(error.feilkode);
    return legacyPayload?.feilmelding || undefined;
};

const getErrorPathForMatching = (error: IInputError): string | undefined => {
    const legacyPayload = parseLegacyFeilPayload(error.feilkode);
    return mapLegacyNestedFelt(error.felt, legacyPayload);
};

const pathMatches = (errorPath: string | undefined, attribute: string, mode: 'exact' | 'prefix' = 'exact'): boolean => {
    const normalizedErrorPath = canonicalizePath(errorPath);
    const normalizedAttribute = canonicalizePath(attribute);

    if (!normalizedErrorPath || !normalizedAttribute) {
        return false;
    }

    if (mode === 'exact') {
        return normalizedErrorPath === normalizedAttribute;
    }

    return (
        normalizedErrorPath === normalizedAttribute ||
        normalizedErrorPath.startsWith(`${normalizedAttribute}.`) ||
        normalizedErrorPath.startsWith(`${normalizedAttribute}[`)
    );
};

const filterMessagesByPath = (
    inputErrors: IInputError[] | undefined,
    attribute: string,
    mode: 'exact' | 'prefix' = 'exact',
): string[] => {
    return (
        inputErrors
            ?.filter((error) => pathMatches(getErrorPathForMatching(error), attribute, mode))
            .map((error) => getInputErrorMessage(error))
            .filter((errorMessage): errorMessage is string => !!errorMessage) ?? []
    );
};

const shouldUseRawMessage = (errorMessage: string): boolean => {
    if (errorMessage.startsWith('skjema.feil.')) {
        return false;
    }

    if (errorMessage === 'must not be null') {
        return false;
    }

    return !/^[A-Za-z0-9_.-]+$/.test(errorMessage);
};

function resolveUnhandledErrorEntries({
    attribute,
    inputErrors,
    feilmeldingStier,
}: GetUnhandledErrorsParams): IInputError[] {
    // TEMPORARY: heuristic deduplication for overlapping backend error paths.
    // Remove after backend publishes canonical, non-overlapping field paths.
    const normalizedAttribute = normalizePath(attribute) || '';
    const normalizedHandledPaths = new Set(
        [...feilmeldingStier]
            .map((path) => normalizePath(path))
            .filter((path): path is string => !!path),
    );

    const unhandledErrors = inputErrors?.filter((m: IInputError) => {
        const matchedPath = getErrorPathForMatching(m) || m.felt;
        const felter = splitNormalizedPath(matchedPath);
        for (let index = felter.length - 1; index >= -1; index--) {
            const felt = felter.slice(0, index + 1).join('.');
            const andreFeilmeldingStier = new Set(normalizedHandledPaths);
            andreFeilmeldingStier.delete(normalizedAttribute);
            if (normalizedAttribute === felt) {
                return true;
            }
            if (andreFeilmeldingStier.has(felt)) {
                return false;
            }
        }
        return false;
    });

    return unhandledErrors || [];
}

/**
 * Returns errors that belong to the current field path and are not already
 * handled by a more specific field mapping.
 *
 * @param params function parameters
 * @param params.attribute current field path in the form
 * @param params.inputErrors validation errors from store
 * @param params.feilmeldingStier field paths already handled elsewhere in the UI
 * @returns list of unhandled errors formatted for display
 */
export const getUnhandledErrors = ({
    attribute,
    inputErrors,
    feilmeldingStier,
}: GetUnhandledErrorsParams): (string | undefined)[] => {
    const unhandledErrors = resolveUnhandledErrorEntries({
        attribute,
        inputErrors,
        feilmeldingStier,
    });

    if (unhandledErrors.length > 0) {
        return unhandledErrors
            .map((error) => getInputErrorMessage(error) || error.felt)
            .filter((errorMessage): errorMessage is string => !!errorMessage);
    }
    return [];
};

/**
 * Returns unhandled input errors for the current field path.
 * Keeps original `felt` and `feilmelding` so callers can add richer UI behavior.
 */
export const getUnhandledErrorEntries = ({
    attribute,
    inputErrors,
    feilmeldingStier,
}: GetUnhandledErrorsParams): IInputError[] => {
    return resolveUnhandledErrorEntries({
        attribute,
        inputErrors,
        feilmeldingStier,
    });
};

/**
 * Resolves a single PSB field error message from validation errors.
 * Handles PSB specific field remapping and localization keys.
 *
 * @param params function parameters
 * @param params.attribute current field path in the form
 * @param params.indeks optional index for period based fields
 * @param params.inputErrors validation errors from store
 * @returns localized error message or undefined
 */
export const getPSBErrorMessage = ({
    attribute,
    indeks,
    inputErrors,
    mottattDato,
    klokkeslett,
    erFremITidKlokkeslett,
    intl,
}: GetPSBErrorMessageParams): string | undefined => {
    const erFremITid = (dato: string) => new Date() < new Date(dato);

    if (attribute === 'klokkeslett' || attribute === 'mottattDato') {
        if (klokkeslett === null || klokkeslett === '' || mottattDato === null || mottattDato === '') {
            return intlHelper(intl, 'skjema.feil.ikketom');
        }
    }

    if (attribute === 'mottattDato' && mottattDato && erFremITid(mottattDato)) {
        return intlHelper(intl, 'skjema.feil.ikkefremitid');
    }

    if (attribute === 'klokkeslett' && klokkeslett && erFremITidKlokkeslett(klokkeslett)) {
        return intlHelper(intl, 'skjema.feil.ikkefremitid');
    }

    if (attribute.includes('endringAvSøknadsperioder.perioder') && indeks !== undefined) {
        const newAttr = `ytelse.trekkKravPerioder[${indeks}]`;
        return filterMessagesByPath(inputErrors, newAttr, 'prefix')[0];
    }

    if (attribute === 'alleTrekkKravPerioderFeilmelding') {
        const newAttr = 'ytelse.trekkKravPerioder.perioder';
        return filterMessagesByPath(inputErrors, newAttr)[0];
    }

    const regex = /\[\d+\]/;
    if (attribute.includes('ytelse.søknadsperiode') && regex.test(attribute) && indeks !== undefined) {
        const newAttr = `ytelse.søknadsperiode[${indeks}]`;
        return filterMessagesByPath(inputErrors, newAttr, 'prefix')[0];
    }

    if (attribute === 'ytelse.uttak.perioder') {
        const newAttr = 'ytelse.søknadsperiode.perioder';
        return filterMessagesByPath(inputErrors, newAttr)[0];
    }

    const snOrgnummerPathMatch = attribute.match(
        /^(ytelse\.opptjeningAktivitet\.selvstendigNæringsdrivende\[\d+])\.organisasjonsnummer\.valid$/,
    );
    let errorMsg: string | undefined;

    // TEMPORARY: backend can return either okOrganisasjonsnummer or organisasjonsnummer(.valid).
    // Keep this remapping until backend/k9-format exposes one canonical path.
    if (snOrgnummerPathMatch) {
        const basePath = snOrgnummerPathMatch[1];
        const candidatePaths = [
            `${basePath}.okOrganisasjonsnummer`,
            `${basePath}.organisasjonsnummer.valid`,
            `${basePath}.organisasjonsnummer.verdi`,
            `${basePath}.organisasjonsnummer`,
        ];
        errorMsg = candidatePaths
            .map((path) => filterMessagesByPath(inputErrors, path, 'prefix')[0])
            .find((message): message is string => !!message);
    }

    if (!errorMsg) {
        errorMsg = filterMessagesByPath(inputErrors, attribute)[indeks || 0];
    }

    if (errorMsg) {
        if (errorMsg.startsWith('Mangler søknadsperiode')) {
            return intlHelper(intl, 'skjema.feil.søknadsperiode/endringsperiode');
        }
        if (attribute === 'nattevåk' || attribute === 'beredskap' || attribute === 'lovbestemtFerie') {
            return errorMsg;
        }
        if (shouldUseRawMessage(errorMsg)) {
            return errorMsg;
        }
    }

    return errorMsg
        ? intlHelper(
              intl,
              `skjema.feil.${attribute}.${errorMsg}`
                  .replace(/\[\d+]/g, '[]')
                  .replace(
                      /^skjema\.feil\..+\.FRA_OG_MED_MAA_VAERE_FOER_TIL_OG_MED$/,
                      'skjema.feil.FRA_OG_MED_MAA_VAERE_FOER_TIL_OG_MED',
                  )
                  .replace(/^skjema\.feil\..+\.fraOgMed\.MAA_SETTES$/, 'skjema.feil.fraOgMed.MAA_SETTES')
                  .replace(
                      /^skjema\.feil\..+\.fraOgMed\.MAA_VAERE_FOER_TIL_OG_MED$/,
                      'skjema.feil.fraOgMed.MAA_VAERE_FOER_TIL_OG_MED',
                  )
                  .replace(/^skjema\.feil\..+\.tilOgMed\.MAA_SETTES$/, 'skjema.feil.tilOgMed.MAA_SETTES')
                  .replace(/^skjema.feil.mottattDato.must not be null$/, 'skjema.feil.datoMottatt.MAA_SETTES'),
          )
        : undefined;
};
