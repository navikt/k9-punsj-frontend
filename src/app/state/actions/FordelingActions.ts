import { ApiPath } from 'app/apiConfig';
import { FordelingActionKeys, Sakstype } from 'app/models/enums';
import { IError } from 'app/models/types';
import { convertResponseToError, get, post } from 'app/utils';
import { FagsakYtelseType, ISkalTilK9 } from '../../models/types/RequestBodies';

interface ISetSakstypeAction {
    type: FordelingActionKeys.SAKSTYPE_SET;
    sakstype?: Sakstype;
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

interface ISjekkOmSkalTilK9LoadingAction {
    type: FordelingActionKeys.SJEKK_SKAL_TIL_K9_REQUEST;
}
interface ISjekkOmSkalTilK9ErrorAction {
    type: FordelingActionKeys.SJEKK_SKAL_TIL_K9_ERROR;
    error: IError;
}
interface ISjekkOmSkalTilK9SuccessAction {
    type: FordelingActionKeys.SJEKK_SKAL_TIL_K9_SUCCESS;
    k9sak: boolean;
    kanIkkeGaaTilK9: string[];
}
interface ISjekkOmSkalTilK9JournalpostStottesIkkeAction {
    type: FordelingActionKeys.SJEKK_SKAL_TIL_K9_JOURNALPOST_STOTTES_IKKE;
}

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
    gjelderKategorierFraGosys: string[];
}
interface IGosysGjelderErrorAction {
    type: FordelingActionKeys.GOSYS_GJELDER_ERROR;
    error: IError;
}
interface ISetErIdent1BekreftetAction {
    type: FordelingActionKeys.IDENT_BEKREFT_IDENT1;
    erIdent1Bekreftet: boolean;
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

export const setErIdent1BekreftetAction = (identBekreftet: boolean): ISetErIdent1BekreftetAction => ({
    type: FordelingActionKeys.IDENT_BEKREFT_IDENT1,
    erIdent1Bekreftet: identBekreftet,
});
export const setValgtGosysKategoriAction = (valgtGosysKategori: string): ISetValgtGosysKategori => ({
    type: FordelingActionKeys.VALGT_GOSYS_KATEGORI,
    valgtGosysKategori,
});

export type IFordelingActionTypes =
    | ISetSakstypeAction
    | IOmfordelingRequestAction
    | IOmfordelingSuccessAction
    | IOmfordelingErrorAction
    | ISjekkOmSkalTilK9LoadingAction
    | ISjekkOmSkalTilK9ErrorAction
    | ISjekkOmSkalTilK9SuccessAction
    | ISjekkOmSkalTilK9JournalpostStottesIkkeAction
    | ILukkOggpgaveRequestAction
    | ILukkOggpgaveErrorAction
    | ILukkOggpgaveSuccessAction
    | ILukkOggpgaveResetAction
    | IGosysGjelderRequestAction
    | IGosysGjelderSuccessAction
    | IGosysGjelderErrorAction
    | ISetErIdent1BekreftetAction
    | ISetValgtGosysKategori;

export const sjekkSkalTilK9RequestAction = (): ISjekkOmSkalTilK9LoadingAction => ({
    type: FordelingActionKeys.SJEKK_SKAL_TIL_K9_REQUEST,
});

export const sjekkSkalTilK9SuccessAction = (
    k9sak: boolean,
    kanIkkeGaaTilK9: string[]
): ISjekkOmSkalTilK9SuccessAction => ({
    type: FordelingActionKeys.SJEKK_SKAL_TIL_K9_SUCCESS,
    k9sak,
    kanIkkeGaaTilK9,
});
export const sjekkSkalTilK9ErrorAction = (error: IError): ISjekkOmSkalTilK9ErrorAction => ({
    type: FordelingActionKeys.SJEKK_SKAL_TIL_K9_ERROR,
    error,
});

export const sjekkSkalTilK9JournalpostStottesIkkeAction = (): ISjekkOmSkalTilK9JournalpostStottesIkkeAction => ({
    type: FordelingActionKeys.SJEKK_SKAL_TIL_K9_JOURNALPOST_STOTTES_IKKE,
});

export const lukkJournalpostOppgave = (journalpostid: string) => (dispatch: any) => {
    dispatch(lukkOppgaveRequestAction());
    post(ApiPath.JOURNALPOST_LUKK_OPPGAVE, { journalpostId: journalpostid }, undefined, undefined, (response) => {
        if (response.status === 200) {
            return dispatch(lukkOppgaveSuccessAction());
        }
        return dispatch(lukkOppgaveErrorAction(convertResponseToError(response)));
    });
};

export function sjekkOmSkalTilK9Sak(
    norskIdent: string,
    barnIdent: string,
    jpid: string,
    fagsakYtelseType: FagsakYtelseType,
    barn: string[]
) {
    return (dispatch: any) => {
        const requestBody: ISkalTilK9 = {
            brukerIdent: norskIdent,
            barnIdent,
            barn,
            journalpostId: jpid,
            fagsakYtelseType,
        };

        dispatch(sjekkSkalTilK9RequestAction());

        if (barn.length) {
            const promises = barn.map((identifikator) =>
                post(
                    ApiPath.SJEKK_OM_SKAL_TIL_K9SAK,
                    {},
                    { 'X-Nav-NorskIdent': norskIdent },
                    { brukerIdent: norskIdent, barnIdent: identifikator, journalpostId: jpid, fagsakYtelseType }
                ).then((res) =>
                    res
                        .json()
                        .then((skalTilK9Sak) => ({ response: res, k9sak: skalTilK9Sak.k9sak, barn: identifikator }))
                )
            );

            Promise.all(promises).then((responseList) => {
                if (responseList.every((res) => res.response.ok)) {
                    const kanIkkeGaaTilK9 = responseList.filter((res) => !res.k9sak).map((res) => res.barn);
                    return dispatch(kanIkkeGaaTilK9.length === 0, kanIkkeGaaTilK9);
                }

                if (responseList.some((res) => res.response.status === 409)) {
                    return dispatch(sjekkSkalTilK9JournalpostStottesIkkeAction());
                }
                return dispatch(sjekkSkalTilK9ErrorAction(convertResponseToError(responseList[0].response)));
            });
        } else {
            post(ApiPath.SJEKK_OM_SKAL_TIL_K9SAK, {}, { 'X-Nav-NorskIdent': norskIdent }, requestBody, (res, svar) => {
                if (res.ok) {
                    return dispatch(sjekkSkalTilK9SuccessAction(svar.k9sak, svar.k9sak ? [] : [barnIdent]));
                }
                if (res.status === 409) {
                    return dispatch(sjekkSkalTilK9JournalpostStottesIkkeAction());
                }
                return dispatch(sjekkSkalTilK9ErrorAction(convertResponseToError(res)));
            });
        }
    };
}

export function hentGjelderKategorierFraGosys() {
    return (dispatch: any) => {
        dispatch(gosysGjelderRequestAction());
        get(ApiPath.GOSYS_GJELDER, {}, {}, (response, svar) => {
            if (response.ok) {
                return dispatch(gosysGjelderSuccessAction(svar));
            }
            return dispatch(gosysGjelderErrorAction(convertResponseToError(response)));
        });
    };
}
