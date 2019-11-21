import {combineReducers}                             from 'redux';
import {AuthReducer, PunchFormReducer, PunchReducer} from './reducers';

export const rootReducer = combineReducers({
    authState: AuthReducer,
    punchFormState: PunchFormReducer,
    punchState: PunchReducer
});

export type RootStateType = ReturnType<typeof rootReducer>;