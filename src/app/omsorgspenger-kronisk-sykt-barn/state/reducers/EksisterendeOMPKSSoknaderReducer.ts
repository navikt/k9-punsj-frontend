import {
    IEksisterendeOMPKSSoknaderActionTypes
} from '../actions/EksisterendeOMPKSSoknaderActions';
import {
    IEksisterendeOMPKSSoknaderState
} from '../../../models/types/omsorgspenger-kronisk-sykt-barn/EksisterendeOMPKSSoknaderState';
import {EksisterendeOMPKSSoknaderActionKeys} from '../../../models/enums/EksisterendeOMPKSSoknaderActionKeys';

const initialState: IEksisterendeOMPKSSoknaderState = {
    eksisterendeSoknaderSvar: {},
    isEksisterendeSoknaderLoading: false,
    eksisterendeSoknaderRequestError: undefined,
    isSoknadCreated: false,
    isAwaitingSoknadCreation: false,
};

// eslint-disable-next-line import/prefer-default-export
export function EksisterendeOMPKSSoknaderReducer(
    action: IEksisterendeOMPKSSoknaderActionTypes,
    eksisterendeSoknaderState: IEksisterendeOMPKSSoknaderState = initialState
): IEksisterendeOMPKSSoknaderState {
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
            return {
                ...eksisterendeSoknaderState,
                chosenSoknad: action.soknadInfo,
            };

        case EksisterendeOMPKSSoknaderActionKeys.EKSISTERENDE_OMP_KS_SOKNAD_CLOSE:
            return {
                ...eksisterendeSoknaderState,
                chosenSoknad: undefined,
            };

        case EksisterendeOMPKSSoknaderActionKeys.EKSISTERENDE_OMP_KS_SOKNAD_CHOOSE:
            return {
                ...eksisterendeSoknaderState,
                chosenSoknad: action.soknadInfo,
            };

        case EksisterendeOMPKSSoknaderActionKeys.EKSISTERENDE_OMP_KS_SOKNAD_UNDO_CHOICE:
            return {
                ...eksisterendeSoknaderState,
                chosenSoknad: undefined,
            };

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
                eksisterendeSoknaderSvar: {},
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
