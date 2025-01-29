import { ApiPath } from 'app/apiConfig';
import sakstyper from 'app/constants/sakstyper';
import { FordelingActionKeys, FordelingDokumenttype, Sakstype } from 'app/models/enums';
import { IGosysGjelderKategorier, IError } from 'app/models/types';
import Fagsak from 'app/types/Fagsak';
import { convertResponseToError, get, post } from 'app/utils';
import { IResetStateAction } from './GlobalActions';

interface ISetSakstypeAction {
    type: FordelingActionKeys.SAKSTYPE_SET;
    sakstype?: Sakstype;
}

interface ISetDokumenttypeAction {
    type: FordelingActionKeys.DOKUMENTTYPE_SET;
    dokumenttype?: FordelingDokumenttype;
}

interface ISetFagsakAction {
    type: FordelingActionKeys.FAGSAK_SET;
    fagsak?: Fagsak;
}

interface IOmfordelingRequestAction {
    type: FordelingActionKeys.OMFORDELING_REQUEST;
}
interface IOmfordelingSuccessAction {
    type: FordelingActionKeys.OMFORDELING_SUCCESS;
}
interface IOmfordelingErrorAction {
    type: FordelingActionKeys.OMFORDELING_ERROR;
    error: IError;
}

export const setSakstypeAction = (sakstype?: Sakstype): ISetSakstypeAction => ({
    type: FordelingActionKeys.SAKSTYPE_SET,
    sakstype,
});

export const setDokumenttypeAction = (dokumenttype?: FordelingDokumenttype): ISetDokumenttypeAction => ({
    type: FordelingActionKeys.DOKUMENTTYPE_SET,
    dokumenttype,
});

export const setFagsakAction = (fagsak?: Fagsak): ISetFagsakAction => ({
    type: FordelingActionKeys.FAGSAK_SET,
    fagsak,
});

interface ILukkOggpgaveRequestAction {
    type: FordelingActionKeys.LUKK_OPPGAVE_REQUEST;
}
interface ILukkOggpgaveSuccessAction {
    type: FordelingActionKeys.LUKK_OPPGAVE_SUCCESS;
}
interface ILukkOggpgaveErrorAction {
    type: FordelingActionKeys.LUKK_OPPGAVE_ERROR;
    error: IError;
}
interface ILukkOggpgaveResetAction {
    type: FordelingActionKeys.LUKK_OPPGAVE_RESET;
}

interface IGosysGjelderRequestAction {
    type: FordelingActionKeys.GOSYS_GJELDER_REQUEST;
}
interface IGosysGjelderSuccessAction {
    type: FordelingActionKeys.GOSYS_GJELDER_SUCCESS;
    gjelderKategorierFraGosys: IGosysGjelderKategorier;
}
interface IGosysGjelderErrorAction {
    type: FordelingActionKeys.GOSYS_GJELDER_ERROR;
    error: IError;
}
interface ISetErSøkerIdBekreftetAction {
    type: FordelingActionKeys.IDENT_BEKREFT_IDENT1;
    erSøkerIdBekreftet: boolean;
}

interface ISetValgtGosysKategori {
    type: FordelingActionKeys.VALGT_GOSYS_KATEGORI;
    valgtGosysKategori: string;
}

export const lukkOppgaveRequestAction = (): ILukkOggpgaveRequestAction => ({
    type: FordelingActionKeys.LUKK_OPPGAVE_REQUEST,
});
export const lukkOppgaveSuccessAction = (): ILukkOggpgaveSuccessAction => ({
    type: FordelingActionKeys.LUKK_OPPGAVE_SUCCESS,
});
export const lukkOppgaveErrorAction = (error: IError): ILukkOggpgaveErrorAction => ({
    type: FordelingActionKeys.LUKK_OPPGAVE_ERROR,
    error,
});
export const lukkOppgaveResetAction = (): ILukkOggpgaveResetAction => ({
    type: FordelingActionKeys.LUKK_OPPGAVE_RESET,
});

export const gosysGjelderRequestAction = (): IGosysGjelderRequestAction => ({
    type: FordelingActionKeys.GOSYS_GJELDER_REQUEST,
});
export const gosysGjelderSuccessAction = (gjelderKategorierFraGosys: any): IGosysGjelderSuccessAction => ({
    type: FordelingActionKeys.GOSYS_GJELDER_SUCCESS,
    gjelderKategorierFraGosys,
});
export const gosysGjelderErrorAction = (error: IError): IGosysGjelderErrorAction => ({
    type: FordelingActionKeys.GOSYS_GJELDER_ERROR,
    error,
});

export const setErSøkerIdBekreftetAction = (identBekreftet: boolean): ISetErSøkerIdBekreftetAction => ({
    type: FordelingActionKeys.IDENT_BEKREFT_IDENT1,
    erSøkerIdBekreftet: identBekreftet,
});
export const setValgtGosysKategoriAction = (valgtGosysKategori: string): ISetValgtGosysKategori => ({
    type: FordelingActionKeys.VALGT_GOSYS_KATEGORI,
    valgtGosysKategori,
});

export const resetFordeling = () => ({
    type: FordelingActionKeys.RESET_FORDELING,
});

export type IFordelingActionTypes =
    | ISetSakstypeAction
    | ISetFagsakAction
    | IOmfordelingRequestAction
    | IOmfordelingSuccessAction
    | IOmfordelingErrorAction
    | ILukkOggpgaveRequestAction
    | ILukkOggpgaveErrorAction
    | ILukkOggpgaveSuccessAction
    | ILukkOggpgaveResetAction
    | IGosysGjelderRequestAction
    | IGosysGjelderSuccessAction
    | IGosysGjelderErrorAction
    | ISetErSøkerIdBekreftetAction
    | ISetValgtGosysKategori
    | ISetDokumenttypeAction
    | { type: FordelingActionKeys.RESET_FORDELING }
    | IResetStateAction;

export const lukkJournalpostOppgave =
    (journalpostid: string, soekersIdent: string, fagsak?: Fagsak) => (dispatch: any) => {
        dispatch(lukkOppgaveRequestAction());
        post(
            ApiPath.JOURNALPOST_LUKK_OPPGAVE,
            { journalpostId: journalpostid },
            undefined,
            {
                norskIdent: soekersIdent,
                sak: fagsak?.fagsakId
                    ? { fagsakId: fagsak.fagsakId, sakstype: sakstyper.FAGSAK }
                    : { sakstype: sakstyper.GENERELL_SAK },
            },
            (response) => {
                if (response.status === 200) {
                    return dispatch(lukkOppgaveSuccessAction());
                }
                return dispatch(lukkOppgaveErrorAction(convertResponseToError(response)));
            },
        );
    };

export function hentGjelderKategorierFraGosys() {
    return (dispatch: any) => {
        dispatch(gosysGjelderRequestAction());
        get(ApiPath.GOSYS_GJELDER, {}, {}, (response, svar) => {
            if (response.ok) {
                // eslint-disable-next-line no-console
                console.log('Response ok');
                return dispatch(gosysGjelderSuccessAction(svar));
            }

            return dispatch(gosysGjelderErrorAction(convertResponseToError(response)));
        });
    };
}
