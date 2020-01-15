import {IFagsak} from 'app/models/types';
import {IError}  from './Error';
import {IMappe}  from './Mappe';

export interface IMapperOgFagsakerState {
    mapper:                     IMappe[];
    fagsaker:                   IFagsak[];
    isMapperLoading?:           boolean;
    isFagsakerLoading?:         boolean;
    mapperRequestError?:        IError;
    fagsakerRequestError?:      IError;
    chosenMappe?:               IMappe;
    chosenFagsak?:              IFagsak;
    isAwaitingMappeCreation?:   boolean;
    createMappeRequestError?:   IError;
    mappeid?:                   string;
    isMappeCreated?:            boolean;
}