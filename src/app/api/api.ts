import { ApiPath } from 'app/apiConfig';
import { DokumenttypeForkortelse } from 'app/models/enums';
import { IPeriode } from 'app/models/types';
import Fagsak from 'app/types/Fagsak';
import { get, post } from 'app/utils';
import { ArbeidsgivereResponse } from '../models/types/ArbeidsgivereResponse';

export const finnArbeidsgivere = (
    søkerId: string,
    callback?: (response: Response, data: ArbeidsgivereResponse) => void,
    fom?: string,
    tom?: string,
): Promise<Response> => {
    if (fom && tom) {
        return get(
            `${ApiPath.FINN_ARBEIDSGIVERE}?fom=${fom}&tom=${tom}`,
            { norskIdent: søkerId },
            { 'X-Nav-NorskIdent': søkerId },
            callback,
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
        },
    );
export const postBehandlingsAar = (
    journalpostid: string,
    søkerId: string,
    behandlingsAar?: string,
): Promise<Error | void> =>
    post(
        ApiPath.JOURNALPOST_SETT_BEHANDLINGSÅR,
        { journalpostId: journalpostid },
        { 'X-Nav-NorskIdent': søkerId },
        { behandlingsAar },
    ).then((response) => {
        if (!response.ok) {
            throw Error('Det oppstod en feil.');
        }
    });

export const hentBarn = (norskIdent: string): Promise<Error | Response> =>
    get(ApiPath.BARN_GET, { norskIdent }, { 'X-Nav-NorskIdent': norskIdent });
export const finnFagsaker = (søkersFødselsnummer: string, callback: (response: Response, data: Fagsak[]) => void) =>
    get(ApiPath.HENT_FAGSAK_PÅ_IDENT, undefined, { 'X-Nav-NorskIdent': søkersFødselsnummer }, callback);

export const klassifiserDokument = (body: {
    brukerIdent: string;
    barnIdent?: string;
    journalpostId: string;
    fagsakYtelseTypeKode?: DokumenttypeForkortelse;
    periode?: IPeriode;
    saksnummer?: string;
}) =>
    post(ApiPath.JOURNALPOST_MOTTAK, undefined, { 'X-Nav-NorskIdent': body.brukerIdent }, body).then(
        async (response) => {
            if (!response.ok) {
                throw Error('Det oppstod en feil.');
            }
        },
    );
