import { DokumenttypeForkortelse } from 'app/models/enums/FordelingDokumenttype';

export interface RegistreringsValgParams {
    journalpostid: string;
    søkerId: string;
    pleietrengendeId?: string | null;
    annenPart?: string | null;
    k9saksnummer?: string;
}

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

    // Laste tilstander
    isEksisterendeSoknaderLoading: boolean;
    isCreatingSoknad: boolean;

    // Feil
    eksisterendeSoknaderError: Error | null;
    createSoknadError: Error | null;

    // Funksjoner
    createSoknad: () => void;
    kanStarteNyRegistrering: () => boolean;

    // Parametere
    journalpostid: string;
    søkerId: string;
    pleietrengendeId?: string | null;
    annenPart?: string | null;
    k9saksnummer?: string;
}
