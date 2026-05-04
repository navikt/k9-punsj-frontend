import { IFordelingState, IJournalpost } from 'app/models/types';
import { IError } from 'app/models/types/Error';

export const manglerK9saksnummerMessage = 'Mangler saksnummer for opprettelse av søknad.';

export const normalizeK9saksnummer = (k9saksnummer?: string | null): string | undefined => {
    const normalized = k9saksnummer?.trim();
    return normalized ? normalized : undefined;
};

export const resolveK9saksnummer = (
    fordelingState?: Pick<IFordelingState, 'fagsak'>,
    journalpost?: Pick<IJournalpost, 'sak'>,
): string | undefined =>
    normalizeK9saksnummer(fordelingState?.fagsak?.fagsakId) ||
    normalizeK9saksnummer(journalpost?.sak?.fagsakId);

export const createManglerK9saksnummerError = (): IError => ({
    status: 400,
    statusText: manglerK9saksnummerMessage,
    message: manglerK9saksnummerMessage,
});
