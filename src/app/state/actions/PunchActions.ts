import {ApiPath}                               from 'app/apiConfig';
import {PunchActionKeys, PunchStep}            from 'app/models/enums';
import {IError, IFagsak, IJournalpost, IMappe} from 'app/models/types';
import {get}                                   from 'app/utils';

interface ISetIdentAction               {type: PunchActionKeys.IDENT_SET, ident: string}
interface ISetStepAction                {type: PunchActionKeys.STEP_SET, step: PunchStep}

interface ISetJournalpostAction         {type: PunchActionKeys.JOURNALPOST_SET, journalpost: IJournalpost}
interface IGetJournalpostLoadAction     {type: PunchActionKeys.JOURNALPOST_LOAD}
interface IGetJournalpostErrorAction    {type: PunchActionKeys.JOURNALPOST_REQUEST_ERROR, error: IError}

interface ISetMapperAction              {type: PunchActionKeys.MAPPER_SET, mapper: IMappe[]}
interface IFindMapperLoadingAction      {type: PunchActionKeys.MAPPER_LOAD, isLoading: boolean}
interface IFindMapperErrorAction        {type: PunchActionKeys.MAPPER_REQUEST_ERROR, error: IError}
interface IUndoSearchForMapper          {type: PunchActionKeys.MAPPER_UNDO_SEARCH}

interface ISetFagsakerAction            {type: PunchActionKeys.FAGSAKER_SET, fagsaker: IFagsak[]}
interface IFindFagsakerLoadAction       {type: PunchActionKeys.FAGSAKER_LOAD, isLoading: boolean}
interface IFindFagsakerErrorAction      {type: PunchActionKeys.FAGSAKER_REQUEST_ERROR, error: IError}

interface IOpenMappeAction              {type: PunchActionKeys.MAPPE_OPEN, mappe: IMappe}
interface ICloseMappeAction             {type: PunchActionKeys.MAPPE_CLOSE}
interface IChooseMappeAction            {type: PunchActionKeys.MAPPE_CHOOSE, mappe: IMappe}
interface INewMappeAction               {type: PunchActionKeys.MAPPE_NEW}
interface IUndoChoiceOfMappeAction      {type: PunchActionKeys.MAPPE_UNDO_CHOICE}

interface IOpenFagsakAction             {type: PunchActionKeys.FAGSAK_OPEN, fagsak: IFagsak}
interface ICloseFagsakAction            {type: PunchActionKeys.FAGSAK_CLOSE}

type        IIdentActionTypes       = ISetIdentAction;
type        IStepActionTypes        = ISetStepAction;
type        IJournalpostActionTypes = ISetJournalpostAction | IGetJournalpostLoadAction | IGetJournalpostErrorAction;
type        IMapperActionTypes      = ISetMapperAction | IFindMapperErrorAction | IFindMapperLoadingAction | IUndoSearchForMapper;
type        IFagsakerActionTypes    = ISetFagsakerAction | IFindFagsakerLoadAction | IFindFagsakerErrorAction;
type        IMappeinfoActionTypes   = IOpenMappeAction | ICloseMappeAction | IChooseMappeAction | INewMappeAction | IUndoChoiceOfMappeAction;
type        IFagsakinfoActionTypes  = IOpenFagsakAction | ICloseFagsakAction;

export type IPunchActionTypes       = IIdentActionTypes |
                                      IStepActionTypes |
                                      IJournalpostActionTypes |
                                      IMapperActionTypes |
                                      IFagsakerActionTypes |
                                      IMappeinfoActionTypes |
                                      IFagsakinfoActionTypes;

export function setIdentAction(ident: string):                      ISetIdentAction             {return {type: PunchActionKeys.IDENT_SET, ident}}
export function setStepAction(step: PunchStep):                     ISetStepAction              {return {type: PunchActionKeys.STEP_SET, step}}

export function setJournalpostAction(journalpost: IJournalpost):    ISetJournalpostAction       {return {type: PunchActionKeys.JOURNALPOST_SET, journalpost}}
export function getJournalpostLoadAction():                         IGetJournalpostLoadAction   {return {type: PunchActionKeys.JOURNALPOST_LOAD}}
export function getJournalpostErrorAction(error: IError):           IGetJournalpostErrorAction  {return {type: PunchActionKeys.JOURNALPOST_REQUEST_ERROR, error}}

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

export function setMapperAction(mapper: IMappe[]):                  ISetMapperAction            {return {type: PunchActionKeys.MAPPER_SET, mapper}}
export function findMapperLoadingAction(isLoading: boolean):        IFindMapperLoadingAction    {return {type: PunchActionKeys.MAPPER_LOAD, isLoading}}
export function findMapperErrorAction(error: IError):               IFindMapperErrorAction      {return {type: PunchActionKeys.MAPPER_REQUEST_ERROR, error}}
export function undoSearchForMapperAction():                        IUndoSearchForMapper        {return {type: PunchActionKeys.MAPPER_UNDO_SEARCH}}

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

export function setFagsakerAction(fagsaker: IFagsak[]):         ISetFagsakerAction          {return {type: PunchActionKeys.FAGSAKER_SET, fagsaker}}
export function findFagsakerLoadAction(isLoading: boolean):     IFindFagsakerLoadAction     {return {type: PunchActionKeys.FAGSAKER_LOAD, isLoading}}
export function findFagsakerErrorAction(error: IError):         IFindFagsakerErrorAction    {return {type: PunchActionKeys.FAGSAKER_REQUEST_ERROR, error}}

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

export function openMappeAction(mappe: IMappe):                 IOpenMappeAction            {return {type: PunchActionKeys.MAPPE_OPEN, mappe}}
export function closeMappeAction():                             ICloseMappeAction           {return {type: PunchActionKeys.MAPPE_CLOSE}}
export function chooseMappeAction(mappe: IMappe):               IChooseMappeAction          {return {type: PunchActionKeys.MAPPE_CHOOSE, mappe}}
export function newMappeAction():                               INewMappeAction             {return {type: PunchActionKeys.MAPPE_NEW}}
export function undoChoiceOfMappeAction():                      IUndoChoiceOfMappeAction    {return {type: PunchActionKeys.MAPPE_UNDO_CHOICE}}

export function openFagsakAction(fagsak: IFagsak):              IOpenFagsakAction           {return {type: PunchActionKeys.FAGSAK_OPEN, fagsak}}
export function closeFagsakAction():                            ICloseFagsakAction          {return {type: PunchActionKeys.FAGSAK_CLOSE}}

export function backFromForm(chosenMappe?: IMappe) {return (dispatch: any) => {
    return !!chosenMappe ? dispatch(undoChoiceOfMappeAction()) : dispatch(undoSearchForMapperAction());
}}