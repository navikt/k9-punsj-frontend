import {IError}      from 'app/models/types/Error';
import {IInputError} from 'app/models/types/InputError';
import {IMappe}      from 'app/models/types/Mappe';
import {ISoknadV2} from "./Soknadv2";
import {ISoknadInfo} from "./SoknadSvar";

export interface IPunchFormState {
    soknadInfo?: Partial<ISoknadInfo>;
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
