import { DokumenttypeForkortelse, FordelingDokumenttype } from 'app/models/enums';
import {
    erUavklartSakstypeForBrev,
    finnSakstypeFraValgtDokumenttypeForBrev,
    utledSakstypeForBehandletJournalpostBrev,
} from 'app/components/brev/brevSakstypeUtils';

describe('brevSakstypeUtils', () => {
    describe('erUavklartSakstypeForBrev', () => {
        it('returns true for missing or unresolved sakstype', () => {
            expect(erUavklartSakstypeForBrev(undefined)).toBe(true);
            expect(erUavklartSakstypeForBrev(null)).toBe(true);
            expect(erUavklartSakstypeForBrev(DokumenttypeForkortelse.IKKE_DEFINERT)).toBe(true);
            expect(erUavklartSakstypeForBrev(DokumenttypeForkortelse.UKJENT)).toBe(true);
        });

        it('returns false for supported sakstype', () => {
            expect(erUavklartSakstypeForBrev(DokumenttypeForkortelse.PSB)).toBe(false);
        });
    });

    describe('finnSakstypeFraValgtDokumenttypeForBrev', () => {
        it('returns undefined when dokumenttype is missing or too generic', () => {
            expect(finnSakstypeFraValgtDokumenttypeForBrev(undefined)).toBeUndefined();
            expect(finnSakstypeFraValgtDokumenttypeForBrev(FordelingDokumenttype.OMSORGSPENGER)).toBeUndefined();
        });

        it('returns sakstype for specific valgt dokumenttype', () => {
            expect(finnSakstypeFraValgtDokumenttypeForBrev(FordelingDokumenttype.PLEIEPENGER)).toBe(
                DokumenttypeForkortelse.PSB,
            );
        });
    });

    describe('utledSakstypeForBehandletJournalpostBrev', () => {
        it('prefers valid sakstype from journalpost', () => {
            expect(
                utledSakstypeForBehandletJournalpostBrev({
                    journalpostSakstype: DokumenttypeForkortelse.PPN,
                    dokumenttype: FordelingDokumenttype.PLEIEPENGER,
                }),
            ).toBe(DokumenttypeForkortelse.PPN);
        });

        it('falls back to valgt dokumenttype for unresolved journalpost sakstype', () => {
            expect(
                utledSakstypeForBehandletJournalpostBrev({
                    journalpostSakstype: DokumenttypeForkortelse.IKKE_DEFINERT,
                    dokumenttype: FordelingDokumenttype.PLEIEPENGER,
                }),
            ).toBe(DokumenttypeForkortelse.PSB);
        });

        it('returns undefined when journalpost sakstype is unresolved and no valid dokumenttype is selected', () => {
            expect(
                utledSakstypeForBehandletJournalpostBrev({
                    journalpostSakstype: DokumenttypeForkortelse.IKKE_DEFINERT,
                    dokumenttype: FordelingDokumenttype.OMSORGSPENGER,
                }),
            ).toBeUndefined();
        });
    });
});
