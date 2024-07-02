import { IError } from 'app/models/types/Error';
import { IInputError } from 'app/models/types/InputError';

import { IOMPMASoknad } from './OMPMASoknad';
import { IOMPMASoknadKvittering } from './OMPMASoknadKvittering';

export interface IPunchOMPMAFormState {
    soknad?: Partial<IOMPMASoknad>;
    innsentSoknad?: IOMPMASoknadKvittering;
    linkTilBehandlingIK9?: string | null;
    validertSoknad?: IOMPMASoknadKvittering;
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
