import { normalizeK9saksnummer, resolveK9saksnummer } from './k9saksnummerUtils';

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
                    { fagsak: { fagsakId: 'FORDELING', sakstype: 'PSB' } as any },
                    { erFerdigstilt: false, sak: { fagsakId: 'JOURNALPOST', sakstype: 'PSB' } as any },
                ),
            ).toBe('FORDELING');
        });

        it('uses journalpost sak before fordeling fagsak for ferdigstilt journalpost', () => {
            expect(
                resolveK9saksnummer(
                    { fagsak: { fagsakId: 'FORDELING', sakstype: 'PSB' } as any },
                    { erFerdigstilt: true, sak: { fagsakId: 'JOURNALPOST', sakstype: 'PSB' } as any },
                ),
            ).toBe('JOURNALPOST');
        });

        it('falls back to journalpost sak when fordeling fagsak is missing', () => {
            expect(resolveK9saksnummer(undefined, { sak: { fagsakId: 'JOURNALPOST', sakstype: 'PSB' } as any })).toBe(
                'JOURNALPOST',
            );
        });

        it('falls back to søknad k9saksnummer when state sources are missing', () => {
            expect(resolveK9saksnummer(undefined, undefined, { k9saksnummer: ' SOKNAD ' })).toBe('SOKNAD');
        });

        it('ignores blank values when resolving', () => {
            expect(
                resolveK9saksnummer(
                    { fagsak: { fagsakId: '   ', sakstype: 'PSB' } as any },
                    { sak: { fagsakId: ' JOURNALPOST ', sakstype: 'PSB' } as any },
                ),
            ).toBe('JOURNALPOST');
        });
    });
});
