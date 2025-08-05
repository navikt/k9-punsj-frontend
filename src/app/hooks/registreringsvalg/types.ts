import { DokumenttypeForkortelse } from 'app/models/enums/FordelingDokumenttype';
import { IJournalpostInfo } from 'app/models/types/Journalpost/Journalpost';

export interface RegistreringsValgParams {
    journalpostid: string;
    søkerId: string;
    pleietrengendeId?: string | null;
    annenPart?: string | null;
    k9saksnummer?: string;
}

// Hjelpefunksjon for å sjekke om søknadstype bruker annenPart
export const brukerAnnenPart = (soknadType: DokumenttypeForkortelse): boolean => {
    return soknadType === DokumenttypeForkortelse.OMP_MA;
};

// Hjelpefunksjon for å sjekke om søknadstype trenger pleietrengendeId
export const trengerPleietrengendeId = (soknadType: DokumenttypeForkortelse): boolean => {
    return [
        DokumenttypeForkortelse.PSB,
        DokumenttypeForkortelse.PPN,
        DokumenttypeForkortelse.OMP_AO,
        DokumenttypeForkortelse.OMP_KS,
        DokumenttypeForkortelse.OLP,
    ].includes(soknadType);
};

// Hjelpefunksjon for å sjekke om søknadstype ikke trenger noen ekstra ident-felt
export const trengerIkkeEkstraIdent = (soknadType: DokumenttypeForkortelse): boolean => {
    return soknadType === DokumenttypeForkortelse.OMP_UT;
};

export interface SoknadConfig {
    type: DokumenttypeForkortelse;
    eksisterendeSoknaderPath: string;
    createSoknadPath: string;
    queryKey: string;
}

export interface RegistreringsValgResult {
    // Data
    eksisterendeSoknader: any;
    søknader: any[];
    journalposter: IJournalpostInfo[];

    // Laste tilstander
    isEksisterendeSoknaderLoading: boolean;
    isJournalposterLoading: boolean;
    isCreatingSoknad: boolean;

    // Feil
    eksisterendeSoknaderError: Error | null;
    journalposterError: Error | null;
    createSoknadError: Error | null;

    // Funksjoner
    createSoknad: () => void;
    kanStarteNyRegistrering: () => boolean;
    handleTilbake: () => void;

    // Parametere
    journalpostid: string;
    søkerId: string;
    pleietrengendeId?: string | null;
    annenPart?: string | null;
    k9saksnummer?: string;
}
