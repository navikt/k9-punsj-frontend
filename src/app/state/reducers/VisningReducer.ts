import {LocationChangeAction, LOCATION_CHANGE} from 'react-router-redux';
import {MappeSokActionKeys} from "../../models/enums/MappeSokActionKeys";
import {IMapperVisningState} from "../../models/types/MapperVisningState";
import {MapperVisningStep} from "../../models/enums/MapperVisningStep";
import {IMappeSokActionTypes} from "../actions/MapperSokActions";

export const initialState: IMapperVisningState = {
    step: MapperVisningStep.IDENT,
    ident: ''
};

export function VisningReducer(
    visningState: IMapperVisningState = initialState,
    action: IMappeSokActionTypes | LocationChangeAction
): IMapperVisningState {
    switch (action.type) {
        case LOCATION_CHANGE:

        case MappeSokActionKeys.IDENT_SET:
            return {
                ...visningState,
            };

        case MappeSokActionKeys.STEP_SET:
            return {
                ...visningState,
                step: action.step
            };

        default:
            return visningState;
    }
}
