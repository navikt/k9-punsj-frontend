import { IEksisterendeOMPUTSoknaderActionTypes } from '../actions/EksisterendeOMPUTSoknaderActions';
import { IEksisterendeOMPUTSoknaderState } from '../../types/EksisterendeOMPUTSoknaderState';
import { EksisterendeOMPUTSoknaderActionKeys } from '../../types/EksisterendeOMPUTSoknaderActionKeys';
import { IOMPUTSoknad } from '../../types/OMPUTSoknad';

const initialState: IEksisterendeOMPUTSoknaderState = {
    eksisterendeSoknaderSvar: {},
    isEksisterendeSoknaderLoading: false,
    eksisterendeSoknaderRequestError: undefined,
    isSoknadCreated: false,
    isAwaitingSoknadCreation: false,
};

// eslint-disable-next-line import/prefer-default-export
export function EksisterendeOMPUTSoknaderReducer(
    eksisterendeSoknaderState: IEksisterendeOMPUTSoknaderState,
    action: IEksisterendeOMPUTSoknaderActionTypes
): IEksisterendeOMPUTSoknaderState {
    if (typeof eksisterendeSoknaderState === 'undefined') return initialState;

    function openOrChoose(soknadInfo: IOMPUTSoknad) {
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
        case EksisterendeOMPUTSoknaderActionKeys.EKSISTERENDE_OMP_UT_SOKNADER_SET:
            return {
                ...eksisterendeSoknaderState,
                eksisterendeSoknaderSvar: action.eksisterendeOMPUTSoknaderSvar,
                isEksisterendeSoknaderLoading: false,
                eksisterendeSoknaderRequestError: undefined,
            };

        case EksisterendeOMPUTSoknaderActionKeys.EKSISTERENDE_OMP_UT_SOKNADER_LOAD:
            return {
                ...eksisterendeSoknaderState,
                isEksisterendeSoknaderLoading: action.isLoading,
                eksisterendeSoknaderRequestError: undefined,
            };

        case EksisterendeOMPUTSoknaderActionKeys.EKSISTERENDE_OMP_UT_SOKNADER_REQUEST_ERROR:
            return {
                ...eksisterendeSoknaderState,
                isEksisterendeSoknaderLoading: false,
                eksisterendeSoknaderRequestError: action.error,
                isSoknadCreated: false,
            };

        case EksisterendeOMPUTSoknaderActionKeys.EKSISTERENDE_OMP_UT_SOKNAD_OPEN:
            return openOrChoose(action.soknadInfo);

        case EksisterendeOMPUTSoknaderActionKeys.EKSISTERENDE_OMP_UT_SOKNAD_CLOSE:
            return undoOrClose();

        case EksisterendeOMPUTSoknaderActionKeys.EKSISTERENDE_OMP_UT_SOKNAD_CHOOSE:
            return openOrChoose(action.soknadInfo);

        case EksisterendeOMPUTSoknaderActionKeys.EKSISTERENDE_OMP_UT_SOKNAD_UNDO_CHOICE:
            return undoOrClose();

        case EksisterendeOMPUTSoknaderActionKeys.OMP_UT_SOKNAD_CREATE_REQUEST:
            return {
                ...eksisterendeSoknaderState,
                soknadid: undefined,
                isAwaitingSoknadCreation: true,
                createSoknadRequestError: undefined,
            };

        case EksisterendeOMPUTSoknaderActionKeys.OMP_UT_SOKNAD_CREATE_SUCCESS:
            return {
                ...eksisterendeSoknaderState,
                soknadid: action.id,
                isSoknadCreated: true,
                isAwaitingSoknadCreation: false,
                createSoknadRequestError: undefined,
                eksisterendeSoknaderSvar: {},
            };

        case EksisterendeOMPUTSoknaderActionKeys.OMP_UT_SOKNAD_CREATE_ERROR:
            return {
                ...eksisterendeSoknaderState,
                soknadid: undefined,
                isAwaitingSoknadCreation: false,
                createSoknadRequestError: action.error,
                isSoknadCreated: false,
            };

        case EksisterendeOMPUTSoknaderActionKeys.OMP_UT_SOKNADID_RESET:
            return {
                ...eksisterendeSoknaderState,
                soknadid: undefined,
                isSoknadCreated: false,
            };

        default:
            return eksisterendeSoknaderState;
    }
}
