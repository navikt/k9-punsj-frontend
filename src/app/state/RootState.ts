import { combineReducers } from 'redux';
import {
  AuthReducer,
  FordelingReducer, GosysOppgaveReducer,
  MapperOgFagsakerReducer,
  PunchFormReducer,
  PunchReducer,
  SignaturReducer,
} from './reducers';
import FellesReducer from './reducers/FellesReducer';
import { Sakstype } from '../models/enums';
import overføringSignaturReducer from './reducers/omsorgspengeroverførdager/overføringSignaturReducer';
import overføringPunchReducer from './reducers/omsorgspengeroverførdager/overføringPunchReducer';

export const rootReducer = combineReducers({
  [Sakstype.PLEIEPENGER_SYKT_BARN]: combineReducers({
    mapperOgFagsakerState: MapperOgFagsakerReducer,
    punchFormState: PunchFormReducer,
    punchState: PunchReducer,
    signaturState: SignaturReducer,
  }),
  [Sakstype.OMSORGSPENGER_OVERFØRING]: combineReducers({
    signatur: overføringSignaturReducer,
    punch: overføringPunchReducer,
  }),
  [Sakstype.OMSORGSPENGER_FORDELING]: combineReducers({
    opprettIGosys: GosysOppgaveReducer,
  }),

  fordelingState: FordelingReducer,
  authState: AuthReducer,
  felles: FellesReducer,
});

export type RootStateType = ReturnType<typeof rootReducer>;
