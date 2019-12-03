import {IError}      from 'app/models/types/Error';
import {IInputError} from 'app/models/types/InputError';

export interface IPunchFormState {
    mappe?: Partial<IMappe>;
    isMappeLoading: boolean;
    error?: IError;
    isAwaitingUpdateResponse?: boolean;
    isAwaitingSubmitResponse?: boolean;
    updateMappeError?: IError;
    submitMappeError?: IError;
    inputErrors?: IInputError[];
    isComplete?: boolean;
}