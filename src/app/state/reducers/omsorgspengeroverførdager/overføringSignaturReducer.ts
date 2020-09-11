import { ISignaturSkjema } from '../../../models/forms/omsorgspenger/overføring/SignaturSkjema';

interface IOverføringSignaturState {
  skjema: ISignaturSkjema;
}

enum ActionTypes {
  SET_SKJEMA = 'OVERFØRING/SIGNATUR/SET_SKJEMA',
  SLETT_SKJEMA = 'OVERFØRING/SIGNATUR/SLETT_SKJEMA',
}

interface ISetSkjemaAction {
  type: ActionTypes.SET_SKJEMA;
  payload: ISignaturSkjema;
}

interface ISlettSkjemaAction {
  type: ActionTypes.SLETT_SKJEMA;
}

export const setSkjema = (skjema: ISignaturSkjema) => ({
  type: ActionTypes.SET_SKJEMA,
  payload: skjema,
});

export const slettSkjema = () => ({
  type: ActionTypes.SLETT_SKJEMA,
});

const initialState: IOverføringSignaturState = {
  skjema: { fødselsnummer: '', signert: null },
};

export default function overføringSignaturReducer(
  state: IOverføringSignaturState = initialState,
  action: ISetSkjemaAction | ISlettSkjemaAction
): IOverføringSignaturState {
  switch (action.type) {
    case ActionTypes.SET_SKJEMA:
      return {
        ...state,
        skjema: action.payload,
      };
    case ActionTypes.SLETT_SKJEMA:
      return initialState;
    default:
      return state;
  }
}
