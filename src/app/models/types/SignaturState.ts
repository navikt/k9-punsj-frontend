import {JaNei}  from 'app/models/enums';
import {IError} from 'app/models/types/Error';

export interface ISignaturState {
    signert: JaNei | null;
    isAwaitingUsignertRequestResponse: boolean;
    usignertRequestSuccess?: boolean;
    usignertRequestError?: IError;
}