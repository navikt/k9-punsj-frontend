import {IError}  from 'app/models/types/Error';
import {ISoknadV2} from "./Soknadv2";

export interface IEksisterendeSoknaderState {
    eksisterendeSoknaderSvar:           ISoknadV2[];
    isEksisterendeSoknaderLoading?:     boolean;
    eksisterendeSoknaderRequestError?:  IError;
    chosenSoknad?:                      ISoknadV2;
    isAwaitingSoknadCreation?:          boolean;
    createSoknadRequestError?:          IError;
    soknadid?:                          string;
    isSoknadCreated?:                   boolean;
}
