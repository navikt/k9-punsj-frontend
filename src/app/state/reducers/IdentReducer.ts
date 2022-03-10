import { IIdentState } from '../../models/types/IdentState';
import { IdentActionKeys, IIdentActions, ISetFlereBarnAction } from '../actions/IdentActions';

export const initialState: IIdentState = {
    ident1: '',
    ident2: '',
    barn: [],
    annenSokerIdent: null,
};

export function IdentReducer(
    identState: IIdentState = initialState,
    action: IIdentActions | ISetFlereBarnAction
): IIdentState {
    switch (action.type) {
        case IdentActionKeys.IDENT_FELLES_SET:
            return {
                ...identState,
                ident1: action.ident1,
                ident2: action.ident2,
                annenSokerIdent: action.annenSokerIdent,
            };
        case IdentActionKeys.IDENT_SET_FLERE_BARN:
            return {
                ...identState,
                ident2: '',
                barn: action.barn,
            };

        default:
            return identState;
    }
}
