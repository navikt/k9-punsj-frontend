import {IError}      from 'app/models/types/Error';
import {IInputError} from 'app/models/types/InputError';
import {ISoknadV2} from "./Soknadv2";

export interface IPunchFormState {
    soknad?: Partial<ISoknadV2>;
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
