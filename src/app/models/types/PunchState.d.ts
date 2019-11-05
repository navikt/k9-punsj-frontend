import {PunchStep} from "../enums/PunchStep";
import {IMappe} from "./Mappe";
import {IError} from "./Error";

export interface IPunchState {
    step:                   PunchStep;
    ident:                  string;
    mapper:                 IMappe[];
    isMapperLoading?:       boolean;
    mapperRequestError?:    IError;
    chosenMappe?:           IMappe;
}