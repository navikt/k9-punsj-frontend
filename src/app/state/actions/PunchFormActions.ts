import {ApiPath}                                from 'app/apiConfig';
import {PunchFormActionKeys}                    from 'app/models/enums';
import {IError, IMappe, ISoknad}                from 'app/models/types';
import {IInputError}                            from 'app/models/types/InputError';
import {convertResponseToError, get, post, put} from 'app/utils';

interface IResetPunchFormAction         {type: PunchFormActionKeys.RESET}

interface IGetMappeLoadingAction        {type: PunchFormActionKeys.MAPPE_LOAD}
interface IGetMappeErrorAction          {type: PunchFormActionKeys.MAPPE_REQUEST_ERROR, error: IError}
interface ISetMappeAction               {type: PunchFormActionKeys.MAPPE_SET, mappe: Partial<IMappe>}
interface IResetMappeAction             {type: PunchFormActionKeys.MAPPE_RESET}

interface IUpdateSoknadRequestAction    {type: PunchFormActionKeys.SOKNAD_UPDATE_REQUEST}
interface IUpdateSoknadSuccessAction    {type: PunchFormActionKeys.SOKNAD_UPDATE_SUCCESS, errors1?: IInputError[], errors2?: IInputError[]}
interface IUpdateSoknadErrorAction      {type: PunchFormActionKeys.SOKNAD_UPDATE_ERROR, error: IError}

interface ISubmitSoknadRequestAction    {type: PunchFormActionKeys.SOKNAD_SUBMIT_REQUEST}
interface ISubmitSoknadSuccessAction    {type: PunchFormActionKeys.SOKNAD_SUBMIT_SUCCESS}
interface ISubmitSoknadUncompleteAction {type: PunchFormActionKeys.SOKNAD_SUBMIT_UNCOMPLETE, errors1: IInputError[], errors2?: IInputError[]}
interface ISubmitSoknadErrorAction      {type: PunchFormActionKeys.SOKAND_SUBMIT_ERROR, error: IError}

type IMappeActionTypes = IGetMappeLoadingAction | IGetMappeErrorAction | ISetMappeAction | IResetMappeAction;
type ISoknadUpdateActionTypes = IUpdateSoknadRequestAction | IUpdateSoknadSuccessAction | IUpdateSoknadErrorAction;
type ISoknadSubmitActionTypes = ISubmitSoknadRequestAction | ISubmitSoknadSuccessAction | ISubmitSoknadUncompleteAction | ISubmitSoknadErrorAction;
export type IPunchFormActionTypes = IResetPunchFormAction | IMappeActionTypes | ISoknadUpdateActionTypes | ISoknadSubmitActionTypes;

export const resetPunchFormAction           = ():                                                   IResetPunchFormAction       => ({type: PunchFormActionKeys.RESET});

export const getMappeLoadingAction          = ():                                                   IGetMappeLoadingAction      => ({type: PunchFormActionKeys.MAPPE_LOAD});
export const getMappeErrorAction            = (error: IError):                                      IGetMappeErrorAction        => ({type: PunchFormActionKeys.MAPPE_REQUEST_ERROR, error});
export const setMappeAction                 = (mappe: Partial<IMappe>):                             ISetMappeAction             => ({type: PunchFormActionKeys.MAPPE_SET, mappe});
export const resetMappeAction               = ():                                                   IResetMappeAction           => ({type: PunchFormActionKeys.MAPPE_RESET});

export const updateSoknadRequestAction      = ():                                                   IUpdateSoknadRequestAction  => ({type: PunchFormActionKeys.SOKNAD_UPDATE_REQUEST});
export const updateSoknadSuccessAction      = (errors1?: IInputError[], errors2?: IInputError[]):   IUpdateSoknadSuccessAction  => ({type: PunchFormActionKeys.SOKNAD_UPDATE_SUCCESS, errors1, errors2});
export const updateSoknadErrorAction        = (error: IError):                                      IUpdateSoknadErrorAction    => ({type: PunchFormActionKeys.SOKNAD_UPDATE_ERROR, error});

export function getMappe(id: string) {return (dispatch: any) => {
    dispatch(getMappeLoadingAction());
    return get(ApiPath.MAPPE_GET, {id}, undefined,response => {
        if (response.ok || response.status === 400) {
            return response.json()
                           .then(mappe => dispatch(setMappeAction(mappe)));
        }
        return dispatch(getMappeErrorAction(convertResponseToError(response)));
    });
}}

export function updateSoknad(mappeid: string,
                             norskIdent: string,
                             journalpostid: string,
                             soknad: Partial<ISoknad>) {return (dispatch: any) => {
    dispatch(updateSoknadRequestAction());
    const request = {
        personer: {
            [norskIdent]: {
                journalpostId: journalpostid,
                soeknad: soknad
            }
        }
    };
    return put(ApiPath.MAPPE_UPDATE, {id: mappeid}, request, response => {
        switch (response.status) {
            case 200:
                return response.json()
                               .then(mappe => {
                                   dispatch(setMappeAction(mappe));
                                   dispatch(updateSoknadSuccessAction());
                               });
            case 400:
                return response.json()
                               .then(mappe => {
                                   dispatch(setMappeAction(mappe));
                                   dispatch(updateSoknadSuccessAction(mappe.personer?.[norskIdent]?.mangler));
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
                               soknad1: Partial<ISoknad>,
                               soknad2: Partial<ISoknad> | null) {return (dispatch: any) => {

    if (!norskIdent2 || !soknad2) {
        return dispatch(updateSoknad(mappeid, norskIdent1, journalpostid, soknad1));
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
    return put(ApiPath.MAPPE_UPDATE, {id: mappeid}, request, response => {
        switch (response.status) {
            case 200:
                return response.json()
                               .then(mappe => {
                                   dispatch(setMappeAction(mappe));
                                   dispatch(updateSoknadSuccessAction());
                               });
            case 400:
                return response.json()
                               .then(mappe => {
                                   dispatch(setMappeAction(mappe));
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

export function submitSoknad(mappeid: string, ident: string) {return (dispatch: any) => {
    dispatch(submitSoknadRequestAction());
    post(ApiPath.MAPPE_SUBMIT, {id: mappeid}, {'X-Nav-NorskIdent': ident}, undefined, response => {
        switch (response.status) {
            case 202: return dispatch(submitSoknadSuccessAction());
            case 400: return response.json().then(mappe => dispatch(submitSoknadUncompleteAction(mappe.mangler)));
            default:
                return dispatch(submitSoknadErrorAction(convertResponseToError(response)));
        }
    });
}}