import { DokumenttypeForkortelse } from 'app/models/enums';
import Fagsak from 'app/types/Fagsak';

import { normalizeK9saksnummer, resolveK9saksnummer } from './k9saksnummerUtils';

type FordelingK9saksnummerSource = NonNullable<Parameters<typeof resolveK9saksnummer>[0]>;
type JournalpostK9saksnummerSource = NonNullable<Parameters<typeof resolveK9saksnummer>[1]>;

const createFagsak = (fagsakId: string): Fagsak => ({
    fagsakId,
    sakstype: DokumenttypeForkortelse.PSB,
    gyldigPeriode: { fom: '', tom: '' },
});

const createFordelingSource = (fagsakId: string): FordelingK9saksnummerSource => ({
    fagsak: createFagsak(fagsakId),
});

const createJournalpostSource = (
    fagsakId: string,
    erFerdigstilt?: boolean,
): JournalpostK9saksnummerSource => ({
    erFerdigstilt,
    sak: createFagsak(fagsakId),
});

describe('k9saksnummerUtils', () => {
    describe('normalizeK9saksnummer', () => {
        it('returns trimmed saksnummer', () => {
            expect(normalizeK9saksnummer('  ABC123  ')).toBe('ABC123');
        });

        it('returns undefined for blank values', () => {
            expect(normalizeK9saksnummer('   ')).toBeUndefined();
            expect(normalizeK9saksnummer(undefined)).toBeUndefined();
            expect(normalizeK9saksnummer(null)).toBeUndefined();
        });
    });

    describe('resolveK9saksnummer', () => {
        it('uses fordeling fagsak before journalpost sak', () => {
            expect(
                resolveK9saksnummer(
                    createFordelingSource('FORDELING'),
                    createJournalpostSource('JOURNALPOST', false),
                ),
            ).toBe('FORDELING');
        });

        it('uses journalpost sak before fordeling fagsak for ferdigstilt journalpost', () => {
            expect(
                resolveK9saksnummer(
                    createFordelingSource('FORDELING'),
                    createJournalpostSource('JOURNALPOST', true),
                ),
            ).toBe('JOURNALPOST');
        });

        it('falls back to journalpost sak when fordeling fagsak is missing', () => {
            expect(resolveK9saksnummer(undefined, createJournalpostSource('JOURNALPOST'))).toBe('JOURNALPOST');
        });

        it('falls back to søknad k9saksnummer when state sources are missing', () => {
            expect(resolveK9saksnummer(undefined, undefined, { k9saksnummer: ' SOKNAD ' })).toBe('SOKNAD');
        });

        it('ignores blank values when resolving', () => {
            expect(
                resolveK9saksnummer(
                    createFordelingSource('   '),
                    createJournalpostSource(' JOURNALPOST '),
                ),
            ).toBe('JOURNALPOST');
        });
    });
});
