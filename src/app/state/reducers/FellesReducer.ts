import { ulid } from 'ulid';
import { IError, IJournalpost } from '../../models/types';
import { convertResponseToError, get } from '../../utils';
import { ApiPath } from '../../apiConfig';

export interface IFellesState {
  dedupKey: string;
  journalpost?: IJournalpost;
  isJournalpostLoading?: boolean;
  journalpostRequestError?: IError;
}

enum Actiontypes {
  RESET_DEDUP_KEY = 'FELLES/RESET_DEDUP_KEY',
  JOURNALPOST_SET = 'FELLES/PUNCH_JOURNALPOST_SET',
  JOURNALPOST_LOAD = 'FELLES/PUNCH_JOURNALPOST_LOAD',
  JOURNALPOST_REQUEST_ERROR = 'FELLES/PUNCH_JOURNALPOST_REQUEST_ERROR',
}

interface IResetDedupKeyAction {
  type: Actiontypes.RESET_DEDUP_KEY;
}

interface ISetJournalpostAction {
  type: Actiontypes.JOURNALPOST_SET;
  journalpost: IJournalpost;
}
interface IGetJournalpostLoadAction {
  type: Actiontypes.JOURNALPOST_LOAD;
}
interface IGetJournalpostErrorAction {
  type: Actiontypes.JOURNALPOST_REQUEST_ERROR;
  error: IError;
}

export const resetDedupKey = (): IResetDedupKeyAction => ({
  type: Actiontypes.RESET_DEDUP_KEY,
});

export function setJournalpostAction(
  journalpost: IJournalpost
): ISetJournalpostAction {
  return { type: Actiontypes.JOURNALPOST_SET, journalpost };
}
export function getJournalpostLoadAction(): IGetJournalpostLoadAction {
  return { type: Actiontypes.JOURNALPOST_LOAD };
}
export function getJournalpostErrorAction(
  error: IError
): IGetJournalpostErrorAction {
  return { type: Actiontypes.JOURNALPOST_REQUEST_ERROR, error };
}

export function getJournalpost(journalpostid: string) {
  return (dispatch: any) => {
    dispatch(getJournalpostLoadAction());
    return get(
      ApiPath.JOURNALPOST_GET,
      { journalpostId: journalpostid },
      undefined,
      (response) => {
        if (response.ok) {
          return response
            .json()
            .then((journalpost) => dispatch(setJournalpostAction(journalpost)));
        }
        return dispatch(
          getJournalpostErrorAction(convertResponseToError(response))
        );
      }
    );
  };
}

type IJournalpostActionTypes =
  | ISetJournalpostAction
  | IGetJournalpostLoadAction
  | IGetJournalpostErrorAction;

const initialState: IFellesState = {
  dedupKey: ulid(),
  journalpost: undefined,
};

export default function FellesReducer(
  state: IFellesState = initialState,
  action: IResetDedupKeyAction | IJournalpostActionTypes
): IFellesState {
  switch (action.type) {
    case Actiontypes.RESET_DEDUP_KEY:
      return {
        ...state,
        dedupKey: ulid(),
      };

    case Actiontypes.JOURNALPOST_SET:
      return {
        ...state,
        journalpost: action.journalpost,
        isJournalpostLoading: false,
        journalpostRequestError: undefined,
      };

    case Actiontypes.JOURNALPOST_LOAD:
      return {
        ...state,
        journalpost: undefined,
        isJournalpostLoading: true,
        journalpostRequestError: undefined,
      };

    case Actiontypes.JOURNALPOST_REQUEST_ERROR:
      return {
        ...state,
        journalpost: undefined,
        isJournalpostLoading: false,
        journalpostRequestError: action.error,
      };

    default:
      return state;
  }
}
