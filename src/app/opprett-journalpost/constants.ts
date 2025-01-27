import { IJournalpostForm } from 'app/types/journalpost.types';

export const JOURNALPOST_DEFAULT_VALUES: IJournalpostForm = {
    søkersFødselsnummer: '',
    fagsakId: '',
    tittel: '',
    notat: '',
};

export const VALIDATION_RULES = {
    søkersFødselsnummer: {
        required: true,
        minLength: 11,
        maxLength: 11,
    },
    fagsakId: {
        required: true,
    },
    tittel: {
        required: true,
        maxLength: 200,
    },
    notat: {
        required: true,
        maxLength: 100000,
    },
} as const;

export const ERROR_MESSAGES = {
    søkersFødselsnummer: 'Fødselsnummer må være 11 siffer',
    fagsakId: 'Vennligst velg en fagsak',
    tittel: 'Tittel er påkrevd og kan ikke være lengre enn 200 tegn',
    notat: 'Notat er påkrevd og kan ikke være lengre enn 100000 tegn',
    henteFagsak: 'Kunne ikke hente fagsaker',
    opprettJournalpost: 'Kunne ikke opprette journalpost',
} as const;
