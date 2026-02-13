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
    const unhandledErrors = inputErrors?.filter((m: IInputError) => {
        const felter = m.felt?.split('.') || [];
        for (let index = felter.length - 1; index >= -1; index--) {
            const felt = felter.slice(0, index + 1).join('.');
            const andreFeilmeldingStier = new Set(feilmeldingStier);
            andreFeilmeldingStier.delete(attribute);
            if (attribute === felt) {
                return true;
            }
            if (andreFeilmeldingStier.has(felt)) {
                return false;
            }
        }
        return false;
    });

    if (unhandledErrors && unhandledErrors.length > 0) {
        return unhandledErrors.map((error) => `${error.felt}: ${error.feilmelding}`).filter(Boolean);
    }
    return [];
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
        return inputErrors?.filter((m: IInputError) => m.felt?.includes(newAttr))?.[0]?.feilmelding;
    }

    if (attribute === 'alleTrekkKravPerioderFeilmelding') {
        const newAttr = 'ytelse.trekkKravPerioder.perioder';
        return inputErrors?.filter((m: IInputError) => m.felt === newAttr)?.[0]?.feilmelding;
    }

    const regex = /\[\d+\]/;
    if (attribute.includes('ytelse.søknadsperiode') && regex.test(attribute) && indeks !== undefined) {
        const newAttr = `ytelse.søknadsperiode[${indeks}]`;
        return inputErrors?.filter((m: IInputError) => m.felt?.includes(newAttr))?.[0]?.feilmelding;
    }

    if (attribute === 'ytelse.uttak.perioder') {
        const newAttr = 'ytelse.søknadsperiode.perioder';
        return inputErrors?.filter((m: IInputError) => m.felt === newAttr)?.[0]?.feilmelding;
    }

    const errorMsg = inputErrors?.filter((m: IInputError) => m.felt === attribute)?.[indeks || 0]?.feilmelding;

    if (errorMsg) {
        if (errorMsg.startsWith('Mangler søknadsperiode')) {
            return intlHelper(intl, 'skjema.feil.søknadsperiode/endringsperiode');
        }
        if (attribute === 'nattevåk' || attribute === 'beredskap' || attribute === 'lovbestemtFerie') {
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
