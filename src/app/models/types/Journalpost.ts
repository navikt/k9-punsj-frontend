export interface IJournalpost {
    journalpostId: string,
    norskIdent?: string,
    dokumenter: IDokument[];
    dato?: string;
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
}
