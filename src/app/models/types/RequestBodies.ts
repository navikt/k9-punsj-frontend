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
}

export interface IOpprettSoknad {
    norskIdent: string;
    journalpostId: string;
    barnIdent: string | null;
}

export interface IKopierJournalpost {
    dedupKey: string;
    fra: string;
    til: string;
    barn: string;
}
