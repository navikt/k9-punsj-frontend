import {ApiPath}                 from 'app/apiConfig';
import {PunchFormActionKeys}     from 'app/models/enums';
import {IError, IMappe, ISoknad} from 'app/models/types';
import {get}                     from 'app/utils';

interface IGetMappeLoadingAction    {type: PunchFormActionKeys.MAPPE_LOAD}
interface IGetMappeErrorAction      {type: PunchFormActionKeys.MAPPE_REQUEST_ERROR, error: IError}
interface ISetMappeAction           {type: PunchFormActionKeys.MAPPE_SET,           mappe: IMappe}
interface IResetMappeAction         {type: PunchFormActionKeys.MAPPE_RESET}
interface ISetSoknadAction          {type: PunchFormActionKeys.SOKNAD_SET,          soknad: ISoknad}

type IMappeActionTypes = IGetMappeLoadingAction | IGetMappeErrorAction | ISetMappeAction | IResetMappeAction;
export type IPunchFormActionTypes = IMappeActionTypes | ISetSoknadAction;

export const getMappeLoadingAction  = ():                   IGetMappeLoadingAction  => ({type: PunchFormActionKeys.MAPPE_LOAD});
export const getMappeErrorAction    = (error: IError):      IGetMappeErrorAction    => ({type: PunchFormActionKeys.MAPPE_REQUEST_ERROR, error});
export const setMappeAction         = (mappe: IMappe):      ISetMappeAction         => ({type: PunchFormActionKeys.MAPPE_SET, mappe});
export const resetMappeAction       = ():                   IResetMappeAction       => ({type: PunchFormActionKeys.MAPPE_RESET});
export const setSoknadAction        = (soknad: ISoknad):    ISetSoknadAction        => ({type: PunchFormActionKeys.SOKNAD_SET, soknad});

export function getMappe(id: string) {return (dispatch: any) => {
    dispatch(getMappeLoadingAction());
    return get(ApiPath.MAPPE_GET, {id}, response => {
        if (response.ok) {
            return response.json()
                           .then(mappe => dispatch(setMappeAction(mappe)));
        }
        return dispatch(getMappeErrorAction({
            status:     response.status,
            statusText: response.statusText,
            url:        response.url
        }));
    });
}}