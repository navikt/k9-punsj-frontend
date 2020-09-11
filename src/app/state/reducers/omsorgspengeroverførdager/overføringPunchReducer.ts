import {
  Innsendingsstatus,
  IOverføringPunchSkjema,
} from '../../../models/forms/omsorgspenger/overføring/PunchSkjema';
import { convertResponseToError, post } from '../../../utils';
import { ApiPath } from '../../../apiConfig';
import { RootStateType } from '../../RootState';
import { Dispatch } from 'redux';
import { IError } from '../../../models/types';

export interface IOverføringPunchState {
  skjema: IOverføringPunchSkjema;
  innsendingsstatus: Innsendingsstatus;
  innsendingsfeil?: IError;
}

enum ActionTypes {
  SET_SKJEMA = 'OVERFØRING/PUNCH/SET_SKJEMA',
  SENDER_INN_SKJEMA = 'OVERFØRING/PUNCH/SENDER_INN_SKJEMA',
  SKJEMA_ER_SENDT_INN = 'OVERFØRING/PUNCH/SKJEMA_ER_SENDT_INN',
  INNSENDINGSFEIL = 'OVERFØRING/PUNCH/INNSENDINGSFEIL',
}

interface ISetSkjemaAction {
  type: ActionTypes.SET_SKJEMA;
  payload: IOverføringPunchSkjema;
}

interface ISendInnSkjemaAction {
  type: ActionTypes.SENDER_INN_SKJEMA;
  payload: IOverføringPunchSkjema;
}

interface ISkjemaErSendtInnAction {
  type: ActionTypes.SKJEMA_ER_SENDT_INN;
}

interface IInnsendingsfeilAction {
  type: ActionTypes.INNSENDINGSFEIL;
  payload: IError;
}

type Actions =
  | ISetSkjemaAction
  | ISendInnSkjemaAction
  | IInnsendingsfeilAction
  | ISkjemaErSendtInnAction;

export const setSkjema = (
  skjema: IOverføringPunchSkjema
): ISetSkjemaAction => ({
  type: ActionTypes.SET_SKJEMA,
  payload: skjema,
});

export const senderInnSkjema = () => ({
  type: ActionTypes.SENDER_INN_SKJEMA,
});

export const skjemaErSendtInn = () => ({
  type: ActionTypes.SKJEMA_ER_SENDT_INN,
});

export const innsendingsfeil = (error: IError): IInnsendingsfeilAction => ({
  type: ActionTypes.INNSENDINGSFEIL,
  payload: error,
});

interface IOverførDagerDTO {
  søknad: IOverføringPunchSkjema;
  journalpostId: string;
}

export const sendInnSkjema = (skjema: IOverføringPunchSkjema) => (
  dispatch: Dispatch,
  state: () => RootStateType
) => {
  dispatch(senderInnSkjema());

  const postBody = {
    journalpostId: state().punchState.journalpost!.journalpostId,
    søknad: skjema,
  };
  post<IOverførDagerDTO>(
    ApiPath.OMS_OVERFØR_DAGER,
    undefined,
    undefined,
    postBody,
    // @ts-ignore
    (response) => {
      switch (response.status) {
        case 202:
          return dispatch(skjemaErSendtInn());
        default:
          return dispatch(innsendingsfeil(convertResponseToError(response)));
      }
    }
  );
};

const initialState: IOverføringPunchState = {
  skjema: {
    identitetsnummer: null,
    arbeidssituasjon: {
      erArbeidstaker: false,
      erFrilanser: false,
      erSelvstendigNæringsdrivende: false,
      metaHarFeil: null,
    },
    omsorgenDelesMed: {
      identitetsnummer: '',
      antallOverførteDager: 0,
      mottaker: null,
      samboerSiden: null,
    },
    aleneOmOmsorgen: null,
    barn: [
      {
        identitetsnummer: null,
      },
    ],
    mottaksdato: null,
  },
  innsendingsstatus: Innsendingsstatus.IkkeSendtInn,
};

export default function overføringPunchReducer(
  state: IOverføringPunchState = initialState,
  action: Actions
): IOverføringPunchState {
  switch (action.type) {
    case ActionTypes.SET_SKJEMA:
      return {
        ...state,
        skjema: action.payload,
      };
    case ActionTypes.SENDER_INN_SKJEMA:
      return {
        ...state,
        innsendingsstatus: Innsendingsstatus.SenderInn,
      };
    case ActionTypes.SKJEMA_ER_SENDT_INN:
      return {
        ...state,
        innsendingsstatus: Innsendingsstatus.SendtInn,
      };
    case ActionTypes.INNSENDINGSFEIL:
      return {
        ...state,
        innsendingsstatus: Innsendingsstatus.Innsendingsfeil,
        innsendingsfeil: action.payload,
      };
    default:
      return state;
  }
}
