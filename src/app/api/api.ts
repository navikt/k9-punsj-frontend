import { ApiPath } from 'app/apiConfig';
import { get, post } from 'app/utils';
import { ArbeidsgivereResponse } from '../models/types/ArbeidsgivereResponse';

export const finnArbeidsgivere = (
    søkerId: string,
    callback?: (response: Response, data: ArbeidsgivereResponse) => void,
    fom?: string,
    tom?: string
): Promise<Response> => {
    if (fom && tom) {
        return get(
            `${ApiPath.FINN_ARBEIDSGIVERE}?fom=${fom}&tom=${tom}`,
            { norskIdent: søkerId },
            { 'X-Nav-NorskIdent': søkerId },
            callback
        );
    }
    return get(ApiPath.FINN_ARBEIDSGIVERE, { norskIdent: søkerId }, { 'X-Nav-NorskIdent': søkerId }, callback);
};

export const settJournalpostPaaVent = (journalpostid: string, soeknadId: string): Promise<Error | void> =>
    post(ApiPath.JOURNALPOST_SETT_PAA_VENT, { journalpostId: journalpostid }, undefined, { soeknadId }).then(
        (response) => {
            if (!response.ok) {
                throw Error('Det oppstod en feil når journalpost skulle settes på vent.');
            }
        }
    );
