import { FordelingDokumenttype, Sakstype } from 'app/models/enums';
import { IError } from 'app/models/types/Error';
import Fagsak from 'app/types/Fagsak';

export interface IGosysGjelderKategorier {
    [key: string]: string;
}

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
    isAwaitingGosysGjelderResponse?: boolean;
    gosysGjelderKategorier?: IGosysGjelderKategorier;
    gosysGjelderKategorierError?: IError;
    valgtGosysKategori: string;
    fagsak?: Fagsak;
}
