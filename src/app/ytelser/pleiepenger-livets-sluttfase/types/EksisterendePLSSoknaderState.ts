import { IError } from 'app/models/types/Error';

import { IPLSSoknad } from './PLSSoknad';
import { IPLSSoknadSvar } from './PLSSoknadSvar';

export interface IEksisterendePLSSoknaderState {
    eksisterendeSoknaderSvar: IPLSSoknadSvar;
    isEksisterendeSoknaderLoading?: boolean;
    eksisterendeSoknaderRequestError?: IError;
    chosenSoknad?: IPLSSoknad;
    isAwaitingSoknadCreation?: boolean;
    createSoknadRequestError?: IError;
    soknadid?: string;
    isSoknadCreated?: boolean;
}
