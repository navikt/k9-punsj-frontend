import {IError}  from 'app/models/types/Error';
import {ISoknadV2} from "./Soknadv2";

export interface ISoknaderSokState {
    soknadSvar:                ISoknadV2[];
    isSoknaderLoading?:         boolean;
    isForbidden:                boolean;
    soknaderRequestError?:      IError;
    soknadid?:                  string;
    chosenSoknad?:              ISoknadV2;
}
