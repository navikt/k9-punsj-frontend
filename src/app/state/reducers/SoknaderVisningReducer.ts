import { SoknaderSokActionKeys } from '../../models/enums/SoknaderSokActionKeys';
import { ISoknaderVisningState } from '../../models/types/SoknaderVisningState';
import { ISoknaderSokActionTypes } from '../actions/SoknaderSokActions';
import { SoknaderVisningStep } from '../../models/enums/SoknaderVisningStep';

export const initialState: ISoknaderVisningState = {
    step: SoknaderVisningStep.IDENT,
    ident: '',
};

export function SoknaderVisningReducer(
    visningState: ISoknaderVisningState = initialState,
    action: ISoknaderSokActionTypes
): ISoknaderVisningState {
    switch (action.type) {
        case SoknaderSokActionKeys.IDENT_SET:
            return {
                ...visningState,
            };

        case SoknaderSokActionKeys.STEP_SET:
            return {
                ...visningState,
                step: action.step,
            };

        default:
            return visningState;
    }
}
