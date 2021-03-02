import {IError}  from 'app/models/types/Error';
import {ISoknadInfo, ISoknadSvar} from "./SoknadSvar";

export interface IEksisterendeSoknaderState {
    eksisterendeSoknaderSvar:           ISoknadSvar;
    isEksisterendeSoknaderLoading?:     boolean;
    eksisterendeSoknaderRequestError?:  IError;
    chosenSoknad?:                      ISoknadInfo;
    isAwaitingSoknadCreation?:          boolean;
    createSoknadRequestError?:          IError;
    soknadid?:                          string;
    isSoknadCreated?:                   boolean;
}
