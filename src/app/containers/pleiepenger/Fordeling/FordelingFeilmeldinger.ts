import { idnr } from '@navikt/fnrvalidator';

import intlHelper from '../../../utils/intlUtils';

export const erUgyldigIdent = (ident: string | null): boolean => {
    if (!ident || !ident.length) return true;
    const { status } = idnr(ident);

    return status === 'invalid';
};

export const visFeilmeldingForAnnenIdentVidJournalKopi = (
    annenIdent: string | null,
    sokerIdent: string | null,
    barnIdent: string | null,
    intl: any,
) => {
    if (!annenIdent) {
        return intlHelper(intl, 'ident.feil.annenSøkerJournalkopi.annenSøkerMangler');
    }
    if (!sokerIdent) {
        return intlHelper(intl, 'ident.feil.annenSøkerJournalkopi.søkerMangler');
    }
    if (!barnIdent) {
        return intlHelper(intl, 'ident.feil.annenSøkerJournalkopi.barnMangler');
    }
    if (erUgyldigIdent(annenIdent)) return intlHelper(intl, 'ident.feil.ugyldigident');
    if (annenIdent === sokerIdent) return intlHelper(intl, 'ident.feil.annenSøkerJournalkopiSoker');
    if (annenIdent === barnIdent) return intlHelper(intl, 'ident.feil.annenSøkerJournalkopiBarn');
    return undefined;
};
