import {combineReducers} from "redux";
import PunchReducer from "./reducers/PunchReducer";

export const rootReducer = combineReducers({
    punchState: PunchReducer
});

export type RootStateType = ReturnType<typeof rootReducer>;