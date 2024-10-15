import { IError } from 'app/models/types/Error';
import { IInputError } from 'app/models/types/InputError';

import { IPeriode } from '../../../models/types';
import { IPLSSoknad } from './PLSSoknad';
import { IPLSSoknadKvittering } from './PLSSoknadKvittering';

export interface IPunchPLSFormState {
    soknad?: Partial<IPLSSoknad>;
    innsentSoknad?: IPLSSoknadKvittering;
    linkTilBehandlingIK9?: string | null;
    validertSoknad?: IPLSSoknadKvittering;
    perioder?: IPeriode[];
    isPerioderLoading?: boolean;
    hentPerioderError?: IError;
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
