import { ApiPath } from 'app/apiConfig';
import { DokumenttypeForkortelse } from 'app/models/enums';
import { IJournalpost, IPeriode, Person } from 'app/models/types';
import Fagsak, { FagsakForSelect } from 'app/types/Fagsak';
import { get, post } from 'app/utils';
import { IAlleJournalposterPerIdent } from 'app/models/types/Journalpost/JournalposterPerIdentState';
import sakstyper from 'app/constants/sakstyper';
import { IKopierJournalpost } from 'app/models/types/RequestBodies';
import { ArbeidsgivereResponse } from '../models/types/ArbeidsgivereResponse';

export const finnArbeidsgivere = (
    søkerId: string,
    callback?: (response: Response, data: ArbeidsgivereResponse) => void,
    fom?: string,
    tom?: string,
): Promise<Response> => {
    if (fom && tom) {
        return get(
            `${ApiPath.FINN_ARBEIDSGIVERE}?inkluderAvsluttetArbeidsforhold=true&fom=${fom}&tom=${tom}`,
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

export const finnFagsaker = (
    søkersFødselsnummer: string,
    callback: (response: Response, data: FagsakForSelect[]) => void,
) => get(ApiPath.HENT_FAGSAK_PÅ_IDENT, undefined, { 'X-Nav-NorskIdent': søkersFødselsnummer }, callback);

export const klassifiserDokument = (body: {
    brukerIdent: string;
    pleietrengendeIdent?: string;
    journalpostId: string;
    fagsakYtelseTypeKode?: DokumenttypeForkortelse;
    periode?: IPeriode;
    saksnummer?: string;
    relatertPersonIdent?: string;
}) =>
    post(ApiPath.JOURNALPOST_MOTTAK, undefined, { 'X-Nav-NorskIdent': body.brukerIdent }, body).then(
        async (response) => {
            if (!response.ok) {
                let feil = '';
                try {
                    const responseBody = await response.json();
                    feil =
                        responseBody.detail ||
                        responseBody.feil ||
                        responseBody.message ||
                        'Det oppstod en feil ved klassifisering.';
                } catch (error) {
                    feil = 'Det oppstod en feil ved klassifisering.';
                }

                throw Error(feil);
            }
            const responseBody = await response.json();
            return responseBody;
        },
    );
// TODO: Check if this is the correct
export const lukkJournalpostEtterKopiering = (journalpostid: string, soekersIdent: string, fagsak?: Fagsak) =>
    post(ApiPath.JOURNALPOST_LUKK_OPPGAVE, { journalpostId: journalpostid }, undefined, {
        norskIdent: soekersIdent,
        sak: fagsak?.fagsakId
            ? { fagsakId: fagsak.fagsakId, sakstype: sakstyper.FAGSAK }
            : { sakstype: sakstyper.GENERELL_SAK },
    }).then(async (response) => {
        if (!response.ok) {
            let feil = '';
            try {
                const responseBody = await response.json();
                feil = responseBody.detail || responseBody.feil || responseBody.message || 'Det oppstod en feil.';
            } catch (error) {
                feil = 'Det oppstod en feil.';
            }
            throw Error(feil);
        }
    });

export const settJournalpostPaaVentUtenSøknadId = (journalpostid: string) =>
    post(ApiPath.JOURNALPOST_SETT_PAA_VENT, { journalpostId: journalpostid }, undefined, undefined).then(
        async (response) => {
            if (!response.ok) {
                let feil = '';
                try {
                    const responseBody = await response.json();
                    feil =
                        responseBody.detail ||
                        responseBody.feil ||
                        responseBody.message ||
                        'Det oppstod en feil når journalpost skulle settes på vent.';
                } catch (error) {
                    feil = 'Det oppstod en feil når journalpost skulle settes på vent.';
                }
                throw Error(feil);
            }
        },
    );

export const hentAlleJournalposterPerIdent = (norskIdent: string): Promise<IAlleJournalposterPerIdent> =>
    post(ApiPath.JOURNALPOST_HENT, undefined, { 'X-Nav-NorskIdent': norskIdent }, { norskIdent }).then((response) => {
        if (!response.ok) {
            throw Error('Det oppstod en feil under hent av alle journalposter per ident.');
        }
        return response.json();
    });

/* Kun for ytelser som har 2 søkere og pleietrengende
 * derfor brukes ikke annen part
 *
 * TODO: Endre navn, legge til andre parametere for andre ytelser
 */
export const kopierJournalpostNotRedux = (
    dedupKey: string,
    kopierTilIdent: string,
    journalPostID: string,
    ytelse?: DokumenttypeForkortelse,
    barnIdent?: string,
    behandlingsÅr?: number,
    annenPart?: string,
): Promise<void> => {
    const requestBody: IKopierJournalpost = {
        dedupKey,
        til: kopierTilIdent,
        barn: barnIdent,
        ytelse: ytelse,
        behandlingsÅr: behandlingsÅr,
        annenPart: annenPart,
    };

    return post(ApiPath.JOURNALPOST_KOPIERE, { journalpostId: journalPostID }, undefined, requestBody).then(
        async (response) => {
            if (!response.ok) {
                const feil = 'Det oppstod en feil ved kopiering av journalpost.';
                throw Error(feil);
            }
        },
    );
};

export const getJournalpostEtterKopiering = (journalpostid: string): Promise<IJournalpost> =>
    new Promise((resolve, reject) => {
        get(
            ApiPath.JOURNALPOST_GET,
            { journalpostId: journalpostid },
            undefined,
            (response: Response, data: IJournalpost) => {
                if (response.ok) {
                    resolve(data);
                } else {
                    reject(new Error('Error fetching journalpost'));
                }
            },
        );
    });

export const getPersonInfo = (norskIdent: string, callback: (response: Response, data: Person) => void) =>
    get(ApiPath.PERSON, undefined, { 'X-Nav-NorskIdent': norskIdent }, callback);
