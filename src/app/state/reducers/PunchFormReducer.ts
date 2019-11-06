import {JaNeiVetikke, PunchFormActionKeys} from "app/models/enums";
import {IPunchFormState} from "app/models/types";
import {IPunchFormActionTypes} from "app/state/actions/PunchFormActions";

const initialState: IPunchFormState = {
    tilsyn: JaNeiVetikke.VET_IKKE
};

export function PunchFormReducer(
    punchFormState: IPunchFormState = initialState,
    action: IPunchFormActionTypes
): IPunchFormState {

    switch (action.type) {

        case PunchFormActionKeys.TILSYN_SET: return {
            ...punchFormState,
            tilsyn: action.tilsyn
        };

        default: return punchFormState;
    }
}