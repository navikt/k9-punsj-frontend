export interface IJournalpost {
    journalpostId: string,
    norskIdent?: string,
    dokumenter: IDokument[];
    dato?: string;
}

export interface IDokument {
    dokumentId: string;
}
