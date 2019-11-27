import {PunchActionKeys, PunchStep} from 'app/models/enums';
import {IPunchState}                from 'app/models/types';
import {IPunchActionTypes}          from 'app/state/actions';

const initialState: IPunchState = {
    step: PunchStep.START,
    ident: "",
    journalpost: undefined,
    mapper: [],
    fagsaker: [],
    isMapperLoading: false,
    isFagsakerLoading: false,
    mapperRequestError: undefined,
    fagsakerRequestError: undefined
};

export function PunchReducer(
    punchState: IPunchState = initialState,
    action: IPunchActionTypes
): IPunchState {
    switch (action.type) {

        case PunchActionKeys.IDENT_SET:
            return {
                ...punchState,
                ident: action.ident,
                isMapperLoading: false,
                isFagsakerLoading: false,
                mapperRequestError: undefined,
                fagsakerRequestError: undefined
            };

        case PunchActionKeys.STEP_SET:
            return {
                ...punchState,
                step: action.step
            };

        case PunchActionKeys.JOURNALPOST_SET:
            return {
                ...punchState,
                journalpost: action.journalpost,
                isJournalpostLoading: false,
                journalpostRequestError: undefined
            };

        case PunchActionKeys.JOURNALPOST_LOAD:
            return {
                ...punchState,
                journalpost: undefined,
                isJournalpostLoading: true,
                journalpostRequestError: undefined
            };

        case PunchActionKeys.JOURNALPOST_REQUEST_ERROR:
            return {
                ...punchState,
                journalpost: undefined,
                isJournalpostLoading: false,
                journalpostRequestError: undefined
            };

        case PunchActionKeys.MAPPER_SET:
            return {
                ...punchState,
                step: PunchStep.CHOOSE_SOKNAD,
                mapper: action.mapper,
                isMapperLoading: false,
                mapperRequestError: undefined
            };

        case PunchActionKeys.MAPPER_LOAD:
            return {
                ...punchState,
                step: PunchStep.CHOOSE_SOKNAD,
                isMapperLoading: action.isLoading,
                mapperRequestError: undefined
            };

        case PunchActionKeys.MAPPER_REQUEST_ERROR:
            return {
                ...punchState,
                step: PunchStep.START,
                isMapperLoading: false,
                mapperRequestError: action.error
            };

        case PunchActionKeys.MAPPER_UNDO_SEARCH:
            return {
                ...punchState,
                step: PunchStep.START,
                ident: '',
                mapper: [],
                fagsaker: [],
                chosenMappe: undefined,
                isMapperLoading: false,
                isFagsakerLoading: false,
                mapperRequestError: undefined,
                fagsakerRequestError: undefined
            };

        case PunchActionKeys.FAGSAKER_SET:
            return {
                ...punchState,
                step: PunchStep.CHOOSE_SOKNAD,
                fagsaker: action.fagsaker,
                isFagsakerLoading: false,
                fagsakerRequestError: undefined
            };

        case PunchActionKeys.FAGSAKER_LOAD:
            return {
                ...punchState,
                step: PunchStep.CHOOSE_SOKNAD,
                fagsaker: [],
                isFagsakerLoading: action.isLoading,
                fagsakerRequestError: undefined
            };

        case PunchActionKeys.FAGSAKER_REQUEST_ERROR:
            return {
                ...punchState,
                step: PunchStep.START,
                fagsaker: [],
                isFagsakerLoading: false,
                fagsakerRequestError: action.error
            };

        case PunchActionKeys.MAPPE_OPEN:
            return {
                ...punchState,
                chosenMappe: action.mappe,
                chosenFagsak: undefined
            };

        case PunchActionKeys.MAPPE_CLOSE:
            return {
                ...punchState,
                chosenMappe: undefined
            };

        case PunchActionKeys.MAPPE_CHOOSE:
            return {
                ...punchState,
                step: PunchStep.FILL_FORM,
                chosenMappe: action.mappe
            };

        case PunchActionKeys.MAPPE_NEW:
            return {
                ...punchState,
                step: PunchStep.FILL_FORM,
                chosenMappe: undefined
            };

        case PunchActionKeys.MAPPE_UNDO_CHOICE:
            return {
                ...punchState,
                step: !punchState.fagsaker.length && !punchState.mapper.length ? PunchStep.START : PunchStep.CHOOSE_SOKNAD,
                chosenMappe: undefined,
                chosenFagsak: undefined
            };

        case PunchActionKeys.FAGSAK_OPEN:
            return {
                ...punchState,
                chosenFagsak: action.fagsak,
                chosenMappe: undefined
            };

        case PunchActionKeys.FAGSAK_CLOSE:
            return {
                ...punchState,
                chosenFagsak: undefined
            };

        default: return punchState;
    }
}