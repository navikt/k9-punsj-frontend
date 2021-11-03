import { ApiPath } from 'app/apiConfig';
import { OMSSoknadUt } from 'app/models/types/OMSSoknadUt';
import { apiUrl, post, put } from 'app/utils';

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

export function validerOMSSoknad(soknad: OMSSoknadUt) {
    const norskIdent: string = !soknad.soeknadId ? '' : soknad.soeknadId;
    return postPromise(
        ApiPath.OMS_SOKNAD_VALIDER,
        { id: soknad.soeknadId },
        { 'X-Nav-NorskIdent': norskIdent },
        soknad
    );
}

export function createOMSSoknad(
    ident1: string,
    journalpostid: string,
    callback: (response: Response, data: any) => void
): void {
    const requestBody = {
        journalpostId: journalpostid,
        norskIdent: ident1,
    };

    post(ApiPath.OMS_SOKNAD_CREATE, undefined, undefined, requestBody, callback);
}

export function submitOMSSoknad(
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

export function updateOMSSoknad(soknad: OMSSoknadUt) {
    put(ApiPath.OMS_SOKNAD_UPDATE, { id: soknad.soeknadId }, soknad);
}
