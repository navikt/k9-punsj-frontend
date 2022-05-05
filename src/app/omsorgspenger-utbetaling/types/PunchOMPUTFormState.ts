import { IError } from 'app/models/types/Error';
import { IInputError } from 'app/models/types/InputError';
import {IOMPUTSoknad} from './OMPUTSoknad';
import {IOMPUTSoknadKvittering} from './OMPUTSoknadKvittering';

export interface IPunchOMPUTFormState {
    soknad?: Partial<IOMPUTSoknad>;
    innsentSoknad?: IOMPUTSoknadKvittering;
    linkTilBehandlingIK9?: string | null;
    validertSoknad?: IOMPUTSoknadKvittering;
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
