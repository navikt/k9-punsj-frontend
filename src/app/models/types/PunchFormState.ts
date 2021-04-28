import {IError}      from 'app/models/types/Error';
import {IInputError} from 'app/models/types/InputError';
import {IPSBSoknad} from "./PSBSoknad";

export interface IPunchFormState {
    soknad?: Partial<IPSBSoknad>;
    isSoknadLoading: boolean;
    error?: IError;
    isAwaitingUpdateResponse?: boolean;
    isAwaitingSubmitResponse?: boolean;
    updateSoknadError?: IError;
    submitSoknadError?: IError;
    inputErrors1?: IInputError[];
    inputErrors2?: IInputError[];
    isComplete?: boolean;
}
