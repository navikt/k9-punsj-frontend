import {IError}      from 'app/models/types/Error';
import {IInputError} from 'app/models/types/InputError';
import {IMappe}      from 'app/models/types/Mappe';

export interface IPunchFormState {
    mappe?: Partial<IMappe>;
    isMappeLoading: boolean;
    error?: IError;
    isAwaitingUpdateResponse?: boolean;
    isAwaitingSubmitResponse?: boolean;
    updateMappeError?: IError;
    submitMappeError?: IError;
    inputErrors1?: IInputError[];
    inputErrors2?: IInputError[];
    isComplete?: boolean;
}