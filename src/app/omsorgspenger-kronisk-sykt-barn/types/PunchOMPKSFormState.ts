import { IError } from 'app/models/types/Error';
import { IInputError } from 'app/models/types/InputError';

import { IOMPKSSoknad } from './OMPKSSoknad';
import { IOMPKSSoknadKvittering } from './OMPKSSoknadKvittering';

export interface IPunchOMPKSFormState {
    soknad?: Partial<IOMPKSSoknad>;
    innsentSoknad?: IOMPKSSoknadKvittering;
    linkTilBehandlingIK9?: string | null;
    validertSoknad?: IOMPKSSoknadKvittering;
    isSoknadLoading: boolean;
    error?: IError;
    isAwaitingUpdateResponse?: boolean;
    isAwaitingSubmitResponse?: boolean;
    isAwaitingValidateResponse?: boolean;
    updateSoknadError?: IError;
    submitSoknadError?: IError;
    validateSoknadError?: IError;
    submitSoknadConflict?: boolean;
    inputErrors?: IInputError[];
    isComplete?: boolean;
    isValid?: boolean;
    awaitingSettPaaVentResponse?: boolean;
    settPaaVentError?: IError;
    settPaaVentSuccess?: boolean;
}
