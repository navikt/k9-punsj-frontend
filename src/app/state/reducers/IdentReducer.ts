import { IIdentState } from '../../models/types/IdentState';
import { IdentActionKeys, IIdentActions } from '../actions/IdentActions';

export const initialState: IIdentState = {
    ident1: '',
    ident2: '',
    annenPart: '',
    annenSokerIdent: null,
};

export function IdentReducer(identState: IIdentState = initialState, action: IIdentActions): IIdentState {
    switch (action.type) {
        case IdentActionKeys.IDENT_FELLES_SET:
            return {
                ...identState,
                ident1: action.ident1,
                ident2: action.ident2,
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
                ident2: '',
                annenSokerIdent: '',
            };

        default:
            return identState;
    }
}
