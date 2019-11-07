import {PunchStep} from "app/models/enums";
import {IFagsak} from "app/models/types";
import {IError} from "./Error";
import {IMappe} from "./Mappe";

export interface IPunchState {
    step:                   PunchStep;
    ident:                  string;
    mapper:                 IMappe[];
    fagsaker:               IFagsak[];
    isMapperLoading?:       boolean;
    isFagsakerLoading?:     boolean;
    mapperRequestError?:    IError;
    fagsakerRequestError?:  IError;
    chosenMappe?:           IMappe;
    chosenFagsak?:          IFagsak;
}