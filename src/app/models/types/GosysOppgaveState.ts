import {IError} from "./Error";

export interface IGosysOppgaveState {
    isAwaitingGosysOppgaveRequestResponse: boolean;
    gosysOppgaveRequestSuccess?: boolean;
    gosysOppgaveRequestError?: IError;
}
