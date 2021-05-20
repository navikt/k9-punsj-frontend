import {Sakstype} from 'app/models/enums';
import {IError}   from 'app/models/types/Error';

export interface IFordelingState {
    sakstype?: Sakstype;
    omfordelingDone: boolean;
    isAwaitingOmfordelingResponse: boolean;
    omfordelingError?: IError;
    isAwaitingSjekkTilK9Response: boolean,
    sjekkTilK9Error?: IError,
    isAwaitingLukkOppgaveResponse: boolean,
    lukkOppgaveError?: IError,
    lukkOppgaveDone: boolean,
    skalTilK9?: boolean
}

