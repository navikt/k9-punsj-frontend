import { ApiPath } from 'app/apiConfig';
import { get } from './apiUtils';

export const lukkDebuggJp = (journalpostid: string) =>
    get(ApiPath.JOURNALPOST_LUKK_DEBUGG, { journalpostId: journalpostid }).then((res) => res.status);
