import {PunchActionKeys, PunchStep} from "app/models/enums";
import {IPunchState} from "app/models/types";
import {IPunchActionTypes} from "../actions";

const initialState: IPunchState = {
    step: PunchStep.START,
    ident: "",
    mapper: [],
    isMapperLoading: false,
    mapperRequestError: undefined
};

export function PunchReducer(
    punchState: IPunchState = initialState,
    action: IPunchActionTypes
): IPunchState {
    switch (action.type) {

        case PunchActionKeys.IDENT_SET:
            return {
                ...punchState,
                ident: action.ident
            };

        case PunchActionKeys.MAPPER_SET:
            return {
                ...punchState,
                step: PunchStep.CHOOSE_SOKNAD,
                mapper: action.mapper,
                isMapperLoading: false,
                mapperRequestError: undefined
            };

        case PunchActionKeys.MAPPER_LOAD:
            return {
                ...punchState,
                step: PunchStep.CHOOSE_SOKNAD,
                isMapperLoading: action.isLoading,
                mapperRequestError: undefined
            };

        case PunchActionKeys.MAPPER_REQUEST_ERROR:
            return {
                ...punchState,
                step: PunchStep.START,
                isMapperLoading: false,
                mapperRequestError: action.error
            };

        case PunchActionKeys.MAPPER_UNDO_SEARCH:
            return {
                ...punchState,
                step: PunchStep.START,
                mapper: [],
                isMapperLoading: false,
                mapperRequestError: undefined
            };

        case PunchActionKeys.MAPPE_OPEN:
            return {
                ...punchState,
                chosenMappe: action.mappe
            };

        case PunchActionKeys.MAPPE_CLOSE:
            return {
                ...punchState,
                chosenMappe: undefined
            };

        case PunchActionKeys.MAPPE_CHOOSE:
            return {
                ...punchState,
                step: PunchStep.FILL_FORM,
                chosenMappe: action.mappe
            };

        case PunchActionKeys.MAPPE_NEW:
            return {
                ...punchState,
                step: PunchStep.FILL_FORM,
                chosenMappe: undefined
            };

        case PunchActionKeys.MAPPE_UNDO_CHOICE:
            return {
                ...punchState,
                step: PunchStep.CHOOSE_SOKNAD,
                chosenMappe: undefined
            };

        default: return punchState;
    }
}