import journalpostStatus from 'app/models/enums/JournalpostStatus';

export interface IJournalpost {
    journalpostId: string;
    norskIdent?: string;
    dokumenter: IDokument[];
    dato?: string;
    punsjInnsendingType?: {
        kode: string;
        navn: string;
        erScanning: boolean;
    };
    journalpostStatus: journalpostStatus;
    kanKopieres?: boolean;
    kanOpprettesJournalføringsoppgave?: boolean;
    kanSendeInn: boolean;
    erSaksbehandler: boolean;
}

export interface IDokument {
    dokumentId: string;
}

export interface IDokumentInfo {
    // eslint-disable-next-line camelcase
    dokument_id: string;
}

export interface IJournalpostInfo {
    journalpostId: string;
    dato: string;
    dokumenter: IDokumentInfo[];
    klokkeslett?: string;
    punsjInnsendingType: IInnsendingType;
}

export interface IInnsendingType {
    kode: string;
    navn: string;
    erScanning: boolean;
}
