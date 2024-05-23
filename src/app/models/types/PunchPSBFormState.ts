import { IError } from 'app/models/types/Error';
import { IInputError } from 'app/models/types/InputError';

import { IPSBSoknad } from './PSBSoknad';
import { IPSBSoknadKvittering } from './PSBSoknadKvittering';
import { IPeriode } from './Periode';

export interface IPunchPSBFormState {
    soknad?: Partial<IPSBSoknad>;
    innsentSoknad?: IPSBSoknadKvittering;
    linkTilBehandlingIK9?: string | null;
    validertSoknad?: IPSBSoknadKvittering;
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
