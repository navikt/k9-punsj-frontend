import { IError } from 'app/models/types/Error';

import { IPSBSoknad } from './PSBSoknad';

export interface ISoknaderSokState {
    soknadSvar: IPSBSoknad[];
    isSoknaderLoading?: boolean;
    soknaderRequestError?: IError;
    soknadid?: string;
    chosenSoknad?: IPSBSoknad;
}
