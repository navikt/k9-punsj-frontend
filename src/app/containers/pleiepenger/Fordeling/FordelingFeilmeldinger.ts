import { IdentRules } from 'app/rules';
import intlHelper from '../../../utils/intlUtils';
import { IntlShape } from 'react-intl';
import { IIdentState } from 'app/models/types/IdentState';

export const visFeilmeldingForAnnenIdentVidJournalKopi = (
    intl: IntlShape,
    identState: IIdentState,
): string | undefined => {
    const { søkerId, pleietrengendeId, annenSokerIdent, annenPart } = identState;
    if (annenSokerIdent && IdentRules.erUgyldigIdent(annenSokerIdent)) {
        return intlHelper(intl, 'ident.feil.ugyldigident');
    }

    if (annenSokerIdent && annenSokerIdent === søkerId) {
        return intlHelper(intl, 'ident.feil.annenSøkerJournalkopiSoker');
    }

    if (annenSokerIdent && annenSokerIdent === pleietrengendeId) {
        return intlHelper(intl, 'ident.feil.annenSøkerJournalkopiBarn');
    }
    if (annenSokerIdent && annenSokerIdent === annenPart) {
        return intlHelper(intl, 'ident.feil.annenSøkerJournalkopiAnnenPart');
    }

    return undefined;
};
