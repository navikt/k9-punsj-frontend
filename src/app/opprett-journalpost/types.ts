export enum OpprettJournalpostFormKeys {
    søkerIdentitetsnummer = 'søkerIdentitetsnummer',
    fagsakId = 'fagsakId',
    tittel = 'tittel',
    notat = 'notat',
}

export interface IOpprettJournalpostForm {
    [OpprettJournalpostFormKeys.søkerIdentitetsnummer]: string;
    [OpprettJournalpostFormKeys.fagsakId]: string;
    [OpprettJournalpostFormKeys.tittel]: string;
    [OpprettJournalpostFormKeys.notat]: string;
}

export interface IOpprettJournalpostResponse {
    journalpostId: string;
}
