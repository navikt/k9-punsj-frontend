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
}

interface Action {
    type: ActionType;
    åpnePaneler?: Paneler;
    isLoading?: boolean;
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
        default:
            return state;
    }
};

export default korrigeringAvInntektsmeldingReducer;
