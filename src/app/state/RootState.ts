import {combineReducers}                                                      from 'redux';
import {AuthReducer, MapperOgFagsakerReducer, PunchFormReducer, PunchReducer} from './reducers';

export const rootReducer = combineReducers({
    authState: AuthReducer,
    mapperOgFagsakerState: MapperOgFagsakerReducer,
    punchFormState: PunchFormReducer,
    punchState: PunchReducer
});

export type RootStateType = ReturnType<typeof rootReducer>;