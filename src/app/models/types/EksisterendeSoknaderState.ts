import { IError } from 'app/models/types/Error';

import { IPSBSoknad } from './PSBSoknad';
import { ISoknadSvar } from './SoknadSvar';

export interface IEksisterendeSoknaderState {
    eksisterendeSoknaderSvar: ISoknadSvar;
    isEksisterendeSoknaderLoading?: boolean;
    eksisterendeSoknaderRequestError?: IError;
    chosenSoknad?: IPSBSoknad;
    isAwaitingSoknadCreation?: boolean;
    createSoknadRequestError?: IError;
    soknadid?: string;
    isSoknadCreated?: boolean;
}
