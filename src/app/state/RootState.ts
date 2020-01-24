import {combineReducers} from 'redux';
import {
    AuthReducer,
    FordelingReducer,
    MapperOgFagsakerReducer,
    PunchFormReducer,
    PunchReducer,
    SignaturReducer
}                        from './reducers';

export const rootReducer = combineReducers({
    authState: AuthReducer,
    fordelingState: FordelingReducer,
    mapperOgFagsakerState: MapperOgFagsakerReducer,
    punchFormState: PunchFormReducer,
    punchState: PunchReducer,
    signaturState: SignaturReducer
});

export type RootStateType = ReturnType<typeof rootReducer>;