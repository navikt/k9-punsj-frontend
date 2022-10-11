import { Sakstype, FordelingDokumenttype } from 'app/models/enums';
import { IError } from 'app/models/types/Error';
import Fagsak from 'app/types/Fagsak';

export interface IFordelingState {
    sakstype?: Sakstype;
    dokumenttype?: FordelingDokumenttype;
    erIdent1Bekreftet: boolean;
    omfordelingDone: boolean;
    isAwaitingOmfordelingResponse: boolean;
    omfordelingError?: IError;
    isAwaitingSjekkTilK9Response: boolean;
    sjekkTilK9Error?: IError;
    sjekkTilK9JournalpostStottesIkke?: boolean;
    isAwaitingLukkOppgaveResponse: boolean;
    lukkOppgaveError?: IError;
    lukkOppgaveDone: boolean;
    skalTilK9?: boolean;
    kanIkkeGaaTilK9: string[];
    isAwaitingGosysGjelderResponse?: boolean;
    gosysGjelderKategorier?: any[];
    gosysGjelderKategorierError?: IError;
    valgtGosysKategori: string;
    fagsak?: Fagsak;
}
