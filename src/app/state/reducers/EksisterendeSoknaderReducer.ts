import { EksisterendeSoknaderActionKeys } from 'app/models/enums';
import { IEksisterendeSoknaderState } from 'app/models/types';
import { IEksisterendeSoknaderActionTypes } from 'app/state/actions';
import { RESET_ALL } from '../actions/GlobalActions';

const initialState: IEksisterendeSoknaderState = {
    eksisterendeSoknaderSvar: {},
    isEksisterendeSoknaderLoading: false,
    eksisterendeSoknaderRequestError: undefined,
    isSoknadCreated: false,
    isAwaitingSoknadCreation: false,
};

export function EksisterendeSoknaderReducer(
    eksisterendeSoknaderState: IEksisterendeSoknaderState = initialState,
    action: IEksisterendeSoknaderActionTypes,
): IEksisterendeSoknaderState {
    switch (action.type) {
        case EksisterendeSoknaderActionKeys.EKSISTERENDE_SOKNADER_SET:
            return {
                ...eksisterendeSoknaderState,
                eksisterendeSoknaderSvar: action.eksisterendeSoknaderSvar,
                isEksisterendeSoknaderLoading: false,
                eksisterendeSoknaderRequestError: undefined,
            };

        case EksisterendeSoknaderActionKeys.EKSISTERENDE_SOKNADER_LOAD:
            return {
                ...eksisterendeSoknaderState,
                isEksisterendeSoknaderLoading: action.isLoading,
                eksisterendeSoknaderRequestError: undefined,
            };

        case EksisterendeSoknaderActionKeys.EKSISTERENDE_SOKNADER_REQUEST_ERROR:
            return {
                ...eksisterendeSoknaderState,
                isEksisterendeSoknaderLoading: false,
                eksisterendeSoknaderRequestError: action.error,
                isSoknadCreated: false,
            };

        case EksisterendeSoknaderActionKeys.EKSISTERENDE_SOKNAD_OPEN:
            return {
                ...eksisterendeSoknaderState,
                chosenSoknad: action.soknadInfo,
            };

        case EksisterendeSoknaderActionKeys.EKSISTERENDE_SOKNAD_CLOSE:
            return {
                ...eksisterendeSoknaderState,
                chosenSoknad: undefined,
            };

        case EksisterendeSoknaderActionKeys.EKSISTERENDE_SOKNAD_CHOOSE:
            return {
                ...eksisterendeSoknaderState,
                chosenSoknad: action.soknadInfo,
            };

        case EksisterendeSoknaderActionKeys.EKSISTERENDE_SOKNAD_UNDO_CHOICE:
            return {
                ...eksisterendeSoknaderState,
                chosenSoknad: undefined,
            };

        case EksisterendeSoknaderActionKeys.SOKNAD_CREATE_REQUEST:
            return {
                ...eksisterendeSoknaderState,
                soknadid: undefined,
                isAwaitingSoknadCreation: true,
                createSoknadRequestError: undefined,
            };

        case EksisterendeSoknaderActionKeys.SOKNAD_CREATE_SUCCESS:
            return {
                ...eksisterendeSoknaderState,
                soknadid: action.id,
                isSoknadCreated: true,
                isAwaitingSoknadCreation: false,
                createSoknadRequestError: undefined,
                eksisterendeSoknaderSvar: {},
            };

        case EksisterendeSoknaderActionKeys.SOKNAD_CREATE_ERROR:
            return {
                ...eksisterendeSoknaderState,
                soknadid: undefined,
                isAwaitingSoknadCreation: false,
                createSoknadRequestError: action.error,
                isSoknadCreated: false,
            };

        case EksisterendeSoknaderActionKeys.SOKNADID_RESET:
            return {
                ...eksisterendeSoknaderState,
                soknadid: undefined,
                isSoknadCreated: false,
            };

        case RESET_ALL: {
            return { ...initialState };
        }

        default:
            return eksisterendeSoknaderState;
    }
}
