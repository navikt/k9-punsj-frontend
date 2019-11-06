import {PunchStep} from "app/models/enums";
import {IError} from "./Error";
import {IMappe} from "./Mappe";

export interface IPunchState {
    step:                   PunchStep;
    ident:                  string;
    mapper:                 IMappe[];
    isMapperLoading?:       boolean;
    mapperRequestError?:    IError;
    chosenMappe?:           IMappe;
}