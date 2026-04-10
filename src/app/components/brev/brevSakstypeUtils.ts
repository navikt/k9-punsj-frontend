import { DokumenttypeForkortelse, FordelingDokumenttype } from 'app/models/enums';
import { getForkortelseFraFordelingDokumenttype } from 'app/utils';

const uavklarteSakstyper = new Set<string>([
    DokumenttypeForkortelse.IKKE_DEFINERT,
    DokumenttypeForkortelse.UKJENT,
]);

export const erUavklartSakstypeForBrev = (sakstype?: string | null): boolean =>
    !sakstype || uavklarteSakstyper.has(sakstype);

export const finnSakstypeFraValgtDokumenttypeForBrev = (
    dokumenttype?: FordelingDokumenttype,
): DokumenttypeForkortelse | undefined => {
    if (!dokumenttype || dokumenttype === FordelingDokumenttype.OMSORGSPENGER) {
        return undefined;
    }

    return getForkortelseFraFordelingDokumenttype(dokumenttype);
};

export const utledSakstypeForBehandletJournalpostBrev = ({
    journalpostSakstype,
    dokumenttype,
}: {
    journalpostSakstype?: string | null;
    dokumenttype?: FordelingDokumenttype;
}): string | undefined => {
    if (journalpostSakstype && !erUavklartSakstypeForBrev(journalpostSakstype)) {
        return journalpostSakstype;
    }

    return finnSakstypeFraValgtDokumenttypeForBrev(dokumenttype);
};
