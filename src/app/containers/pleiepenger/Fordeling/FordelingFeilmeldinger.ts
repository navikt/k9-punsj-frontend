import { IdentRules } from 'app/rules';
import intlHelper from '../../../utils/intlUtils';
import { IntlShape } from 'react-intl';

export const visFeilmeldingForAnnenIdentVidJournalKopi = (
    intl: IntlShape,
    annenIdent: string | null,
    sokerIdent?: string,
    barnIdent?: string,
): string | undefined => {
    if (annenIdent && IdentRules.erUgyldigIdent(annenIdent)) {
        return intlHelper(intl, 'ident.feil.ugyldigident');
    }

    if (annenIdent && annenIdent === sokerIdent) {
        return intlHelper(intl, 'ident.feil.annenSøkerJournalkopiSoker');
    }

    if (annenIdent && annenIdent === barnIdent) {
        return intlHelper(intl, 'ident.feil.annenSøkerJournalkopiBarn');
    }

    return undefined;
};
