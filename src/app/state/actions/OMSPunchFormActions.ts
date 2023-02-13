import { ApiPath } from 'app/apiConfig';
import { OMSKorrigering } from 'app/models/types/OMSKorrigering';
import { apiUrl, initializeDate, post, put } from 'app/utils';

async function postPromise<BodyType>(
    path: ApiPath,
    parameters?: any,
    headers?: HeadersInit,
    body?: BodyType,
    callbackIfError?: (error: any) => any
): Promise<any> {
    try {
        const response = await fetch(apiUrl(path, parameters), {
            method: 'post',
            credentials: 'include',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json', ...headers },
        });
        return response;
    } catch (error) {
        if (callbackIfError) {
            return callbackIfError(error);
        }
        return error;
    }
}

export function validerOMSKorrigering(korrigering: OMSKorrigering) {
    const norskIdent: string = !korrigering.soeknadId ? '' : korrigering.soeknadId;
    return postPromise(
        ApiPath.OMS_SOKNAD_VALIDER,
        { id: korrigering.soeknadId },
        { 'X-Nav-NorskIdent': norskIdent },
        korrigering
    );
}

export function createOMSKorrigering(
    søkerId: string,
    journalpostid: string,
    callback: (response: Response, data: any) => void
): void {
    const requestBody = {
        journalpostId: journalpostid,
        norskIdent: søkerId,
    };

    post(ApiPath.OMS_SOKNAD_CREATE, undefined, undefined, requestBody, callback);
}

export function submitOMSKorrigering(
    norskIdent: string,
    soeknadId: string,
    callback: (response: Response, data: any) => void
) {
    const requestBody = {
        norskIdent,
        soeknadId,
    };

    post(ApiPath.OMS_SOKNAD_SUBMIT, { id: soeknadId }, { 'X-Nav-NorskIdent': norskIdent }, requestBody, callback);
}

export function updateOMSKorrigering(korrigering: OMSKorrigering) {
    put(ApiPath.OMS_SOKNAD_UPDATE, { id: korrigering.soeknadId }, korrigering);
}

export function hentArbeidsgivereMedId(søkerId: string, årstallForKorrigering: string) {
    const dato = initializeDate(årstallForKorrigering).format('YYYY-MM-DD');
    return fetch(apiUrl(ApiPath.OMS_FINN_ARBEIDSFORHOLD), {
        method: 'post',
        credentials: 'include',
        body: JSON.stringify({
            brukerIdent: søkerId,
            periodeDto: {
                fom: dato,
                tom: dato,
            },
        }),
        headers: { 'Content-Type': 'application/json', 'X-Nav-NorskIdent': søkerId },
    });
}
