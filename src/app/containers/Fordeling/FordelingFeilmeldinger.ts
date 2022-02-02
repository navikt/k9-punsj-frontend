import { IdentRules } from '../../rules';
import intlHelper from '../../utils/intlUtils';

export const erUgyldigIdent = (ident: string | null) => {
    if (!ident) return true;
    if (!ident.length) return true;
    return !IdentRules.isIdentValid(ident);
};

export const visFeilmeldingForAnnenIdentVidJournalKopi = (
    annenIdent: string | null,
    sokerIdent: string | null,
    barnIdent: string | null,
    intl: any
) => {
    if (annenIdent && erUgyldigIdent(annenIdent)) return intlHelper(intl, 'ident.feil.ugyldigident');
    if (annenIdent && sokerIdent && annenIdent.length > 0 && annenIdent === sokerIdent)
        return intlHelper(intl, 'ident.feil.annenSøkerJournalkopiSoker');
    if (annenIdent && barnIdent && annenIdent.length > 0 && annenIdent === barnIdent)
        return intlHelper(intl, 'ident.feil.annenSøkerJournalkopiBarn');
    return undefined;
};
