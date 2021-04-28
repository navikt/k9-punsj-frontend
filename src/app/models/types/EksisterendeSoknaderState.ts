import {IError}  from 'app/models/types/Error';
import {IPSBSoknad} from "./PSBSoknad";

export interface IEksisterendeSoknaderState {
    eksisterendeSoknaderSvar:           IPSBSoknad[];
    isEksisterendeSoknaderLoading?:     boolean;
    eksisterendeSoknaderRequestError?:  IError;
    chosenSoknad?:                      IPSBSoknad;
    isAwaitingSoknadCreation?:          boolean;
    createSoknadRequestError?:          IError;
    soknadid?:                          string;
    isSoknadCreated?:                   boolean;
}
