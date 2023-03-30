import { IError } from 'app/models/types/Error';

import { IOMPKSSoknad } from './OMPKSSoknad';
import { IOMPKSSoknadSvar } from './OMPKSSoknadSvar';

export interface IEksisterendeOMPKSSoknaderState {
    eksisterendeSoknaderSvar: IOMPKSSoknadSvar;
    isEksisterendeSoknaderLoading?: boolean;
    eksisterendeSoknaderRequestError?: IError;
    chosenSoknad?: IOMPKSSoknad;
    isAwaitingSoknadCreation?: boolean;
    createSoknadRequestError?: IError;
    soknadid?: string;
    isSoknadCreated?: boolean;
}
