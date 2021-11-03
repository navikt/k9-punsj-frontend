import ActionType from './korrigeringAvInntektsmeldingActions';
import { KorrigeringAvInntektsmeldingFormValues } from './KorrigeringAvInntektsmeldingFormFieldsValues';

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
    søknadErInnsendt?: boolean;
    innsendteFormverdier?: KorrigeringAvInntektsmeldingFormValues;
}
interface Action {
    type: ActionType;
    åpnePaneler?: Paneler;
    isLoading?: boolean;
    innsendteFormverdier?: KorrigeringAvInntektsmeldingFormValues;
}

const korrigeringAvInntektsmeldingReducer = (state: State, action: Action): State => {
    switch (action.type) {
        case ActionType.SET_ÅPNE_PANELER: {
            return { ...state, åpnePaneler: action.åpnePaneler || state.åpnePaneler };
        }
        case ActionType.VALIDER_SØKNAD_START: {
            return { ...state, isLoading: true };
        }
        case ActionType.VALIDER_SØKNAD_SUCCESS: {
            return { ...state, isLoading: false };
        }
        case ActionType.VALIDER_SØKNAD_ERROR: {
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
        case ActionType.SET_SØKNAD_INNSENDT: {
            return {
                ...state,
                søknadErInnsendt: true,
                visErDuSikkerModal: false,
                innsendteFormverdier: action.innsendteFormverdier,
            };
        }
        default:
            return state;
    }
};

export default korrigeringAvInntektsmeldingReducer;
