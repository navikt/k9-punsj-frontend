import {IIdentState} from "../../models/types/IdentState";
import {IdentActionKeys, IIdentActions} from "../actions/IdentActions";

export const initialState: IIdentState = {
    ident1: '',
    ident2: null,
    annenSokerIdent: null
};

export function IdentReducer(
    identState: IIdentState = initialState,
    action: IIdentActions
): IIdentState {
    switch (action.type) {

        case IdentActionKeys.IDENT_FELLES_SET:
            return {
                ...identState,
                ident1: action.ident1,
                ident2: action.ident2,
                annenSokerIdent: action.annenSokerIdent
            };

        default:
            return identState;
    }
}
