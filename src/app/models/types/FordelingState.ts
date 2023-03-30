import { FordelingDokumenttype, Sakstype } from 'app/models/enums';
import { IError } from 'app/models/types/Error';
import Fagsak from 'app/types/Fagsak';

export interface IFordelingState {
    sakstype?: Sakstype;
    dokumenttype?: FordelingDokumenttype;
    erSøkerIdBekreftet: boolean;
    omfordelingDone: boolean;
    isAwaitingOmfordelingResponse: boolean;
    omfordelingError?: IError;
    isAwaitingLukkOppgaveResponse: boolean;
    lukkOppgaveError?: IError;
    lukkOppgaveDone: boolean;
    kanIkkeGaaTilK9: string[];
    isAwaitingGosysGjelderResponse?: boolean;
    gosysGjelderKategorier?: any[];
    gosysGjelderKategorierError?: IError;
    valgtGosysKategori: string;
    fagsak?: Fagsak;
}
