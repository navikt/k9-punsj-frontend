import Organisasjon from 'app/models/types/Organisasjon';
import ActionType from './actionTypes';

interface State {
    arbeidsgivere: Organisasjon[];
    selectedArbeidsgiver: string;
    gjelderAnnenArbeidsgiver: boolean;
    navnPåArbeidsgiver: string;
    getArbeidsgivereFailed: boolean;
}

interface Action {
    type: ActionType;
    arbeidsgivere?: Organisasjon[];
    selectedArbeidsgiver?: string;
    navnPåArbeidsgiver?: string;
}

const pfArbeidstakerReducer = (state: State, action: Action) => {
    switch (action.type) {
        case ActionType.SET_ARBEIDSGIVERE:
            return {
                ...state,
                arbeidsgivere: action.arbeidsgivere || [],
            };
        case ActionType.GET_ARBEIDSGIVERE_FAILED:
            return { ...state, getArbeidsgivereFailed: true, gjelderAnnenArbeidsgiver: true };
        case ActionType.SELECT_ARBEIDSGIVER:
            return { ...state, selectedArbeidsgiver: action.selectedArbeidsgiver };
        case ActionType.TOGGLE_GJELDER_ANNEN_ARBEIDSGIVER:
            return { ...state, gjelderAnnenArbeidsgiver: !state.gjelderAnnenArbeidsgiver };
        case ActionType.SET_NAVN_ARBEIDSDGIVER:
            return { ...state, navnPåArbeidsgiver: action.navnPåArbeidsgiver };
        default:
            return state;
    }
};

export default pfArbeidstakerReducer;
