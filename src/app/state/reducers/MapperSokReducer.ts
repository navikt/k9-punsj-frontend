import {MapperOgFagsakerActionKeys}            from 'app/models/enums';
import {IMapperSokState} from 'app/models/types';
import {IMapperOgFagsakerActionTypes}          from 'app/state/actions';
import {LocationChangeAction, LOCATION_CHANGE} from 'react-router-redux';

const initialState: IMapperSokState = {
    mapper: [],
    isMapperLoading: false,
    mapperRequestError: undefined,
};

export function MapperSokReducer(
    mapperVisningState: IMapperSokState = initialState,
    action: IMapperOgFagsakerActionTypes | LocationChangeAction
): IMapperSokState {
    switch (action.type) {

        case LOCATION_CHANGE:
            return initialState;

        case MapperOgFagsakerActionKeys.MAPPER_SET:
            return {
                ...mapperVisningState,
                mapper: action.mapper,
                isMapperLoading: false,
                mapperRequestError: undefined
            };

        case MapperOgFagsakerActionKeys.MAPPER_LOAD:
            return {
                ...mapperVisningState,
                isMapperLoading: action.isLoading,
                mapperRequestError: undefined,
                isMappeCreated: false
            };

        case MapperOgFagsakerActionKeys.MAPPER_REQUEST_ERROR:
            return {
                ...mapperVisningState,
                isMapperLoading: false,
                mapperRequestError: action.error,
                isMappeCreated: false
            };

        case MapperOgFagsakerActionKeys.MAPPE_OPEN:
            return {
                ...mapperVisningState,
                chosenMappe: action.mappe
            };

        case MapperOgFagsakerActionKeys.MAPPE_CLOSE:
            return {
                ...mapperVisningState,
                chosenMappe: undefined
            };

        case MapperOgFagsakerActionKeys.MAPPE_CHOOSE:
            return {
                ...mapperVisningState,
                chosenMappe: action.mappe
            };

        case MapperOgFagsakerActionKeys.MAPPE_UNDO_CHOICE:
            return {
                ...mapperVisningState,
                chosenMappe: undefined
            };

        case MapperOgFagsakerActionKeys.MAPPE_CREATE_REQUEST:
            return {
                ...mapperVisningState,
                mappeid: undefined,
                isAwaitingMappeCreation: true,
                createMappeRequestError: undefined
            };

        case MapperOgFagsakerActionKeys.MAPPE_CREATE_SUCCESS:
            return {
                ...mapperVisningState,
                mappeid: action.id,
                isMappeCreated: true,
                isAwaitingMappeCreation: false,
                createMappeRequestError: undefined,
                mapper: []
            };

        case MapperOgFagsakerActionKeys.MAPPE_CREATE_ERROR:
            return {
                ...mapperVisningState,
                mappeid: undefined,
                isAwaitingMappeCreation: false,
                createMappeRequestError: action.error,
                isMappeCreated: false
            };

        case MapperOgFagsakerActionKeys.MAPPEID_RESET:
            return {
                ...mapperVisningState,
                mappeid: undefined,
                isMappeCreated: false
            };

        default: return mapperVisningState;
    }
}
