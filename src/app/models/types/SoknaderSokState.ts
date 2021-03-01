import {IError}  from 'app/models/types/Error';
import {ISoknadInfo, ISoknadSvar} from "./SoknadSvar";

export interface ISoknaderSokState {
    soknadSvar:                ISoknadSvar;
    isSoknaderLoading?:         boolean;
    soknaderRequestError?:      IError;
    soknadid?:                  string;
    chosenSoknad?:              ISoknadInfo;
}
