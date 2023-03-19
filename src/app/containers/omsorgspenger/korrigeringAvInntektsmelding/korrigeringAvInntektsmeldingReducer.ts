import { KorrigeringAvInntektsmeldingFormValues } from './KorrigeringAvInntektsmeldingFormFieldsValues';
import ActionType from './korrigeringAvInntektsmeldingActions';

interface Paneler {
    trekkperioderPanel: boolean;
    leggTilHelePerioderPanel: boolean;
    leggTilDelvisFravær: boolean;
}

interface State {
    åpnePaneler: Paneler;
    isLoading?: boolean;
    visBekreftelsemodal?: boolean;
    visErDuSikkerModal?: boolean;
    korrigeringErInnsendt?: boolean;
    innsendteFormverdier?: KorrigeringAvInntektsmeldingFormValues;
    formError?: string;
    hasSubmitted?: boolean;
}
interface Action {
    type: ActionType;
    åpnePaneler?: Paneler;
    isLoading?: boolean;
    innsendteFormverdier?: KorrigeringAvInntektsmeldingFormValues;
    formError?: string;
}

const korrigeringAvInntektsmeldingReducer = (state: State, action: Action): State => {
    switch (action.type) {
        case ActionType.SET_ÅPNE_PANELER: {
            return { ...state, åpnePaneler: action.åpnePaneler || state.åpnePaneler };
        }
        case ActionType.VALIDER_KORRIGERING_START: {
            return { ...state, isLoading: true, hasSubmitted: true };
        }
        case ActionType.VALIDER_KORRIGERING_SUCCESS: {
            return { ...state, isLoading: false };
        }
        case ActionType.VALIDER_KORRIGERING_ERROR: {
            return { ...state, isLoading: false };
        }
        case ActionType.VIS_BEKREFTELSEMODAL: {
            return { ...state, visBekreftelsemodal: true };
        }
        case ActionType.SKJUL_BEKREFTELSEMODAL: {
            return { ...state, visBekreftelsemodal: false };
        }
        case ActionType.VIS_ER_DU_SIKKER_MODAL: {
            return { ...state, visErDuSikkerModal: true, visBekreftelsemodal: false };
        }
        case ActionType.SKJUL_ER_DU_SIKKER_MODAL: {
            return { ...state, visErDuSikkerModal: false };
        }
        case ActionType.SET_KORRIGERING_INNSENDT: {
            return {
                ...state,
                korrigeringErInnsendt: true,
                visErDuSikkerModal: false,
                innsendteFormverdier: action.innsendteFormverdier,
            };
        }
        case ActionType.SET_FORM_ERROR: {
            return { ...state, formError: action.formError };
        }
        default:
            return state;
    }
};

export default korrigeringAvInntektsmeldingReducer;
