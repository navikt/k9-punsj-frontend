import {IError}  from 'app/models/types/Error';
import {ISoknadInfo, ISoknadSvar} from "./SoknadSvar";

export interface ISoknaderSokState {
    soknadSvar:                ISoknadSvar;
    isSoknaderLoading?:         boolean;
    soknaderRequestError?:      IError;
    chosenSoknad?:              ISoknadInfo;
    isAwaitingMappeCreation?:   boolean;
    createMappeRequestError?:   IError;
    soknadid?:                  string;
    isMappeCreated?:            boolean;
}
