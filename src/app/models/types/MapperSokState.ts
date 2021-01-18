import {IError}  from 'app/models/types/Error';
import {IMappe}  from 'app/models/types/Mappe';

export interface IMapperSokState {
    mapper:                     IMappe[];
    isMapperLoading?:           boolean;
    mapperRequestError?:        IError;
    chosenMappe?:               IMappe;
    isAwaitingMappeCreation?:   boolean;
    createMappeRequestError?:   IError;
    mappeid?:                   string;
    isMappeCreated?:            boolean;
}
