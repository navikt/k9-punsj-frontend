import {PunchFormActionKeys} from "app/models/enums";
import {IPunchFormState} from "app/models/types";
import {IPunchFormActionTypes} from "app/state/actions/PunchFormActions";

const initialState: IPunchFormState = {
    soknad: {
        soker: {
            norsk_identitetsnummer: ''
        },
        medlemskap: {
            opphold: []
        }
    }
};

export function PunchFormReducer(
    punchFormState: IPunchFormState = initialState,
    action: IPunchFormActionTypes
): IPunchFormState {

    switch (action.type) {

        case PunchFormActionKeys.SOKNAD_SET:
            return {
                ...punchFormState,
                soknad: action.soknad
            };

        case PunchFormActionKeys.OPPHOLD_SET:
            return {
                ...punchFormState,
                soknad: {
                    ...punchFormState.soknad,
                    medlemskap: {
                        ...punchFormState.soknad.medlemskap,
                        opphold: action.opphold
                    }
                }
            };

        default: return punchFormState;
    }
}