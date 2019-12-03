import {ApiPath}                    from 'app/apiConfig';
import {MapperOgFagsakerActionKeys} from 'app/models/enums';
import {IError, IFagsak, IMappe}    from 'app/models/types';
import {get, post}                  from 'app/utils';

interface ISetMapperAction                  {type: MapperOgFagsakerActionKeys.MAPPER_SET, mapper: IMappe[]}
interface IFindMapperLoadingAction          {type: MapperOgFagsakerActionKeys.MAPPER_LOAD, isLoading: boolean}
interface IFindMapperErrorAction            {type: MapperOgFagsakerActionKeys.MAPPER_REQUEST_ERROR, error: IError}

interface ISetFagsakerAction                {type: MapperOgFagsakerActionKeys.FAGSAKER_SET, fagsaker: IFagsak[]}
interface IFindFagsakerLoadAction           {type: MapperOgFagsakerActionKeys.FAGSAKER_LOAD, isLoading: boolean}
interface IFindFagsakerErrorAction          {type: MapperOgFagsakerActionKeys.FAGSAKER_REQUEST_ERROR, error: IError}

interface IOpenMappeAction                  {type: MapperOgFagsakerActionKeys.MAPPE_OPEN, mappe: IMappe}
interface ICloseMappeAction                 {type: MapperOgFagsakerActionKeys.MAPPE_CLOSE}
interface IChooseMappeAction                {type: MapperOgFagsakerActionKeys.MAPPE_CHOOSE, mappe: IMappe}
interface IUndoChoiceOfMappeAction          {type: MapperOgFagsakerActionKeys.MAPPE_UNDO_CHOICE}

interface IOpenFagsakAction                 {type: MapperOgFagsakerActionKeys.FAGSAK_OPEN, fagsak: IFagsak}
interface ICloseFagsakAction                {type: MapperOgFagsakerActionKeys.FAGSAK_CLOSE}

interface ICreateMappeRequestAction         {type: MapperOgFagsakerActionKeys.MAPPE_CREATE_REQUEST}
interface ICreateMappeSuccessAction         {type: MapperOgFagsakerActionKeys.MAPPE_CREATE_SUCCESS, id: string}
interface ICreateMappeErrorAction           {type: MapperOgFagsakerActionKeys.MAPPE_CREATE_ERROR, error: IError}

interface IResetMappeidAction               {type: MapperOgFagsakerActionKeys.MAPPEID_RESET}

type        IMapperActionTypes      = ISetMapperAction | IFindMapperErrorAction | IFindMapperLoadingAction;
type        IFagsakerActionTypes    = ISetFagsakerAction | IFindFagsakerLoadAction | IFindFagsakerErrorAction;
type        IMappeinfoActionTypes   = IOpenMappeAction | ICloseMappeAction | IChooseMappeAction | IUndoChoiceOfMappeAction;
type        IFagsakinfoActionTypes  = IOpenFagsakAction | ICloseFagsakAction;
type        ICreateMappeActions     = ICreateMappeRequestAction | ICreateMappeErrorAction | ICreateMappeSuccessAction;

export type IMapperOgFagsakerActionTypes = IMapperActionTypes |
                                           IFagsakerActionTypes |
                                           IMappeinfoActionTypes |
                                           IFagsakinfoActionTypes |
                                           ICreateMappeActions |
                                           IResetMappeidAction;

export function setMapperAction(mapper: IMappe[]):                  ISetMapperAction                {return {type: MapperOgFagsakerActionKeys.MAPPER_SET, mapper}}
export function findMapperLoadingAction(isLoading: boolean):        IFindMapperLoadingAction        {return {type: MapperOgFagsakerActionKeys.MAPPER_LOAD, isLoading}}
export function findMapperErrorAction(error: IError):               IFindMapperErrorAction          {return {type: MapperOgFagsakerActionKeys.MAPPER_REQUEST_ERROR, error}}

export function findMapper(ident: string) {return (dispatch: any) => {
    dispatch(findMapperLoadingAction(true));
    return get(ApiPath.MAPPER_FIND, {ident}, response => {
        if (response.ok) {
            return response.json()
                           .then(mapper => dispatch(setMapperAction(mapper)));
        }
        return dispatch(findMapperErrorAction({
            status:     response.status,
            statusText: response.statusText,
            url:        response.url
        }));
    });
}}

export function setFagsakerAction(fagsaker: IFagsak[]):         ISetFagsakerAction              {return {type: MapperOgFagsakerActionKeys.FAGSAKER_SET, fagsaker}}
export function findFagsakerLoadAction(isLoading: boolean):     IFindFagsakerLoadAction         {return {type: MapperOgFagsakerActionKeys.FAGSAKER_LOAD, isLoading}}
export function findFagsakerErrorAction(error: IError):         IFindFagsakerErrorAction        {return {type: MapperOgFagsakerActionKeys.FAGSAKER_REQUEST_ERROR, error}}

export function findFagsaker(ident: string) {return (dispatch: any) => {
    dispatch(findFagsakerLoadAction(true));
    return get(ApiPath.FAGSAKER_FIND, {ident}, response => {
        if (response.ok) {
            return response.json().then(r => dispatch(setFagsakerAction(r.fagsaker || [])));
        }
        return dispatch(findFagsakerErrorAction({
            status:     response.status,
            statusText: response.statusText,
            url:        response.url
        }));
    })
}}

export function openMappeAction(mappe: IMappe):                 IOpenMappeAction                {return {type: MapperOgFagsakerActionKeys.MAPPE_OPEN, mappe}}
export function closeMappeAction():                             ICloseMappeAction               {return {type: MapperOgFagsakerActionKeys.MAPPE_CLOSE}}
export function chooseMappeAction(mappe: IMappe):               IChooseMappeAction              {return {type: MapperOgFagsakerActionKeys.MAPPE_CHOOSE, mappe}}
export function undoChoiceOfMappeAction():                      IUndoChoiceOfMappeAction        {return {type: MapperOgFagsakerActionKeys.MAPPE_UNDO_CHOICE}}

export function openFagsakAction(fagsak: IFagsak):              IOpenFagsakAction               {return {type: MapperOgFagsakerActionKeys.FAGSAK_OPEN, fagsak}}
export function closeFagsakAction():                            ICloseFagsakAction              {return {type: MapperOgFagsakerActionKeys.FAGSAK_CLOSE}}

export function createMappeRequestAction():                     ICreateMappeRequestAction       {return {type: MapperOgFagsakerActionKeys.MAPPE_CREATE_REQUEST}}
export function createMappeSuccessAction(id: string):           ICreateMappeSuccessAction       {return {type: MapperOgFagsakerActionKeys.MAPPE_CREATE_SUCCESS, id}}
export function createMappeErrorAction(error: IError):          ICreateMappeErrorAction         {return {type: MapperOgFagsakerActionKeys.MAPPE_CREATE_ERROR, error}}

export function createMappe(ident: string, journalpostid: string) {return (dispatch: any) => {

    dispatch(createMappeRequestAction());

    const requestBody = {
        norsk_ident: ident,
        journalpost_id: journalpostid,
        innhold: {søker: {fødselsnummer: ident}}
    };

    return post(ApiPath.MAPPE_CREATE, undefined, requestBody, response => {
        if (response.status === 201) {
            return response.json()
                           .then(mappe => dispatch(createMappeSuccessAction(mappe.mappe_id)));
        }
        return dispatch(createMappeErrorAction({
            status:     response.status,
            statusText: response.statusText,
            url:        response.url
        }));
    });
}}

export function resetMappeidAction():                       IResetMappeidAction                 {return {type: MapperOgFagsakerActionKeys.MAPPEID_RESET}}