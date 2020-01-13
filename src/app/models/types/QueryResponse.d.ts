import {IInputError} from 'app/models/types/InputError';

export interface IQueryResponse {
    mangler?: IInputError[];
    [key: string]: any;
}