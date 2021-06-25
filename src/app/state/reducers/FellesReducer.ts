import { ulid } from 'ulid';
import { IError, IJournalpost } from '../../models/types';
import {convertResponseToError, get, post} from '../../utils';
import { ApiPath } from '../../apiConfig';
import {IKopierJournalpost} from "../../models/types/RequestBodies";
import {
  ActiontypesHentBarn,
  IHentBarnErrorAction,
  IHentBarnForbiddenAction,
  IHentBarnRequestAction,
  IHentBarnSuccessAction
} from "./HentBarn";
import {IBarn} from "../../models/types/Barn";

export interface IFellesState {
  dedupKey: string;
  journalpost?: IJournalpost;
  isJournalpostLoading?: boolean;
  journalpostNotFound?: boolean;
  journalpostForbidden?: boolean;
  journalpostRequestError?: IError;
  isAwaitingKopierJournalPostResponse?: boolean;
  kopierJournalpostForbidden?: boolean;
  kopierJournalpostError?: boolean;
  kopierJournalpostSuccess?: boolean;
  kopierJournalpostConflict?: boolean;
  isAwaitingHentBarnResponse?:boolean;
  hentBarnForbidden?: boolean;
  hentBarnError?: boolean;
  hentBarnSuccess?: boolean;
  barn?: IBarn[];
}

enum Actiontypes {
  RESET_DEDUP_KEY = 'FELLES/RESET_DEDUP_KEY',
  JOURNALPOST_SET = 'FELLES/PUNCH_JOURNALPOST_SET',
  JOURNALPOST_LOAD = 'FELLES/PUNCH_JOURNALPOST_LOAD',
  JOURNALPOST_REQUEST_ERROR = 'FELLES/PUNCH_JOURNALPOST_REQUEST_ERROR',
  JOURNALPOST_NOT_FOUND = 'FELLES/PUNCH_JOURNALPOST_NOT_FOUND',
  JOURNALPOST_FORBIDDEN = 'FELLES/PUNCH_JOURNALPOST_FORBIDDEN',
  JOURNALPOST_KOPIERE_FORBIDDEN = 'FELLES/JOURNALPOST_KOPIERE_FORBIDDEN',
  JOURNALPOST_KOPIERE_CONFLICT = 'FELLES/JOURNALPOST_KOPIERE_CONFLICT',
  JOURNALPOST_KOPIERE_SUCCESS = 'FELLES/JOURNALPOST_KOPIERE_SUCCESS',
  JOURNALPOST_KOPIERE_REQUEST = 'FELLES/JOURNALPOST_KOPIERE_REQUEST',
  JOURNALPOST_KOPIERE_ERROR = 'FELLES/JOURNALPOST_KOPIERE_ERROR',
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

interface IGetJournalpostNotFoundAction {
  type: Actiontypes.JOURNALPOST_NOT_FOUND;
}

interface IGetJournalpostForbiddenAction {
  type: Actiontypes.JOURNALPOST_FORBIDDEN;
}

interface IJournalpostKopiereForbiddenAction {
  type: Actiontypes.JOURNALPOST_KOPIERE_FORBIDDEN;
}

interface IJournalpostKopiereConflictAction {
  type: Actiontypes.JOURNALPOST_KOPIERE_CONFLICT;
}

interface IJournalpostKopiereSuccessAction {
  type: Actiontypes.JOURNALPOST_KOPIERE_SUCCESS;
}

interface IJournalpostKopiereRequestAction {
  type: Actiontypes.JOURNALPOST_KOPIERE_REQUEST;
}

interface IJournalpostKopiereErrorAction {
  type: Actiontypes.JOURNALPOST_KOPIERE_ERROR;
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

export function getJournalpostNotFoundAction(
    ): IGetJournalpostNotFoundAction {
  return { type: Actiontypes.JOURNALPOST_NOT_FOUND };
}

export function getJournalpostForbiddenAction(
): IGetJournalpostForbiddenAction {
  return { type: Actiontypes.JOURNALPOST_FORBIDDEN };
}

export function getJournalpost(journalpostid: string) {
  return (dispatch: any) => {
    dispatch(getJournalpostLoadAction());
    return get(
      ApiPath.JOURNALPOST_GET,
      { journalpostId: journalpostid },
      undefined,
      (response, journalpost) => {
        if (response.ok) {
          return dispatch(setJournalpostAction(journalpost));
        }
        if (response.status === 404) {
          return dispatch(getJournalpostNotFoundAction());
        }
        if (response.status === 403) {
          return dispatch(getJournalpostForbiddenAction());
        }
        return dispatch(
          getJournalpostErrorAction(convertResponseToError(response))
        );
      }
    );
  };
}

// Kopiere journalpost
export function getJournalpostKopiereForbiddenAction(
): IJournalpostKopiereForbiddenAction {
  return { type: Actiontypes.JOURNALPOST_KOPIERE_FORBIDDEN };
}

export function getJournalpostKopiereConflictAction(
): IJournalpostKopiereConflictAction {
  return { type: Actiontypes.JOURNALPOST_KOPIERE_CONFLICT };
}

export function getJournalpostKopiereRequestAction(
): IJournalpostKopiereRequestAction {
  return { type: Actiontypes.JOURNALPOST_KOPIERE_REQUEST };
}

export function getJournalpostKopiereSuccessAction(
): IJournalpostKopiereSuccessAction {
  return { type: Actiontypes.JOURNALPOST_KOPIERE_SUCCESS };
}

export function getJournalpostKopiereErrorAction(
): IJournalpostKopiereErrorAction {
  return { type: Actiontypes.JOURNALPOST_KOPIERE_ERROR };
}

type IJournalpostActionTypes =
    | ISetJournalpostAction
    | IGetJournalpostLoadAction
    | IGetJournalpostErrorAction
    | IGetJournalpostNotFoundAction
    | IGetJournalpostForbiddenAction
    | IJournalpostKopiereForbiddenAction
    | IJournalpostKopiereConflictAction
    | IJournalpostKopiereRequestAction
    | IJournalpostKopiereSuccessAction
    | IJournalpostKopiereErrorAction
    | IHentBarnForbiddenAction
    | IHentBarnRequestAction
    | IHentBarnSuccessAction
    | IHentBarnErrorAction;


export function kopierJournalpost(kopierFraIdent: string, kopierTilIdent: string, barnIdent: string, journalPostID: string, dedupKey: string) {
  return (dispatch: any) => {
    const requestBody: IKopierJournalpost = {
      dedupKey,
      fra: kopierFraIdent,
      til: kopierTilIdent,
      barn: barnIdent
    }

    dispatch(getJournalpostKopiereRequestAction());
    post(ApiPath.JOURNALPOST_KOPIERE, {journalpostId: journalPostID}, {'X-Nav-NorskIdent': kopierFraIdent}, requestBody, (response) => {

      switch (response.status) {
        case 202:
          return dispatch(getJournalpostKopiereSuccessAction());
        case 403:
          return  dispatch(getJournalpostKopiereForbiddenAction());
        case 409:
          return  dispatch(getJournalpostKopiereConflictAction());
        default:
          return dispatch(getJournalpostKopiereErrorAction());
      }
    });
  }
}

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

    case Actiontypes.JOURNALPOST_NOT_FOUND:
      return {
        ...state,
        journalpost: undefined,
        isJournalpostLoading: false,
        journalpostNotFound: true
      };

    case Actiontypes.JOURNALPOST_FORBIDDEN:
      return {
        ...state,
        journalpost: undefined,
        isJournalpostLoading: false,
        journalpostForbidden: true
      };

    case Actiontypes.JOURNALPOST_KOPIERE_REQUEST:
      return {
        ...state,
        isAwaitingKopierJournalPostResponse: true
      };

    case Actiontypes.JOURNALPOST_KOPIERE_CONFLICT:
      return {
        ...state,
        isAwaitingKopierJournalPostResponse: false,
        kopierJournalpostConflict: true
      };

    case Actiontypes.JOURNALPOST_KOPIERE_FORBIDDEN:
      return {
        ...state,
        isAwaitingKopierJournalPostResponse: false,
        kopierJournalpostForbidden: true
      };

    case Actiontypes.JOURNALPOST_KOPIERE_SUCCESS:
      return {
        ...state,
        isAwaitingKopierJournalPostResponse: false,
        kopierJournalpostSuccess: true
      };

    case Actiontypes.JOURNALPOST_KOPIERE_ERROR:
      return {
        ...state,
        isAwaitingKopierJournalPostResponse: false,
        kopierJournalpostError: true
      };

    case ActiontypesHentBarn.HENTBARN_REQUEST:
      return {
        ...state,
        isAwaitingHentBarnResponse: true
      };

    case ActiontypesHentBarn.HENTBARN_FORBIDDEN:
      return {
        ...state,
        isAwaitingHentBarnResponse: false,
        hentBarnForbidden: true
      };

    case ActiontypesHentBarn.HENTBARN_SUCCESS:
      return {
        ...state,
        barn: action.barn,
        isAwaitingHentBarnResponse: false,
        hentBarnSuccess: true
      };

    case ActiontypesHentBarn.HENTBARN_ERROR:
      return {
        ...state,
        isAwaitingHentBarnResponse: false,
        hentBarnError: true
      };

    default:
      return state;
  }
}