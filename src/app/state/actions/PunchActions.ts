import {ApiPath}                               from 'app/apiConfig';
import {PunchActionKeys, PunchStep}            from 'app/models/enums';
import {IError, IFagsak, IJournalpost, IMappe} from 'app/models/types';
import {get, post}                             from 'app/utils';

interface ISetIdentAction                   {type: PunchActionKeys.IDENT_SET, ident: string}

interface ISetStepAction                    {type: PunchActionKeys.STEP_SET, step: PunchStep}
interface IBackFromFormAction               {type: PunchActionKeys.BACK_FROM_FORM}
interface IBackFromMapperOgFagsakerAction   {type: PunchActionKeys.BACK_FROM_MAPPER}

interface ISetJournalpostAction             {type: PunchActionKeys.JOURNALPOST_SET, journalpost: IJournalpost}
interface IGetJournalpostLoadAction         {type: PunchActionKeys.JOURNALPOST_LOAD}
interface IGetJournalpostErrorAction        {type: PunchActionKeys.JOURNALPOST_REQUEST_ERROR, error: IError}

interface ISetMapperAction                  {type: PunchActionKeys.MAPPER_SET, mapper: IMappe[]}
interface IFindMapperLoadingAction          {type: PunchActionKeys.MAPPER_LOAD, isLoading: boolean}
interface IFindMapperErrorAction            {type: PunchActionKeys.MAPPER_REQUEST_ERROR, error: IError}

interface ISetFagsakerAction                {type: PunchActionKeys.FAGSAKER_SET, fagsaker: IFagsak[]}
interface IFindFagsakerLoadAction           {type: PunchActionKeys.FAGSAKER_LOAD, isLoading: boolean}
interface IFindFagsakerErrorAction          {type: PunchActionKeys.FAGSAKER_REQUEST_ERROR, error: IError}

interface IOpenMappeAction                  {type: PunchActionKeys.MAPPE_OPEN, mappe: IMappe}
interface ICloseMappeAction                 {type: PunchActionKeys.MAPPE_CLOSE}
interface IChooseMappeAction                {type: PunchActionKeys.MAPPE_CHOOSE, mappe: IMappe}
interface IUndoChoiceOfMappeAction          {type: PunchActionKeys.MAPPE_UNDO_CHOICE}

interface IOpenFagsakAction                 {type: PunchActionKeys.FAGSAK_OPEN, fagsak: IFagsak}
interface ICloseFagsakAction                {type: PunchActionKeys.FAGSAK_CLOSE}

interface ICreateMappeRequestAction         {type: PunchActionKeys.MAPPE_CREATE_REQUEST}
interface ICreateMappeSuccessAction         {type: PunchActionKeys.MAPPE_CREATE_SUCCESS, id: string}
interface ICreateMappeErrorAction           {type: PunchActionKeys.MAPPE_CREATE_ERROR, error: IError}

type        IIdentActionTypes       = ISetIdentAction;
type        INavigationTypes        = ISetStepAction | IBackFromFormAction | IBackFromMapperOgFagsakerAction;
type        IJournalpostActionTypes = ISetJournalpostAction | IGetJournalpostLoadAction | IGetJournalpostErrorAction;
type        IMapperActionTypes      = ISetMapperAction | IFindMapperErrorAction | IFindMapperLoadingAction | IBackFromMapperOgFagsakerAction;
type        IFagsakerActionTypes    = ISetFagsakerAction | IFindFagsakerLoadAction | IFindFagsakerErrorAction;
type        IMappeinfoActionTypes   = IOpenMappeAction | ICloseMappeAction | IChooseMappeAction | IUndoChoiceOfMappeAction;
type        IFagsakinfoActionTypes  = IOpenFagsakAction | ICloseFagsakAction;
type        ICreateMappeActions     = ICreateMappeRequestAction | ICreateMappeErrorAction | ICreateMappeSuccessAction;

export type IPunchActionTypes       = IIdentActionTypes |
                                      INavigationTypes |
                                      IJournalpostActionTypes |
                                      IMapperActionTypes |
                                      IFagsakerActionTypes |
                                      IMappeinfoActionTypes |
                                      IFagsakinfoActionTypes |
                                      ICreateMappeActions;

export function setIdentAction(ident: string):                      ISetIdentAction                 {return {type: PunchActionKeys.IDENT_SET, ident}}

export function setStepAction(step: PunchStep):                     ISetStepAction                  {return {type: PunchActionKeys.STEP_SET, step}}
export function undoSearchForMapperAction():                        IBackFromMapperOgFagsakerAction {return {type: PunchActionKeys.BACK_FROM_MAPPER}}
export function backFromFormAction():                               IBackFromFormAction             {return {type: PunchActionKeys.BACK_FROM_FORM}}

export function setJournalpostAction(journalpost: IJournalpost):    ISetJournalpostAction           {return {type: PunchActionKeys.JOURNALPOST_SET, journalpost}}
export function getJournalpostLoadAction():                         IGetJournalpostLoadAction       {return {type: PunchActionKeys.JOURNALPOST_LOAD}}
export function getJournalpostErrorAction(error: IError):           IGetJournalpostErrorAction      {return {type: PunchActionKeys.JOURNALPOST_REQUEST_ERROR, error}}

export function getJournalpost(journalpostid: string) {return (dispatch: any) => {
    dispatch(getJournalpostLoadAction());
    return get(ApiPath.JOURNALPOST_GET, {journalpost_id: journalpostid}, response => {
        if (response.ok) {
            return response.json()
                           .then(journalpost => dispatch(setJournalpostAction(journalpost)));
        }
        return dispatch(getJournalpostErrorAction({
            status:     response.status,
            statusText: response.statusText,
            url:        response.url
        }));
    });
}}

export function setMapperAction(mapper: IMappe[]):                  ISetMapperAction                {return {type: PunchActionKeys.MAPPER_SET, mapper}}
export function findMapperLoadingAction(isLoading: boolean):        IFindMapperLoadingAction        {return {type: PunchActionKeys.MAPPER_LOAD, isLoading}}
export function findMapperErrorAction(error: IError):               IFindMapperErrorAction          {return {type: PunchActionKeys.MAPPER_REQUEST_ERROR, error}}

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

export function setFagsakerAction(fagsaker: IFagsak[]):         ISetFagsakerAction              {return {type: PunchActionKeys.FAGSAKER_SET, fagsaker}}
export function findFagsakerLoadAction(isLoading: boolean):     IFindFagsakerLoadAction         {return {type: PunchActionKeys.FAGSAKER_LOAD, isLoading}}
export function findFagsakerErrorAction(error: IError):         IFindFagsakerErrorAction        {return {type: PunchActionKeys.FAGSAKER_REQUEST_ERROR, error}}

export function findFagsaker(ident: string) {return (dispatch: any) => {
    dispatch(findFagsakerLoadAction(true));
    return get(ApiPath.FAGSAKER_FIND, {ident}, response => {
        if (response.ok) {
            return response.json().then(fagsaker => dispatch(setFagsakerAction(fagsaker)));
        }
        return dispatch(findFagsakerErrorAction({
            status:     response.status,
            statusText: response.statusText,
            url:        response.url
        }));
    })
}}

export function openMappeAction(mappe: IMappe):                 IOpenMappeAction                {return {type: PunchActionKeys.MAPPE_OPEN, mappe}}
export function closeMappeAction():                             ICloseMappeAction               {return {type: PunchActionKeys.MAPPE_CLOSE}}
export function chooseMappeAction(mappe: IMappe):               IChooseMappeAction              {return {type: PunchActionKeys.MAPPE_CHOOSE, mappe}}
export function undoChoiceOfMappeAction():                      IUndoChoiceOfMappeAction        {return {type: PunchActionKeys.MAPPE_UNDO_CHOICE}}

export function openFagsakAction(fagsak: IFagsak):              IOpenFagsakAction               {return {type: PunchActionKeys.FAGSAK_OPEN, fagsak}}
export function closeFagsakAction():                            ICloseFagsakAction              {return {type: PunchActionKeys.FAGSAK_CLOSE}}

export function createMappeRequestAction():                     ICreateMappeRequestAction       {return {type: PunchActionKeys.MAPPE_CREATE_REQUEST}}
export function createMappeSuccessAction(id: string):           ICreateMappeSuccessAction       {return {type: PunchActionKeys.MAPPE_CREATE_SUCCESS, id}}
export function createMappeErrorAction(error: IError):          ICreateMappeErrorAction         {return {type: PunchActionKeys.MAPPE_CREATE_ERROR, error}}

export function createMappe(ident: string) {return (dispatch: any) => {

    dispatch(createMappeRequestAction());

    const requestBody: Partial<IMappe> = {
        norsk_ident: ident,
        innhold: {soker: {norsk_identitetsnummer: ident}}
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
































