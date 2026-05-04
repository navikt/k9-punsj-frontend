import { IFordelingState, IJournalpost } from 'app/models/types';
import { IError } from 'app/models/types/Error';

export const manglerK9saksnummerMessage = 'Mangler saksnummer for opprettelse av søknad.';

export const normalizeK9saksnummer = (k9saksnummer?: string | null): string | undefined => {
    const normalized = k9saksnummer?.trim();
    return normalized ? normalized : undefined;
};

export const resolveK9saksnummer = (
    fordelingState?: Pick<IFordelingState, 'fagsak'>,
    journalpost?: Pick<IJournalpost, 'sak' | 'erFerdigstilt'>,
    soknad?: { k9saksnummer?: string | null },
): string | undefined => {
    const fordelingK9saksnummer = normalizeK9saksnummer(fordelingState?.fagsak?.fagsakId);
    const journalpostK9saksnummer = normalizeK9saksnummer(journalpost?.sak?.fagsakId);
    const soknadK9saksnummer = normalizeK9saksnummer(soknad?.k9saksnummer);

    if (journalpost?.erFerdigstilt) {
        return journalpostK9saksnummer || soknadK9saksnummer || fordelingK9saksnummer;
    }

    return fordelingK9saksnummer || journalpostK9saksnummer || soknadK9saksnummer;
};

export const createManglerK9saksnummerError = (): IError => ({
    status: 400,
    statusText: manglerK9saksnummerMessage,
    message: manglerK9saksnummerMessage,
});
