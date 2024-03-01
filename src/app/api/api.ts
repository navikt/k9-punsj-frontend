import { ApiPath } from 'app/apiConfig';
import { DokumenttypeForkortelse } from 'app/models/enums';
import { IPeriode } from 'app/models/types';
import Fagsak from 'app/types/Fagsak';
import { get, post } from 'app/utils';
import { ArbeidsgivereResponse } from '../models/types/ArbeidsgivereResponse';
import sakstyper from 'app/constants/sakstyper';

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
    pleietrengendeIdent?: string;
    journalpostId: string;
    fagsakYtelseTypeKode?: DokumenttypeForkortelse;
    periode?: IPeriode;
    saksnummer?: string;
}) =>
    post(ApiPath.JOURNALPOST_MOTTAK, undefined, { 'X-Nav-NorskIdent': body.brukerIdent }, body).then(
        async (response) => {
            if (!response.ok) {
                const responseBody = await response.json();
                const feil = responseBody.detail || responseBody.feil || responseBody.message || 'Det oppstod en feil.';
                throw Error(feil);
            }
            const responseBody = await response.json();
            return responseBody;
        },
    );

export const lukkJournalpostEtterKopiering = (journalpostid: string, soekersIdent: string, fagsak?: Fagsak) =>
    post(ApiPath.JOURNALPOST_LUKK_OPPGAVE, { journalpostId: journalpostid }, undefined, {
        norskIdent: soekersIdent,
        sak: fagsak?.fagsakId
            ? { fagsakId: fagsak.fagsakId, sakstype: sakstyper.FAGSAK }
            : { sakstype: sakstyper.GENERELL_SAK },
    }).then(async (response) => {
        if (!response.ok) {
            const responseBody = await response.json();
            const feil = responseBody.detail || responseBody.feil || responseBody.message || 'Det oppstod en feil.';
            throw Error(feil);
        }
        const responseBody = await response.json();
        return responseBody;
    });
