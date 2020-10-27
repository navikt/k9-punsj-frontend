import {ApiPath}                      from 'app/apiConfig';
import {IError} from 'app/models/types';
import {convertResponseToError, post} from 'app/utils';
import {GosysOppgaveActionKeys} from "../../models/enums/GosysOppgaveActionKeys";

interface IOpprettGosysOppgaveRequestAction    {type: GosysOppgaveActionKeys.OPPRETT_OPPGAVE_REQUEST}
interface IOpprettGosysOppgaveSuccessAction    {type: GosysOppgaveActionKeys.OPPRETT_OPPGAVE_SUCCESS}
interface IOpprettGosysOppgaveErrorAction      {type: GosysOppgaveActionKeys.OPPRETT_OPPGAVE_ERROR, error: IError}


export type IOpprettGosysOppgaveActionTypes = IOpprettGosysOppgaveRequestAction | IOpprettGosysOppgaveSuccessAction | IOpprettGosysOppgaveErrorAction;

const           opprettOppgaveRequestAction   = ():                       IOpprettGosysOppgaveRequestAction  => ({type: GosysOppgaveActionKeys.OPPRETT_OPPGAVE_REQUEST});
const           opprettOppgaveSuccessAction   = ():                       IOpprettGosysOppgaveSuccessAction  => ({type: GosysOppgaveActionKeys.OPPRETT_OPPGAVE_SUCCESS});
const           opprettOppgaveErrorAction     = (error: IError):          IOpprettGosysOppgaveErrorAction    => ({type: GosysOppgaveActionKeys.OPPRETT_OPPGAVE_ERROR, error});

export const opprettGosysOppgave = (journalpostid: string, norskident?: string) => {return (dispatch: any) => {

    dispatch(opprettOppgaveRequestAction());

    post(
        ApiPath.OPPRETT_GOSYS_OPPGAVE,
        {
        },
        undefined,
        {
            journalpostId: journalpostid,
            norskIdent: norskident},
        response => {
            if (response.status === 200) {return dispatch(opprettOppgaveSuccessAction())}
            return dispatch(opprettOppgaveErrorAction(convertResponseToError(response)));
        }
    );
}};
