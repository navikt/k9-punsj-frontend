import {ApiPath, get} from "../../apiConfig";
import {PunchActionKeys} from "../../models/enums/PunchActionKeys";
import {IError, IMappe} from "../../models/types";

interface ISetIdentAction           {type: PunchActionKeys.IDENT_SET,               ident: string}

interface ISetMapperAction          {type: PunchActionKeys.MAPPER_SET,              mapper: IMappe[]}
interface IFindMapperLoadingAction  {type: PunchActionKeys.MAPPER_LOAD,             isLoading: boolean}
interface IFindMapperErrorAction    {type: PunchActionKeys.MAPPER_REQUEST_ERROR,    error: IError}
interface IUndoSearchForMapper      {type: PunchActionKeys.MAPPER_UNDO_SEARCH}

interface IOpenMappeAction          {type: PunchActionKeys.MAPPE_OPEN,              mappe: IMappe}
interface ICloseMappeAction         {type: PunchActionKeys.MAPPE_CLOSE}
interface IChooseMappeAction        {type: PunchActionKeys.MAPPE_CHOOSE,            mappe: IMappe}
interface INewMappeAction           {type: PunchActionKeys.MAPPE_NEW}
interface IUndoChoiceOfMappeAction  {type: PunchActionKeys.MAPPE_UNDO_CHOICE}

type        IIdentActionTypes       = ISetIdentAction;
type        IMapperActionTypes      = ISetMapperAction | IFindMapperErrorAction | IFindMapperLoadingAction | IUndoSearchForMapper;
type        IMappeinfoActionTypes   = IOpenMappeAction | ICloseMappeAction | IChooseMappeAction | INewMappeAction | IUndoChoiceOfMappeAction;
export type IPunchActionTypes       = IIdentActionTypes | IMapperActionTypes | IMappeinfoActionTypes;

export function setIdentAction(ident: string):                  ISetIdentAction             {return {type: PunchActionKeys.IDENT_SET, ident}}

export function setMapperAction(mapper: IMappe[]):              ISetMapperAction            {return {type: PunchActionKeys.MAPPER_SET, mapper}}
export function findMapperLoadingAction(isLoading: boolean):    IFindMapperLoadingAction    {return {type: PunchActionKeys.MAPPER_LOAD, isLoading}}
export function findMapperErrorAction(error: IError):           IFindMapperErrorAction      {return {type: PunchActionKeys.MAPPER_REQUEST_ERROR, error}}
export function undoSearchForMapperAction():                    IUndoSearchForMapper        {return {type: PunchActionKeys.MAPPER_UNDO_SEARCH}}

export function findMapper(ident: string) {return (dispatch: any) => {
    dispatch(findMapperLoadingAction(true));
    return get(ApiPath.MAPPER_FIND, {ident}).then(response => {
        if (response.ok) {
            return response.json()
                           .then(mapper => dispatch(setMapperAction(mapper)))
                           .then(action => !action.mapper.length && dispatch(newMappeAction()));
        }
        return dispatch(findMapperErrorAction({
            status:     response.status,
            statusText: response.statusText,
            url:        response.url
        }));
    });
}}

export function openMappeAction(mappe: IMappe):                 IOpenMappeAction            {return {type: PunchActionKeys.MAPPE_OPEN, mappe}}
export function closeMappeAction():                             ICloseMappeAction           {return {type: PunchActionKeys.MAPPE_CLOSE}}
export function chooseMappeAction(mappe: IMappe):               IChooseMappeAction          {return {type: PunchActionKeys.MAPPE_CHOOSE, mappe}}
export function newMappeAction():                               INewMappeAction             {return {type: PunchActionKeys.MAPPE_NEW}}
export function undoChoiceOfMappeAction():                      IUndoChoiceOfMappeAction    {return {type: PunchActionKeys.MAPPE_UNDO_CHOICE}}

export function backFromForm(chosenMappe?: IMappe) {return (dispatch: any) => {
    return !!chosenMappe ? dispatch(undoChoiceOfMappeAction()) : dispatch(undoSearchForMapperAction());
}}