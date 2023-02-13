import { IIdentState } from '../../models/types/IdentState';
import { IdentActionKeys, IIdentActions } from '../actions/IdentActions';

export const initialState: IIdentState = {
    søkerId: '',
    pleietrengendeId: '',
    annenPart: '',
    annenSokerIdent: null,
};

export function IdentReducer(identState: IIdentState = initialState, action: IIdentActions): IIdentState {
    switch (action.type) {
        case IdentActionKeys.IDENT_FELLES_SET:
            return {
                ...identState,
                søkerId: action.søkerId,
                pleietrengendeId: action.pleietrengendeId,
                annenSokerIdent: action.annenSokerIdent,
            };

        case IdentActionKeys.IDENT_SET_ANNEN_PART:
            return {
                ...identState,
                annenPart: action.annenPart,
            };

        case IdentActionKeys.IDENT_RESET:
            return {
                ...identState,
                pleietrengendeId: '',
                annenSokerIdent: '',
            };

        default:
            return identState;
    }
}
