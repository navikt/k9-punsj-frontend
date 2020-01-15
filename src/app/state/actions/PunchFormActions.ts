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
interface IUpdateSoknadSuccessAction    {type: PunchFormActionKeys.SOKNAD_UPDATE_SUCCESS, errors?: IInputError[]}
interface IUpdateSoknadErrorAction      {type: PunchFormActionKeys.SOKNAD_UPDATE_ERROR, error: IError}

interface ISubmitSoknadRequestAction    {type: PunchFormActionKeys.SOKNAD_SUBMIT_REQUEST}
interface ISubmitSoknadSuccessAction    {type: PunchFormActionKeys.SOKNAD_SUBMIT_SUCCESS}
interface ISubmitSoknadUncompleteAction {type: PunchFormActionKeys.SOKNAD_SUBMIT_UNCOMPLETE, errors: IInputError[]}
interface ISubmitSoknadErrorAction      {type: PunchFormActionKeys.SOKAND_SUBMIT_ERROR, error: IError}

type IMappeActionTypes = IGetMappeLoadingAction | IGetMappeErrorAction | ISetMappeAction | IResetMappeAction;
type ISoknadUpdateActionTypes = IUpdateSoknadRequestAction | IUpdateSoknadSuccessAction | IUpdateSoknadErrorAction;
type ISoknadSubmitActionTypes = ISubmitSoknadRequestAction | ISubmitSoknadSuccessAction | ISubmitSoknadUncompleteAction | ISubmitSoknadErrorAction;
export type IPunchFormActionTypes = IResetPunchFormAction | IMappeActionTypes | ISoknadUpdateActionTypes | ISoknadSubmitActionTypes;

export const resetPunchFormAction           = ():                       IResetPunchFormAction           => ({type: PunchFormActionKeys.RESET});

export const getMappeLoadingAction          = ():                       IGetMappeLoadingAction          => ({type: PunchFormActionKeys.MAPPE_LOAD});
export const getMappeErrorAction            = (error: IError):          IGetMappeErrorAction            => ({type: PunchFormActionKeys.MAPPE_REQUEST_ERROR, error});
export const setMappeAction                 = (mappe: Partial<IMappe>): ISetMappeAction                 => ({type: PunchFormActionKeys.MAPPE_SET, mappe});
export const resetMappeAction               = ():                       IResetMappeAction               => ({type: PunchFormActionKeys.MAPPE_RESET});

export const updateSoknadRequestAction      = ():                       IUpdateSoknadRequestAction      => ({type: PunchFormActionKeys.SOKNAD_UPDATE_REQUEST});
export const updateSoknadSuccessAction      = (errors?: IInputError[]): IUpdateSoknadSuccessAction      => ({type: PunchFormActionKeys.SOKNAD_UPDATE_SUCCESS, errors});
export const updateSoknadErrorAction        = (error: IError):          IUpdateSoknadErrorAction        => ({type: PunchFormActionKeys.SOKNAD_UPDATE_ERROR, error});

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

export const submitSoknadRequestAction      = ():                       ISubmitSoknadRequestAction      => ({type: PunchFormActionKeys.SOKNAD_SUBMIT_REQUEST});
export const submitSoknadSuccessAction      = ():                       ISubmitSoknadSuccessAction      => ({type: PunchFormActionKeys.SOKNAD_SUBMIT_SUCCESS});
export const submitSoknadUncompleteAction   = (errors: IInputError[]):  ISubmitSoknadUncompleteAction   => ({type: PunchFormActionKeys.SOKNAD_SUBMIT_UNCOMPLETE, errors});
export const submitSoknadErrorAction        = (error: IError):          ISubmitSoknadErrorAction        => ({type: PunchFormActionKeys.SOKAND_SUBMIT_ERROR, error});

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