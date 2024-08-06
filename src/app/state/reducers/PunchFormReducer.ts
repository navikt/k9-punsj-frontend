import { PunchFormActionKeys } from 'app/models/enums';
import { IPunchPSBFormState } from 'app/models/types';
import { IPunchFormActionTypes } from 'app/state/actions/PSBPunchFormActions';

const initialState: IPunchPSBFormState = {
    isSoknadLoading: false,
    isComplete: false,
    isValid: false,
    awaitingSettPaaVentResponse: false,
    settPaaVentError: undefined,
    settPaaVentSuccess: undefined,
    inputErrors: undefined,
};

 import/prefer-default-export
export function PunchFormReducer(
    punchFormState: IPunchPSBFormState = initialState,
    action: IPunchFormActionTypes,
): IPunchPSBFormState {
    switch (action.type) {
        case PunchFormActionKeys.RESET:
            return initialState;

        case PunchFormActionKeys.SOKNAD_LOAD:
            return {
                ...punchFormState,
                isSoknadLoading: true,
            };

        case PunchFormActionKeys.SOKNAD_REQUEST_ERROR:
            return {
                ...punchFormState,
                isSoknadLoading: false,
                error: action.error,
            };

        case PunchFormActionKeys.SOKNAD_SET:
            return {
                ...punchFormState,
                isSoknadLoading: false,
                soknad: action.soknad,
            };

        case PunchFormActionKeys.SOKNAD_RESET:
            return {
                ...punchFormState,
                isSoknadLoading: false,
                soknad: undefined,
            };

        case PunchFormActionKeys.SOKNAD_UPDATE_REQUEST:
            return {
                ...punchFormState,
                isAwaitingUpdateResponse: true,
                updateSoknadError: undefined,
            };

        case PunchFormActionKeys.SOKNAD_UPDATE_SUCCESS:
            return {
                ...punchFormState,
                isAwaitingUpdateResponse: false,
                updateSoknadError: undefined,
            };

        case PunchFormActionKeys.SOKNAD_UPDATE_ERROR:
            return {
                ...punchFormState,
                isAwaitingUpdateResponse: false,
                updateSoknadError: action.error,
            };

        case PunchFormActionKeys.SOKNAD_SUBMIT_REQUEST:
            return {
                ...punchFormState,
                isAwaitingSubmitResponse: true,
                submitSoknadError: undefined,
            };

        case PunchFormActionKeys.SOKNAD_SUBMIT_SUCCESS:
            return {
                ...punchFormState,
                innsentSoknad: action.innsentSoknad,
                isAwaitingSubmitResponse: false,
                submitSoknadError: undefined,
                inputErrors: undefined,
                isComplete: true,
                linkTilBehandlingIK9: action.linkTilBehandlingIK9,
            };

        case PunchFormActionKeys.SOKNAD_SUBMIT_UNCOMPLETE:
            return {
                ...punchFormState,
                isAwaitingSubmitResponse: false,
                submitSoknadError: undefined,
                inputErrors: action.errors,
            };

        case PunchFormActionKeys.SOKNAD_SUBMIT_ERROR:
            return {
                ...punchFormState,
                isAwaitingSubmitResponse: false,
                submitSoknadError: action.error,
            };

        case PunchFormActionKeys.SOKNAD_SUBMIT_CONFLICT:
            return {
                ...punchFormState,
                isAwaitingSubmitResponse: false,
                submitSoknadConflict: action.error,
            };

        case PunchFormActionKeys.HENT_PERIODER_REQUEST:
            return {
                ...punchFormState,
                isPerioderLoading: true,
                hentPerioderError: undefined,
            };

        case PunchFormActionKeys.HENT_PERIODER_ERROR:
            return {
                ...punchFormState,
                isPerioderLoading: false,
                hentPerioderError: action.error,
            };

        case PunchFormActionKeys.HENT_PERIODER_SUCCESS:
            return {
                ...punchFormState,
                isPerioderLoading: false,
                hentPerioderError: undefined,
                perioder: action.perioder,
            };

        case PunchFormActionKeys.JOURNALPOST_SETT_PAA_VENT:
            return {
                ...punchFormState,
                awaitingSettPaaVentResponse: true,
            };

        case PunchFormActionKeys.JOURNALPOST_JOURNALPOST_SETT_PAA_VENT_ERROR:
            return {
                ...punchFormState,
                awaitingSettPaaVentResponse: false,
                settPaaVentSuccess: false,
                settPaaVentError: action.error,
            };

        case PunchFormActionKeys.JOURNALPOST_JOURNALPOST_SETT_PAA_VENT_SUCCESS:
            return {
                ...punchFormState,
                awaitingSettPaaVentResponse: false,
                settPaaVentSuccess: true,
                settPaaVentError: undefined,
            };

        case PunchFormActionKeys.JOURNALPOST_JOURNALPOST_SETT_PAA_VENT_RESET:
            return {
                ...punchFormState,
                awaitingSettPaaVentResponse: false,
                settPaaVentSuccess: false,
                settPaaVentError: undefined,
            };
        case PunchFormActionKeys.SOKNAD_VALIDER_REQUEST:
            return {
                ...punchFormState,
                isAwaitingValidateResponse: true,
                validateSoknadError: undefined,
            };

        case PunchFormActionKeys.SOKNAD_VALIDER_SUCCESS: {
            const { erMellomlagring } = action;
            return {
                ...punchFormState,
                validertSoknad: action.validertSoknad,
                isAwaitingValidateResponse: false,
                validateSoknadError: undefined,
                inputErrors: undefined,
                isValid: !erMellomlagring,
            };
        }

        case PunchFormActionKeys.SOKNAD_VALIDER_UNCOMPLETE:
            return {
                ...punchFormState,
                isAwaitingValidateResponse: false,
                validateSoknadError: undefined,
                inputErrors: action.errors,
                isValid: false,
            };

        case PunchFormActionKeys.SOKNAD_VALIDER_ERROR:
            return {
                ...punchFormState,
                isAwaitingValidateResponse: false,
                validateSoknadError: action.error,
            };

        case PunchFormActionKeys.SOKNAD_VALIDER_RESET:
            return {
                ...punchFormState,
                isAwaitingValidateResponse: false,
                validateSoknadError: undefined,
                isValid: undefined,
            };

        default:
            return punchFormState;
    }
}
