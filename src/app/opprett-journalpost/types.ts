export enum OpprettJournalpostFormKeys {
    søkerIdentitetsnummer = 'søkerIdentitetsnummer',
    fagsakId = 'fagsakId',
    tittel = 'tittel',
    notat = 'notat',
}

export interface IOpprettJournalpostForm {
    søkerIdentitetsnummer: string;
    fagsakId: string;
    tittel: string;
    notat: string;
}

export interface IOpprettJournalpostResponse {
    journalpostId: string;
}
