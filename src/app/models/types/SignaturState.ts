import { IError } from 'app/models/types/Error';

import { JaNeiIkkeRelevant } from '../enums/JaNeiIkkeRelevant';

export interface ISignaturState {
    signert: JaNeiIkkeRelevant | null;
    isAwaitingUsignertRequestResponse: boolean;
    usignertRequestSuccess?: boolean;
    usignertRequestError?: IError;
}
