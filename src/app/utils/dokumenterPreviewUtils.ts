import { ApiPath } from 'app/apiConfig';
import { IDokumentInfo, IJournalpostInfo } from 'app/models/types';
import { apiUrl } from './apiUtils';

export interface IDokUrlParametre {
    journalpostId: string;
    dokumentId: string;
}

const pdfUrl = (dokUrlParametre: IDokUrlParametre) => apiUrl(ApiPath.DOKUMENT, dokUrlParametre);

const getDokUrlParametreFraJournalposter = (
    journalposter: string[],
    alleJournalposterPerIdent: IJournalpostInfo[],
): IDokUrlParametre[] =>
    journalposter.flatMap((jp) => {
        const journalpost = alleJournalposterPerIdent.find((jpost) => jpost.journalpostId === jp);
        if (journalpost?.dokumenter) {
            return journalpost.dokumenter.map((dok: IDokumentInfo) => ({
                journalpostId: journalpost.journalpostId,
                dokumentId: dok.dokument_id,
            }));
        }
        return [];
    });

export const dokumenterPreviewUtils = {
    pdfUrl,
    getDokUrlParametreFraJournalposter,
};
