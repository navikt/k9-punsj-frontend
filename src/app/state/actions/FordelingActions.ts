import {ApiPath}                       from 'app/apiConfig';
import {FordelingActionKeys, Sakstype} from 'app/models/enums';
import {IError}                        from 'app/models/types';
import {convertResponseToError, post}  from 'app/utils';
import {ISkalTilK9} from "../../models/types/RequestBodies";

interface ISetSakstypeAction        {type: FordelingActionKeys.SAKSTYPE_SET, sakstype?: Sakstype}

interface IOmfordelingRequestAction {type: FordelingActionKeys.OMFORDELING_REQUEST}
interface IOmfordelingSuccessAction {type: FordelingActionKeys.OMFORDELING_SUCCESS}
interface IOmfordelingErrorAction   {type: FordelingActionKeys.OMFORDELING_ERROR, error: IError}

export const setSakstypeAction = (sakstype?: Sakstype): ISetSakstypeAction => ({type: FordelingActionKeys.SAKSTYPE_SET, sakstype});

export const omfordelingRequestAction   = ():               IOmfordelingRequestAction   => ({type: FordelingActionKeys.OMFORDELING_REQUEST});
export const omfordelingSuccessAction   = ():               IOmfordelingSuccessAction   => ({type: FordelingActionKeys.OMFORDELING_SUCCESS});
export const omfordelingErrorAction     = (error: IError):  IOmfordelingErrorAction     => ({type: FordelingActionKeys.OMFORDELING_ERROR, error});



interface ISjekkOmSkalTilK9LoadingAction {type: FordelingActionKeys.SJEKK_SKAL_TIL_K9_REQUEST}
interface ISjekkOmSkalTilK9ErrorAction {type: FordelingActionKeys.SJEKK_SKAL_TIL_K9_ERROR, error: IError}
interface ISjekkOmSkalTilK9SuccessAction {type: FordelingActionKeys.SJEKK_SKAL_TIL_K9_SUCCESS, k9sak: boolean}

interface ILukkOggpgaveRequestAction {type: FordelingActionKeys.LUKK_OPPGAVE_REQUEST}
interface ILukkOggpgaveSuccessAction {type: FordelingActionKeys.LUKK_OPPGAVE_SUCCESS}
interface ILukkOggpgaveErrorAction   {type: FordelingActionKeys.LUKK_OPPGAVE_ERROR, error: IError}

export const lukkOppgaveRequestAction   = ():               ILukkOggpgaveRequestAction   => ({type: FordelingActionKeys.LUKK_OPPGAVE_REQUEST});
export const lukkOppgaveSuccessAction   = ():               ILukkOggpgaveSuccessAction   => ({type: FordelingActionKeys.LUKK_OPPGAVE_SUCCESS});
export const lukkOppgaveErrorAction     = (error: IError):  ILukkOggpgaveErrorAction     => ({type: FordelingActionKeys.LUKK_OPPGAVE_ERROR, error});

export type IFordelingActionTypes =
    ISetSakstypeAction |
    IOmfordelingRequestAction |
    IOmfordelingSuccessAction |
    IOmfordelingErrorAction   |
    ISjekkOmSkalTilK9LoadingAction |
    ISjekkOmSkalTilK9ErrorAction   |
    ISjekkOmSkalTilK9SuccessAction |
    ILukkOggpgaveRequestAction |
    ILukkOggpgaveErrorAction   |
    ILukkOggpgaveSuccessAction;

export const sjekkSkalTilK9RequestAction = (): ISjekkOmSkalTilK9LoadingAction => ({type: FordelingActionKeys.SJEKK_SKAL_TIL_K9_REQUEST});
export const sjekkSkalTilK9SuccessAction = (k9sak: boolean): ISjekkOmSkalTilK9SuccessAction => ({
    type: FordelingActionKeys.SJEKK_SKAL_TIL_K9_SUCCESS,
    k9sak
});
export const sjekkSkalTilK9ErrorAction = (error: IError): ISjekkOmSkalTilK9ErrorAction => ({
    type: FordelingActionKeys.SJEKK_SKAL_TIL_K9_ERROR,
    error
});

export const omfordel = (journalpostid: string, sakstype: Sakstype) => {return (dispatch: any) => {

    if (sakstype === Sakstype.PLEIEPENGER_SYKT_BARN) {return}

    dispatch(omfordelingRequestAction());

    let ytelse: string;
    switch (sakstype) {
        case Sakstype.OMSORGSPENGER:                    ytelse = 'Omsorgspenger';           break;
        case Sakstype.OPPLAERINGSPENGER:                ytelse = 'Opplæringspenger';        break;
        case Sakstype.PLEIEPENGER_I_LIVETS_SLUTTFASE:   ytelse = 'PleiepengerNærstående';   break;
        default:                                        ytelse = 'Annet';
    }
    post(
        ApiPath.JOURNALPOST_OMFORDEL,
        {journalpostId: journalpostid},
        undefined,
        {ytelse},
        response => {
            if (response.status === 204) {return dispatch(omfordelingSuccessAction())}
            return dispatch(omfordelingErrorAction(convertResponseToError(response)));
        }
    );
}};

export const lukkJournalpostOppgave = (journalpostid: string) => {return (dispatch: any) => {

    dispatch(lukkOppgaveRequestAction());
    post(
        ApiPath.JOURNALPOST_LUKK_OPPGAVE,
        {journalpostId: journalpostid},
        undefined,
        undefined,
        response => {
            if (response.status === 204) {return dispatch(lukkOppgaveSuccessAction())}
            return dispatch(lukkOppgaveErrorAction(convertResponseToError(response)));
        }
    );
}};


export function sjekkOmSkalTilK9Sak(norskIdent: string, barnIdent: string, jpid: string) {
    return (dispatch: any) => {
        const requestBody: ISkalTilK9 = {
            brukerIdent: norskIdent,
            barnIdent,
            journalpostId: jpid
        }

        dispatch(sjekkSkalTilK9RequestAction());
        post(ApiPath.SJEKK_OM_SKAL_TIL_K9SAK, {}, {'X-Nav-NorskIdent': norskIdent}, requestBody, (response, svar) => {
            if (response.ok) {
                return dispatch(sjekkSkalTilK9SuccessAction(svar.k9sak));
            }
            return dispatch(sjekkSkalTilK9ErrorAction(convertResponseToError(response)));
        });
    }
}
