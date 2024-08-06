import { EksisterendeOMPMASoknaderActionKeys } from '../../types/EksisterendeOMPMASoknaderActionKeys';
import { IEksisterendeOMPMASoknaderState } from '../../types/EksisterendeOMPMASoknaderState';
import { IOMPMASoknad } from '../../types/OMPMASoknad';
import { IEksisterendeOMPMASoknaderActionTypes } from '../actions/EksisterendeOMPMASoknaderActions';

const initialState: IEksisterendeOMPMASoknaderState = {
    eksisterendeSoknaderSvar: {},
    isEksisterendeSoknaderLoading: false,
    eksisterendeSoknaderRequestError: undefined,
    isSoknadCreated: false,
    isAwaitingSoknadCreation: false,
};

 import/prefer-default-export
export function EksisterendeOMPMASoknaderReducer(
    eksisterendeSoknaderState: IEksisterendeOMPMASoknaderState,
    action: IEksisterendeOMPMASoknaderActionTypes,
): IEksisterendeOMPMASoknaderState {
    if (typeof eksisterendeSoknaderState === 'undefined') return initialState;

    function openOrChoose(soknadInfo: IOMPMASoknad) {
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
        case EksisterendeOMPMASoknaderActionKeys.EKSISTERENDE_OMP_MA_SOKNADER_SET:
            return {
                ...eksisterendeSoknaderState,
                eksisterendeSoknaderSvar: action.eksisterendeOMPMASoknaderSvar,
                isEksisterendeSoknaderLoading: false,
                eksisterendeSoknaderRequestError: undefined,
            };

        case EksisterendeOMPMASoknaderActionKeys.EKSISTERENDE_OMP_MA_SOKNADER_LOAD:
            return {
                ...eksisterendeSoknaderState,
                isEksisterendeSoknaderLoading: action.isLoading,
                eksisterendeSoknaderRequestError: undefined,
            };

        case EksisterendeOMPMASoknaderActionKeys.EKSISTERENDE_OMP_MA_SOKNADER_REQUEST_ERROR:
            return {
                ...eksisterendeSoknaderState,
                isEksisterendeSoknaderLoading: false,
                eksisterendeSoknaderRequestError: action.error,
                isSoknadCreated: false,
            };

        case EksisterendeOMPMASoknaderActionKeys.EKSISTERENDE_OMP_MA_SOKNAD_OPEN:
            return openOrChoose(action.soknadInfo);

        case EksisterendeOMPMASoknaderActionKeys.EKSISTERENDE_OMP_MA_SOKNAD_CLOSE:
            return undoOrClose();

        case EksisterendeOMPMASoknaderActionKeys.EKSISTERENDE_OMP_MA_SOKNAD_CHOOSE:
            return openOrChoose(action.soknadInfo);

        case EksisterendeOMPMASoknaderActionKeys.EKSISTERENDE_OMP_MA_SOKNAD_UNDO_CHOICE:
            return undoOrClose();

        case EksisterendeOMPMASoknaderActionKeys.OMP_MA_SOKNAD_CREATE_REQUEST:
            return {
                ...eksisterendeSoknaderState,
                soknadid: undefined,
                isAwaitingSoknadCreation: true,
                createSoknadRequestError: undefined,
            };

        case EksisterendeOMPMASoknaderActionKeys.OMP_MA_SOKNAD_CREATE_SUCCESS:
            return {
                ...eksisterendeSoknaderState,
                soknadid: action.id,
                isSoknadCreated: true,
                isAwaitingSoknadCreation: false,
                createSoknadRequestError: undefined,
                eksisterendeSoknaderSvar: {},
            };

        case EksisterendeOMPMASoknaderActionKeys.OMP_MA_SOKNAD_CREATE_ERROR:
            return {
                ...eksisterendeSoknaderState,
                soknadid: undefined,
                isAwaitingSoknadCreation: false,
                createSoknadRequestError: action.error,
                isSoknadCreated: false,
            };

        case EksisterendeOMPMASoknaderActionKeys.OMP_MA_SOKNADID_RESET:
            return {
                ...eksisterendeSoknaderState,
                soknadid: undefined,
                isSoknadCreated: false,
            };

        default:
            return eksisterendeSoknaderState;
    }
}
