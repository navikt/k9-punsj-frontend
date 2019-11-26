import {ApiPath}                           from 'app/apiConfig';
import {PunchFormActionKeys}               from 'app/models/enums';
import {IError, IMappe, IOpphold, ISoknad} from 'app/models/types';
import {get}                               from 'app/utils';

interface IGetMappeLoadingAction    {type: PunchFormActionKeys.MAPPE_LOAD}
interface IGetMappeErrorAction      {type: PunchFormActionKeys.MAPPE_REQUEST_ERROR, error: IError}
interface ISetMappeAction           {type: PunchFormActionKeys.MAPPE_SET,           mappe: IMappe}
interface IResetMappeAction         {type: PunchFormActionKeys.MAPPE_RESET}
interface ISetSoknadAction          {type: PunchFormActionKeys.SOKNAD_SET,          soknad: ISoknad}

type IMappeActionTypes = IGetMappeLoadingAction | IGetMappeErrorAction | ISetMappeAction | IResetMappeAction;
export type IPunchFormActionTypes = IMappeActionTypes | ISetSoknadAction;

export function getMappeLoadingAction():                IGetMappeLoadingAction  {return {type: PunchFormActionKeys.MAPPE_LOAD}}
export function getMappeErrorAction(error: IError):     IGetMappeErrorAction    {return {type: PunchFormActionKeys.MAPPE_REQUEST_ERROR, error}}
export function setMappeAction(mappe: IMappe):          ISetMappeAction         {return {type: PunchFormActionKeys.MAPPE_SET, mappe}}
export function resetMappeAction():                     IResetMappeAction       {return {type: PunchFormActionKeys.MAPPE_RESET}}
export function setSoknadAction(soknad: ISoknad):       ISetSoknadAction        {return {type: PunchFormActionKeys.SOKNAD_SET, soknad}}

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