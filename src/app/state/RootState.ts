import {combineReducers} from "redux";
import {PunchFormReducer, PunchReducer} from "./reducers";

export const rootReducer = combineReducers({
    punchFormState: PunchFormReducer,
    punchState: PunchReducer
});

export type RootStateType = ReturnType<typeof rootReducer>;