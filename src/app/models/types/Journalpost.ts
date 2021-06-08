export interface IJournalpost {
    journalpostId: string,
    norskIdent?: string,
    dokumenter: IDokument[];
    dato?: string;
    punsjInnsendingType? : {
        kode: string;
        navn: string;
        erScanning: boolean;
    }
}

export interface IDokument {
    dokumentId: string;
}

export interface IDokumentInfo {
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
    erScanning: boolean
}
