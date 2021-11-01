import { ApiPath } from 'app/apiConfig';
import { OMSSoknadUt } from 'app/models/types/OMSSoknadUt';
import { post, put } from 'app/utils';

export function submitSoknad(norskIdent: string, soeknadId: string) {
    // return (dispatch: any) => {
    //     const requestBody: ISendSoknad = {
    //         norskIdent,
    //         soeknadId,
    //     };
    //     dispatch(submitSoknadRequestAction());
    //     post(
    //         ApiPath.PSB_SOKNAD_SUBMIT,
    //         { id: soeknadId },
    //         { 'X-Nav-NorskIdent': norskIdent },
    //         requestBody,
    //         (response, responseData) => {
    //             switch (response.status) {
    //                 case 202:
    //                     return dispatch(submitSoknadSuccessAction(responseData, response.headers.get('Location')));
    //                 case 400:
    //                     return dispatch(submitSoknadUncompleteAction(responseData.feil));
    //                 case 409:
    //                     return dispatch(submitSoknadConflictAction());
    //                 default:
    //                     return dispatch(submitSoknadErrorAction(convertResponseToError(response)));
    //             }
    //         }
    //     );
    // };
}

export function validerOMSSoknad(soknad: OMSSoknadUt, callback: (response: Response, data: any) => void) {
    const norskIdent: string = !soknad.soeknadId ? '' : soknad.soeknadId;
    post(ApiPath.OMS_SOKNAD_VALIDER, { id: soknad.soeknadId }, { 'X-Nav-NorskIdent': norskIdent }, soknad, callback);
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
