import { EksisterendeOMPKSSoknaderActionKeys } from '../../types/EksisterendeOMPKSSoknaderActionKeys';
import { IEksisterendeOMPKSSoknaderState } from '../../types/EksisterendeOMPKSSoknaderState';
import { IOMPKSSoknad } from '../../types/OMPKSSoknad';
import { IEksisterendeOMPKSSoknaderActionTypes } from '../actions/EksisterendeOMPKSSoknaderActions';

const initialState: IEksisterendeOMPKSSoknaderState = {
    eksisterendeSoknaderSvar: {},
    isEksisterendeSoknaderLoading: false,
    eksisterendeSoknaderRequestError: undefined,
    isSoknadCreated: false,
    isAwaitingSoknadCreation: false,
};

 import/prefer-default-export
export function EksisterendeOMPKSSoknaderReducer(
    eksisterendeSoknaderState: IEksisterendeOMPKSSoknaderState,
    action: IEksisterendeOMPKSSoknaderActionTypes,
): IEksisterendeOMPKSSoknaderState {
    if (typeof eksisterendeSoknaderState === 'undefined') return initialState;

    function openOrChoose(soknadInfo: IOMPKSSoknad) {
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
        case EksisterendeOMPKSSoknaderActionKeys.EKSISTERENDE_OMP_KS_SOKNADER_SET:
            return {
                ...eksisterendeSoknaderState,
                eksisterendeSoknaderSvar: action.eksisterendeOMPKSSoknaderSvar,
                isEksisterendeSoknaderLoading: false,
                eksisterendeSoknaderRequestError: undefined,
            };

        case EksisterendeOMPKSSoknaderActionKeys.EKSISTERENDE_OMP_KS_SOKNADER_LOAD:
            return {
                ...eksisterendeSoknaderState,
                isEksisterendeSoknaderLoading: action.isLoading,
                eksisterendeSoknaderRequestError: undefined,
            };

        case EksisterendeOMPKSSoknaderActionKeys.EKSISTERENDE_OMP_KS_SOKNADER_REQUEST_ERROR:
            return {
                ...eksisterendeSoknaderState,
                isEksisterendeSoknaderLoading: false,
                eksisterendeSoknaderRequestError: action.error,
                isSoknadCreated: false,
            };

        case EksisterendeOMPKSSoknaderActionKeys.EKSISTERENDE_OMP_KS_SOKNAD_OPEN:
            return openOrChoose(action.soknadInfo);

        case EksisterendeOMPKSSoknaderActionKeys.EKSISTERENDE_OMP_KS_SOKNAD_CLOSE:
            return undoOrClose();

        case EksisterendeOMPKSSoknaderActionKeys.EKSISTERENDE_OMP_KS_SOKNAD_CHOOSE:
            return openOrChoose(action.soknadInfo);

        case EksisterendeOMPKSSoknaderActionKeys.EKSISTERENDE_OMP_KS_SOKNAD_UNDO_CHOICE:
            return undoOrClose();

        case EksisterendeOMPKSSoknaderActionKeys.OMP_KS_SOKNAD_CREATE_REQUEST:
            return {
                ...eksisterendeSoknaderState,
                soknadid: undefined,
                isAwaitingSoknadCreation: true,
                createSoknadRequestError: undefined,
            };

        case EksisterendeOMPKSSoknaderActionKeys.OMP_KS_SOKNAD_CREATE_SUCCESS:
            return {
                ...eksisterendeSoknaderState,
                soknadid: action.id,
                isSoknadCreated: true,
                isAwaitingSoknadCreation: false,
                createSoknadRequestError: undefined,
            };

        case EksisterendeOMPKSSoknaderActionKeys.OMP_KS_SOKNAD_CREATE_ERROR:
            return {
                ...eksisterendeSoknaderState,
                soknadid: undefined,
                isAwaitingSoknadCreation: false,
                createSoknadRequestError: action.error,
                isSoknadCreated: false,
            };

        case EksisterendeOMPKSSoknaderActionKeys.OMP_KS_SOKNADID_RESET:
            return {
                ...eksisterendeSoknaderState,
                soknadid: undefined,
                isSoknadCreated: false,
            };

        default:
            return eksisterendeSoknaderState;
    }
}
