import { PunchActionKeys, PunchStep } from 'app/models/enums';
import { IPunchState } from 'app/models/types';
import { IPunchActionTypes } from 'app/state/actions';

export const initialState: IPunchState = {
    step: PunchStep.CHOOSE_SOKNAD,
    ident1: '',
    ident2: null,
};

export function PunchPLSReducer(punchState: IPunchState, action: IPunchActionTypes): IPunchState {
    if (typeof punchState === 'undefined') return initialState;
    switch (action.type) {
        case PunchActionKeys.RESET:
            return initialState;

        case PunchActionKeys.IDENT_SET:
            return {
                ...punchState,
                ident1: action.ident1,
                ident2: action.ident2,
            };

        case PunchActionKeys.STEP_SET:
            return {
                ...punchState,
                step: action.step,
            };

        case PunchActionKeys.BACK_FROM_FORM:
            return {
                ...punchState,
                step: PunchStep.CHOOSE_SOKNAD,
            };

        default:
            return punchState;
    }
}
