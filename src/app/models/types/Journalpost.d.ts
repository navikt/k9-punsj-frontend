export interface IJournalpost {
    journalpost_id: string,
    norsk_ident?: string,
    dokumenter: IDokument[];
}

interface IDokument {
    dokument_id: string;
}