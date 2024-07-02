import ActionType from '../../types/actionTypes';

interface State {
    selectedArbeidsgiver: string;
    gjelderAnnenArbeidsgiver: boolean;
    navnPåArbeidsgiver: string;
    searchOrganisasjonsnummerFailed: boolean;
}

interface Action {
    type: ActionType;
    selectedArbeidsgiver?: string;
    navnPåArbeidsgiver?: string;
    searchOrganisasjonsnummerFailed?: boolean;
    gjelderAnnenArbeidsgiver?: boolean;
}

const pfArbeidstakerReducer = (state: State, action: Action): Partial<State> => {
    switch (action.type) {
        case ActionType.SELECT_ARBEIDSGIVER:
            return { ...state, selectedArbeidsgiver: action.selectedArbeidsgiver };
        case ActionType.TOGGLE_GJELDER_ANNEN_ARBEIDSGIVER:
            return {
                ...state,
                gjelderAnnenArbeidsgiver: action.gjelderAnnenArbeidsgiver ?? !state.gjelderAnnenArbeidsgiver,
                selectedArbeidsgiver: action.selectedArbeidsgiver ?? state.selectedArbeidsgiver,
                navnPåArbeidsgiver: '',
                searchOrganisasjonsnummerFailed: false,
            };
        case ActionType.SET_NAVN_ARBEIDSDGIVER:
            return { ...state, navnPåArbeidsgiver: action.navnPåArbeidsgiver, searchOrganisasjonsnummerFailed: false };
        case ActionType.SET_SEARCH_ORGANISASJONSNUMMER_FAILED:
            return { ...state, searchOrganisasjonsnummerFailed: action.searchOrganisasjonsnummerFailed };
        default:
            return state;
    }
};

export default pfArbeidstakerReducer;
