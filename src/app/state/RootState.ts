import { combineReducers } from 'redux';
import {
  AuthReducer,
  FordelingReducer,
  MapperOgFagsakerReducer,
  PunchFormReducer,
  PunchReducer,
  SignaturReducer,
} from './reducers';
import { ISakstypePunch } from '../models/Sakstype';
import { OmsorgspengerOverføring } from '../containers/SakstypeImpls';

const defaultReducers = {
  authState: AuthReducer,
  fordelingState: FordelingReducer,
  mapperOgFagsakerState: MapperOgFagsakerReducer,
  punchFormState: PunchFormReducer,
  punchState: PunchReducer,
  signaturState: SignaturReducer,
};

const lagReducerForSakstype = (sakstype: ISakstypePunch) => {
  return sakstype.steps.reduce((temp, step) => {
    if (step.reducer) {
      temp[step.stepName] = step.reducer;
    }
    return temp;
  }, {});
};

export const leggTilSakstypeReducers = (sakstyper: ISakstypePunch[]) =>
  sakstyper.reduce((tempReducer, sakstype) => {
    tempReducer[sakstype.navn] = combineReducers(
      lagReducerForSakstype(sakstype)
    );
    return tempReducer;
  }, defaultReducers);

export const rootReducer = combineReducers(
  leggTilSakstypeReducers([OmsorgspengerOverføring])
);

export type RootStateType = ReturnType<typeof rootReducer>;
