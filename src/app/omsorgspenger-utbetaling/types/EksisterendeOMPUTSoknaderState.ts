import { IError } from 'app/models/types/Error';
import { IOMPUTSoknad } from './OMPUTSoknad';
import { IOMPUTSoknadSvar } from './OMPUTSoknadSvar';

export interface IEksisterendeOMPUTSoknaderState {
    eksisterendeSoknaderSvar: IOMPUTSoknadSvar;
    isEksisterendeSoknaderLoading?: boolean;
    eksisterendeSoknaderRequestError?: IError;
    chosenSoknad?: IOMPUTSoknad;
    isAwaitingSoknadCreation?: boolean;
    createSoknadRequestError?: IError;
    soknadid?: string;
    isSoknadCreated?: boolean;
}
