import { IError } from 'app/models/types';

interface FordelingSettPåVentState {
    settPaaVentError?: IError;
    settPaaVentSuccess?: boolean;
}

export default FordelingSettPåVentState;
