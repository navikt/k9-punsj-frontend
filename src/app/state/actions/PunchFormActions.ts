import {ApiPath}                                from 'app/apiConfig';
import {PunchFormActionKeys}                    from 'app/models/enums';
import {IError}                from 'app/models/types';
import {IInputError}                            from 'app/models/types/InputError';
import {convertResponseToError, get, post, put} from 'app/utils';
import {IPSBSoknad} from "../../models/types/PSBSoknad";
import {ISendSoknad} from "../../models/types/SendSoknad";
import {IPSBSoknadUt} from "../../models/types/PSBSoknadUt";

interface IResetPunchFormAction         {type: PunchFormActionKeys.RESET}

interface IGetSoknadLoadingAction        {type: PunchFormActionKeys.SOKNAD_LOAD}
interface IGetSoknadErrorAction          {type: PunchFormActionKeys.SOKNAD_REQUEST_ERROR, error: IError}
interface ISetSoknadAction               {type: PunchFormActionKeys.SOKNAD_SET, soknad: Partial<IPSBSoknad>}
interface IResetSoknadAction             {type: PunchFormActionKeys.SOKNAD_RESET}

interface IUpdateSoknadRequestAction    {type: PunchFormActionKeys.SOKNAD_UPDATE_REQUEST}
interface IUpdateSoknadSuccessAction    {type: PunchFormActionKeys.SOKNAD_UPDATE_SUCCESS, errors1?: IInputError[], errors2?: IInputError[]}
interface IUpdateSoknadErrorAction      {type: PunchFormActionKeys.SOKNAD_UPDATE_ERROR, error: IError}

interface ISubmitSoknadRequestAction    {type: PunchFormActionKeys.SOKNAD_SUBMIT_REQUEST}
interface ISubmitSoknadSuccessAction    {type: PunchFormActionKeys.SOKNAD_SUBMIT_SUCCESS}
interface ISubmitSoknadUncompleteAction {type: PunchFormActionKeys.SOKNAD_SUBMIT_UNCOMPLETE, errors1: IInputError[], errors2?: IInputError[]}
interface ISubmitSoknadErrorAction      {type: PunchFormActionKeys.SOKAND_SUBMIT_ERROR, error: IError}

type ISoknadActionTypes = IGetSoknadLoadingAction | IGetSoknadErrorAction | ISetSoknadAction | IResetSoknadAction;
type ISoknadUpdateActionTypes = IUpdateSoknadRequestAction | IUpdateSoknadSuccessAction | IUpdateSoknadErrorAction;
type ISoknadSubmitActionTypes = ISubmitSoknadRequestAction | ISubmitSoknadSuccessAction | ISubmitSoknadUncompleteAction | ISubmitSoknadErrorAction;
export type IPunchFormActionTypes = IResetPunchFormAction | ISoknadActionTypes | ISoknadUpdateActionTypes | ISoknadSubmitActionTypes;

export const resetPunchFormAction           = ():                                                   IResetPunchFormAction       => ({type: PunchFormActionKeys.RESET});

export const getSoknadLoadingAction          = ():                                                   IGetSoknadLoadingAction      => ({type: PunchFormActionKeys.SOKNAD_LOAD});
export const getSoknadErrorAction            = (error: IError):                                      IGetSoknadErrorAction        => ({type: PunchFormActionKeys.SOKNAD_REQUEST_ERROR, error});
export const setSoknadAction                 = (soknad: Partial<IPSBSoknad>):                             ISetSoknadAction             => ({type: PunchFormActionKeys.SOKNAD_SET, soknad});
export const resetSoknadAction               = ():                                                   IResetSoknadAction           => ({type: PunchFormActionKeys.SOKNAD_RESET});

export const updateSoknadRequestAction      = ():                                                   IUpdateSoknadRequestAction  => ({type: PunchFormActionKeys.SOKNAD_UPDATE_REQUEST});
export const updateSoknadSuccessAction      = (errors1?: IInputError[], errors2?: IInputError[]):   IUpdateSoknadSuccessAction  => ({type: PunchFormActionKeys.SOKNAD_UPDATE_SUCCESS, errors1, errors2});
export const updateSoknadErrorAction        = (error: IError):                                      IUpdateSoknadErrorAction    => ({type: PunchFormActionKeys.SOKNAD_UPDATE_ERROR, error});

export function getSoknad(id: string) {return (dispatch: any) => {
    dispatch(getSoknadLoadingAction());
    return get(ApiPath.SOKNAD_GET, {id}, undefined,(response, soknad) => {
        if (response.ok || response.status === 400) {
            return dispatch(setSoknadAction(soknad));
        }
        return dispatch(getSoknadErrorAction(convertResponseToError(response)));
    });
}}

export function updateSoknad(soknad: Partial<IPSBSoknadUt>) {return (dispatch: any) => {
    dispatch(updateSoknadRequestAction());
    return put(ApiPath.SOKNAD_UPDATE, {id: soknad.soeknadId}, soknad, response => {
        switch (response.status) {
            case 200:
                return response.json()
                               .then(mappe => {
                                   dispatch(setSoknadAction(mappe));
                                   dispatch(updateSoknadSuccessAction());
                               });
            default:
                return dispatch(updateSoknadErrorAction(convertResponseToError(response)));
        }
    });
}}

export function updateSoknader(mappeid: string,
                               norskIdent1: string,
                               norskIdent2: string | null,
                               journalpostid: string,
                               soknad1: Partial<IPSBSoknad>,
                               soknad2: Partial<IPSBSoknad> | null) {return (dispatch: any) => {

    if (!norskIdent2 || !soknad2) {
        return dispatch(updateSoknad(soknad1));
    }

    dispatch(updateSoknadRequestAction());
    const request = {
        personer: {
            [norskIdent1]: {
                journalpostId: journalpostid,
                soeknad: soknad1
            },
            [norskIdent2]: {
                journalpostId: journalpostid,
                soeknad: soknad2
            }
        }
    };
    return put(ApiPath.SOKNAD_UPDATE, {id: mappeid}, request, response => {
        switch (response.status) {
            case 200:
                return response.json()
                               .then(mappe => {
                                   dispatch(setSoknadAction(mappe));
                                   dispatch(updateSoknadSuccessAction());
                               });
            case 400:
                return response.json()
                               .then(mappe => {
                                   dispatch(setSoknadAction(mappe));
                                   dispatch(updateSoknadSuccessAction(mappe.personer?.[norskIdent1]?.mangler, mappe.personer?.[norskIdent2]?.mangler));
                               });
            default:
                return dispatch(updateSoknadErrorAction(convertResponseToError(response)));
        }
    });
}}

export const submitSoknadRequestAction      = ():                                                   ISubmitSoknadRequestAction      => ({type: PunchFormActionKeys.SOKNAD_SUBMIT_REQUEST});
export const submitSoknadSuccessAction      = ():                                                   ISubmitSoknadSuccessAction      => ({type: PunchFormActionKeys.SOKNAD_SUBMIT_SUCCESS});
export const submitSoknadUncompleteAction   = (errors1: IInputError[], errors2?: IInputError[]):    ISubmitSoknadUncompleteAction   => ({type: PunchFormActionKeys.SOKNAD_SUBMIT_UNCOMPLETE, errors1, errors2});
export const submitSoknadErrorAction        = (error: IError):                                      ISubmitSoknadErrorAction        => ({type: PunchFormActionKeys.SOKAND_SUBMIT_ERROR, error});

export function submitSoknad(norskIdent: string, soeknadId: string) {return (dispatch: any) => {
    const requestBody: ISendSoknad = {
        norskIdent,
        soeknadId
    }


    dispatch(submitSoknadRequestAction());
    post(ApiPath.SOKNAD_SUBMIT, {id: soeknadId}, {'X-Nav-NorskIdent': norskIdent}, requestBody, response => {
        switch (response.status) {
            case 202: return dispatch(submitSoknadSuccessAction());
            case 400: return response.json().then(soknad => dispatch(submitSoknadUncompleteAction(soknad.mangler)));
            default:
                return dispatch(submitSoknadErrorAction(convertResponseToError(response)));
        }
    });
}}
