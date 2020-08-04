export interface IJournalpost {
    journalpostId: string,
    norskIdent?: string,
    dokumenter: IDokument[];
}

export interface IDokument {
    dokumentId: string;
}
