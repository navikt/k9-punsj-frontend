import { EksisterendePLSSoknaderActionKeys } from '../../types/EksisterendePLSSoknaderActionKeys';
import { IEksisterendePLSSoknaderState } from '../../types/EksisterendePLSSoknaderState';
import { IPLSSoknad } from '../../types/PLSSoknad';
import { IEksisterendePLSSoknaderActionTypes } from '../actions/EksisterendePLSSoknaderActions';

const initialState: IEksisterendePLSSoknaderState = {
    eksisterendeSoknaderSvar: {},
    isEksisterendeSoknaderLoading: false,
    eksisterendeSoknaderRequestError: undefined,
    isSoknadCreated: false,
    isAwaitingSoknadCreation: false,
};

// eslint-disable-next-line import/prefer-default-export
export function EksisterendePLSSoknaderReducer(
    eksisterendeSoknaderState: IEksisterendePLSSoknaderState,
    action: IEksisterendePLSSoknaderActionTypes,
): IEksisterendePLSSoknaderState {
    if (typeof eksisterendeSoknaderState === 'undefined') return initialState;

    function openOrChoose(soknadInfo: IPLSSoknad) {
        return {
            ...eksisterendeSoknaderState,
            chosenSoknad: soknadInfo,
        };
    }

    function undoOrClose() {
        return {
            ...eksisterendeSoknaderState,
            chosenSoknad: undefined,
        };
    }

    switch (action.type) {
        case EksisterendePLSSoknaderActionKeys.EKSISTERENDE_PLS_SOKNADER_SET:
            return {
                ...eksisterendeSoknaderState,
                eksisterendeSoknaderSvar: action.eksisterendeSoknaderSvar,
                isEksisterendeSoknaderLoading: false,
                eksisterendeSoknaderRequestError: undefined,
            };

        case EksisterendePLSSoknaderActionKeys.EKSISTERENDE_PLS_SOKNADER_LOAD:
            return {
                ...eksisterendeSoknaderState,
                isEksisterendeSoknaderLoading: action.isLoading,
                eksisterendeSoknaderRequestError: undefined,
            };

        case EksisterendePLSSoknaderActionKeys.EKSISTERENDE_PLS_SOKNADER_REQUEST_ERROR:
            return {
                ...eksisterendeSoknaderState,
                isEksisterendeSoknaderLoading: false,
                eksisterendeSoknaderRequestError: action.error,
                isSoknadCreated: false,
            };

        case EksisterendePLSSoknaderActionKeys.EKSISTERENDE_PLS_SOKNAD_OPEN:
            return openOrChoose(action.soknadInfo);

        case EksisterendePLSSoknaderActionKeys.EKSISTERENDE_PLS_SOKNAD_CLOSE:
            return undoOrClose();

        case EksisterendePLSSoknaderActionKeys.EKSISTERENDE_PLS_SOKNAD_CHOOSE:
            return openOrChoose(action.soknadInfo);

        case EksisterendePLSSoknaderActionKeys.EKSISTERENDE_PLS_SOKNAD_UNDO_CHOICE:
            return undoOrClose();

        case EksisterendePLSSoknaderActionKeys.PLS_SOKNAD_CREATE_REQUEST:
            return {
                ...eksisterendeSoknaderState,
                soknadid: undefined,
                isAwaitingSoknadCreation: true,
                createSoknadRequestError: undefined,
            };

        case EksisterendePLSSoknaderActionKeys.PLS_SOKNAD_CREATE_SUCCESS:
            return {
                ...eksisterendeSoknaderState,
                soknadid: action.id,
                isSoknadCreated: true,
                isAwaitingSoknadCreation: false,
                createSoknadRequestError: undefined,
                eksisterendeSoknaderSvar: {},
            };

        case EksisterendePLSSoknaderActionKeys.PLS_SOKNAD_CREATE_ERROR:
            return {
                ...eksisterendeSoknaderState,
                soknadid: undefined,
                isAwaitingSoknadCreation: false,
                createSoknadRequestError: action.error,
                isSoknadCreated: false,
            };

        case EksisterendePLSSoknaderActionKeys.PLS_SOKNADID_RESET:
            return {
                ...eksisterendeSoknaderState,
                soknadid: undefined,
                isSoknadCreated: false,
            };

        default:
            return eksisterendeSoknaderState;
    }
}
