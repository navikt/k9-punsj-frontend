import { ApiPath } from 'app/apiConfig';
import { IError } from 'app/models/types';
import { convertResponseToError, post } from 'app/utils';
import { GosysOppgaveActionKeys } from '../../models/enums/GosysOppgaveActionKeys';

interface IOpprettGosysOppgaveRequestAction {
    type: GosysOppgaveActionKeys.OPPRETT_OPPGAVE_REQUEST;
}
interface IOpprettGosysOppgaveSuccessAction {
    type: GosysOppgaveActionKeys.OPPRETT_OPPGAVE_SUCCESS;
}
interface IOpprettGosysOppgaveErrorAction {
    type: GosysOppgaveActionKeys.OPPRETT_OPPGAVE_ERROR;
    error: IError;
}
interface IOpprettGosysOppgaveResetAction {
    type: GosysOppgaveActionKeys.OPPRETT_OPPGAVE_RESET;
}

export type IOpprettGosysOppgaveActionTypes =
    | IOpprettGosysOppgaveRequestAction
    | IOpprettGosysOppgaveSuccessAction
    | IOpprettGosysOppgaveErrorAction
    | IOpprettGosysOppgaveResetAction;

const opprettGosysOppgaveRequestAction = (): IOpprettGosysOppgaveRequestAction => ({
    type: GosysOppgaveActionKeys.OPPRETT_OPPGAVE_REQUEST,
});
const opprettGosysOppgaveSuccessAction = (): IOpprettGosysOppgaveSuccessAction => ({
    type: GosysOppgaveActionKeys.OPPRETT_OPPGAVE_SUCCESS,
});
const opprettGosysOppgaveErrorAction = (error: IError): IOpprettGosysOppgaveErrorAction => ({
    type: GosysOppgaveActionKeys.OPPRETT_OPPGAVE_ERROR,
    error,
});
export const opprettGosysOppgaveResetAction = (): IOpprettGosysOppgaveResetAction => ({
    type: GosysOppgaveActionKeys.OPPRETT_OPPGAVE_RESET,
});

export const opprettGosysOppgave = (journalpostid: string, norskident: string, gosysKategori: string) => (dispatch: any) => {
        dispatch(opprettGosysOppgaveRequestAction());

        post(
            ApiPath.OPPRETT_GOSYS_OPPGAVE,
            {},
            undefined,
            {
                journalpostId: journalpostid,
                norskIdent: norskident,
                gjelder: gosysKategori
            },
            (response) => {
                if (response.status === 200) {
                    return dispatch(opprettGosysOppgaveSuccessAction());
                }
                return dispatch(opprettGosysOppgaveErrorAction(convertResponseToError(response)));
            }
        );
    };
