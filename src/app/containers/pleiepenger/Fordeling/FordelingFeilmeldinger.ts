import { erUgyldigIdent } from 'app/rules/valideringer';
import intlHelper from '../../../utils/intlUtils';

// eslint-disable-next-line import/prefer-default-export
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
