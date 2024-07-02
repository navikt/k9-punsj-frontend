import { IError } from 'app/models/types/Error';

import { IOMPMASoknad } from './OMPMASoknad';
import { IOMPMASoknadSvar } from './OMPMASoknadSvar';

export interface IEksisterendeOMPMASoknaderState {
    eksisterendeSoknaderSvar: IOMPMASoknadSvar;
    isEksisterendeSoknaderLoading?: boolean;
    eksisterendeSoknaderRequestError?: IError;
    chosenSoknad?: IOMPMASoknad;
    isAwaitingSoknadCreation?: boolean;
    createSoknadRequestError?: IError;
    soknadid?: string;
    isSoknadCreated?: boolean;
}
