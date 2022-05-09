export interface IHentSoknad {
    norskIdent: string;
    periode?: ISoknadPeriode;
}

export interface ISoknadPeriode {
    fom?: string;
    tom?: string;
}

export class SoknadPeriode implements Required<ISoknadPeriode> {
    fom: string;

    tom: string;

    constructor(periode: ISoknadPeriode) {
        this.fom = periode.fom || '';
        this.tom = periode.tom || '';
    }
}

export interface IHentPerioder {
    brukerIdent: string;
    barnIdent: string;
}

export interface ISkalTilK9 {
    brukerIdent: string;
    barnIdent: string;
    journalpostId: string;
    fagsakYtelseType: FagsakYtelseType | undefined;
}

export enum FagsakYtelseType {
    PLEIEPENGER_SYKT_BARN = 'PSB',
    PLEIEPENGER_NÆRSTÅENDE = 'PPN',
    OMSORGSPENGER = 'OMP',
    OMSORGSPENGER_KS = 'OMP_KS',
    OMSORGSPENGER_MA = 'OMP_MA',
    OMSORGSPENGER_AO = 'OMP_AO',
    OPPLÆRINGSPENGER = 'OLP',
}

export interface IOpprettSoknad {
    norskIdent: string;
    journalpostId: string;
    pleietrengendeIdent: string | null;
    barnIdent: string | null;
}

export interface IKopierJournalpost {
    dedupKey: string;
    fra: string;
    til: string;
    barn: string;
}
