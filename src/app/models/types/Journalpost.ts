export interface IJournalpost {
    journalpostId: string,
    norskIdent?: string,
    dokumenter: IDokument[];
}

interface IDokument {
    dokumentId: string;
}