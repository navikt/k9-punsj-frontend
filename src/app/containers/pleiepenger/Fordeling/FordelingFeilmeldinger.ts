import { IdentRules } from 'app/rules';
import intlHelper from '../../../utils/intlUtils';
import { IntlShape } from 'react-intl';

export const visFeilmeldingForAnnenIdentVidJournalKopi = (
    intl: IntlShape,
    annenIdent: string | null,
    sokerIdent?: string,
    barnIdent?: string,
) => {
    if (annenIdent && IdentRules.erUgyldigIdent(annenIdent)) return intlHelper(intl, 'ident.feil.ugyldigident');
    if (annenIdent && sokerIdent && annenIdent.length > 0 && annenIdent === sokerIdent)
        return intlHelper(intl, 'ident.feil.annenSøkerJournalkopiSoker');
    if (annenIdent && barnIdent && annenIdent.length > 0 && annenIdent === barnIdent)
        return intlHelper(intl, 'ident.feil.annenSøkerJournalkopiBarn');
    return undefined;
};
