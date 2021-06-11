import {IError}      from 'app/models/types/Error';
import {IInputError} from 'app/models/types/InputError';
import {IPSBSoknad} from "./PSBSoknad";
import {IPeriodeV2} from "./PeriodeV2";
import {IPSBSoknadKvittering} from "./PSBSoknadKvittering";

export interface IPunchFormState {
    soknad?: Partial<IPSBSoknad>;
    innsentSoknad?: IPSBSoknadKvittering;
    perioder?: IPeriodeV2[],
    isPerioderLoading?: boolean,
    hentPerioderError?: IError,
    isSoknadLoading: boolean;
    error?: IError;
    isAwaitingUpdateResponse?: boolean;
    isAwaitingSubmitResponse?: boolean;
    isAwaitingValidateResponse?: boolean;
    updateSoknadError?: IError;
    submitSoknadError?: IError;
    validateSoknadError?: IError;
    inputErrors?: IInputError[];
    isComplete?: boolean;
    isValid?: boolean;
    awaitingSettPaaVentResponse?: boolean;
    settPaaVentError?: IError;
    settPaaVentSuccess?: boolean;
}
