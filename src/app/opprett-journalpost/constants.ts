import { IOpprettJournalpostForm } from './types';

export const JOURNALPOST_DEFAULT_VALUES: IOpprettJournalpostForm = {
    søkerIdentitetsnummer: '',
    fagsakId: '',
    tittel: '',
    notat: '',
};

export const ERROR_MESSAGES = {
    søkerIdentitetsnummer: 'Fødselsnummer må være 11 siffer',
    fagsakId: 'Vennligst velg en fagsak',
    tittel: 'Tittel er påkrevd og kan ikke være lengre enn 200 tegn',
    notat: 'Notat er påkrevd og kan ikke være lengre enn 100000 tegn',
    henteFagsak: 'Kunne ikke hente fagsaker',
    opprettJournalpost: 'Kunne ikke opprette journalpost',
} as const;
