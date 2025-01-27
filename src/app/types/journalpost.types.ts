export interface IJournalpostForm {
    søkersFødselsnummer: string;
    fagsakId: string;
    tittel: string;
    notat: string;
}

export interface IJournalpostRequest {
    søkerIdentitetsnummer: string;
    fagsakId: string;
    tittel: string;
    notat: string;
}

export interface IJournalpostResponse {
    journalpostId: string;
}
