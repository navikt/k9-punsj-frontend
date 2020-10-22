import {MapperOgFagsakerActionKeys}            from 'app/models/enums';
import {IMapperOgFagsakerState}                from 'app/models/types';
import {IMapperOgFagsakerActionTypes}          from 'app/state/actions';
import {LocationChangeAction, LOCATION_CHANGE} from 'react-router-redux';

const initialState: IMapperOgFagsakerState = {
    mapper: [],
    fagsaker: [],
    isMapperLoading: false,
    isFagsakerLoading: false,
    mapperRequestError: undefined,
    fagsakerRequestError: undefined
};

export function MapperOgFagsakerReducer(
    mapperOgFagsakerState: IMapperOgFagsakerState = initialState,
    action: IMapperOgFagsakerActionTypes | LocationChangeAction
): IMapperOgFagsakerState {
    switch (action.type) {

        case LOCATION_CHANGE:
            return initialState;

        case MapperOgFagsakerActionKeys.MAPPER_SET:
            return {
                ...mapperOgFagsakerState,
                mapper: action.mapper,
                isMapperLoading: false,
                mapperRequestError: undefined
            };

        case MapperOgFagsakerActionKeys.MAPPER_LOAD:
            return {
                ...mapperOgFagsakerState,
                isMapperLoading: action.isLoading,
                mapperRequestError: undefined,
                isMappeCreated: false
            };

        case MapperOgFagsakerActionKeys.MAPPER_REQUEST_ERROR:
            return {
                ...mapperOgFagsakerState,
                isMapperLoading: false,
                mapperRequestError: action.error,
                isMappeCreated: false
            };

        case MapperOgFagsakerActionKeys.FAGSAKER_SET:
            return {
                ...mapperOgFagsakerState,
                fagsaker: action.fagsaker,
                isFagsakerLoading: false,
                fagsakerRequestError: undefined
            };

        case MapperOgFagsakerActionKeys.FAGSAKER_LOAD:
            return {
                ...mapperOgFagsakerState,
                fagsaker: [],
                isFagsakerLoading: action.isLoading,
                fagsakerRequestError: undefined
            };

        case MapperOgFagsakerActionKeys.FAGSAKER_REQUEST_ERROR:
            return {
                ...mapperOgFagsakerState,
                fagsaker: [],
                isFagsakerLoading: false,
                fagsakerRequestError: action.error
            };

        case MapperOgFagsakerActionKeys.MAPPE_OPEN:
            return {
                ...mapperOgFagsakerState,
                chosenMappe: action.mappe,
                chosenFagsak: undefined
            };

        case MapperOgFagsakerActionKeys.MAPPE_CLOSE:
            return {
                ...mapperOgFagsakerState,
                chosenMappe: undefined
            };

        case MapperOgFagsakerActionKeys.MAPPE_CHOOSE:
            return {
                ...mapperOgFagsakerState,
                chosenMappe: action.mappe
            };

        case MapperOgFagsakerActionKeys.MAPPE_UNDO_CHOICE:
            return {
                ...mapperOgFagsakerState,
                chosenMappe: undefined,
                chosenFagsak: undefined
            };

        case MapperOgFagsakerActionKeys.FAGSAK_OPEN:
            return {
                ...mapperOgFagsakerState,
                chosenFagsak: action.fagsak,
                chosenMappe: undefined
            };

        case MapperOgFagsakerActionKeys.FAGSAK_CLOSE:
            return {
                ...mapperOgFagsakerState,
                chosenFagsak: undefined
            };

        case MapperOgFagsakerActionKeys.MAPPE_CREATE_REQUEST:
            return {
                ...mapperOgFagsakerState,
                mappeid: undefined,
                isAwaitingMappeCreation: true,
                createMappeRequestError: undefined
            };

        case MapperOgFagsakerActionKeys.MAPPE_CREATE_SUCCESS:
            return {
                ...mapperOgFagsakerState,
                mappeid: action.id,
                isMappeCreated: true,
                isAwaitingMappeCreation: false,
                createMappeRequestError: undefined,
                mapper: [],
                fagsaker: []
            };

        case MapperOgFagsakerActionKeys.MAPPE_CREATE_ERROR:
            return {
                ...mapperOgFagsakerState,
                mappeid: undefined,
                isAwaitingMappeCreation: false,
                createMappeRequestError: action.error,
                isMappeCreated: false
            };

        case MapperOgFagsakerActionKeys.MAPPEID_RESET:
            return {
                ...mapperOgFagsakerState,
                mappeid: undefined,
                isMappeCreated: false
            };

        default: return mapperOgFagsakerState;
    }
}
