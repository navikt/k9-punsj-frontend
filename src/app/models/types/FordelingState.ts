import {Sakstype} from 'app/models/enums';
import {IError}   from 'app/models/types/Error';

export interface IFordelingState {
    sakstype?: Sakstype;
    erIdent1Bekreftet: boolean;
    omfordelingDone: boolean;
    isAwaitingOmfordelingResponse: boolean;
    omfordelingError?: IError;
    isAwaitingSjekkTilK9Response: boolean,
    sjekkTilK9Error?: IError,
    sjekkTilK9JournalpostStottesIkke?: boolean;
    isAwaitingLukkOppgaveResponse: boolean,
    lukkOppgaveError?: IError,
    lukkOppgaveDone: boolean,
    skalTilK9?: boolean
}

