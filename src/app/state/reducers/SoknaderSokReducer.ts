import { ISoknaderSokState } from 'app/models/types';
import { SoknaderVisningActionKeys } from '../../models/enums/SoknaderVisningActionKeys';
import { ISoknaderVisningActionTypes } from '../actions/SoknaderVisningActions';

const initialState: ISoknaderSokState = {
    soknadSvar: [],
    isSoknaderLoading: false,
    soknaderRequestError: undefined,
};

// eslint-disable-next-line import/prefer-default-export
export function SoknaderSokReducer(
    soknaderVisningState: ISoknaderSokState = initialState,
    action: ISoknaderVisningActionTypes | LocationChangeAction
): ISoknaderSokState {
    switch (action.type) {
        case SoknaderVisningActionKeys.SOKNADER_SET:
            return {
                ...soknaderVisningState,
                soknadSvar: action.soknadSvar,
                isSoknaderLoading: false,
                soknaderRequestError: undefined,
            };

        case SoknaderVisningActionKeys.SOKNADER_LOAD:
            return {
                ...soknaderVisningState,
                isSoknaderLoading: action.isLoading,
                soknaderRequestError: undefined,
            };

        case SoknaderVisningActionKeys.SOKNADER_REQUEST_ERROR:
            return {
                ...soknaderVisningState,
                isSoknaderLoading: false,
                soknaderRequestError: action.error,
            };

        case SoknaderVisningActionKeys.SOKNAD_OPEN:
            return {
                ...soknaderVisningState,
                chosenSoknad: action.soknad,
            };

        case SoknaderVisningActionKeys.SOKNAD_CLOSE:
            return {
                ...soknaderVisningState,
                chosenSoknad: undefined,
            };

        case SoknaderVisningActionKeys.SOKNAD_CHOOSE:
            return {
                ...soknaderVisningState,
                chosenSoknad: action.soknad,
            };

        case SoknaderVisningActionKeys.SOKNAD_UNDO_CHOICE:
            return {
                ...soknaderVisningState,
                chosenSoknad: undefined,
            };

        case SoknaderVisningActionKeys.SOKNADID_RESET:
            return {
                ...soknaderVisningState,
                soknadid: undefined,
            };

        default:
            return soknaderVisningState;
    }
}
