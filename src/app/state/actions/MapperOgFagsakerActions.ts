import {ApiPath}                                      from 'app/apiConfig';
import {JaNeiVetikke, MapperOgFagsakerActionKeys}     from 'app/models/enums';
import {IError, IFagsak, IMappe, IPersonlig, ISoknad} from 'app/models/types';
import {MappeRules}                                   from 'app/rules';
import {convertResponseToError, get, post}            from 'app/utils';

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

export function setMapperAction(mapper: IMappe[]):              ISetMapperAction                {return {type: MapperOgFagsakerActionKeys.MAPPER_SET, mapper}}
export function findMapperLoadingAction(isLoading: boolean):    IFindMapperLoadingAction        {return {type: MapperOgFagsakerActionKeys.MAPPER_LOAD, isLoading}}
export function findMapperErrorAction(error: IError):           IFindMapperErrorAction          {return {type: MapperOgFagsakerActionKeys.MAPPER_REQUEST_ERROR, error}}

export function findMapper(ident1: string, ident2: string | null) {return (dispatch: any) => {
    dispatch(findMapperLoadingAction(true));
    const idents = ident2 ? `${ident1},${ident2}` : ident1;
    return get(ApiPath.MAPPER_FIND, undefined, {'X-Nav-NorskIdent': idents}, response => {
        if (response.ok) {
            return response.json()
                           .then(r => {
                               const {mapper} = r;
                               dispatch(setMapperAction(MappeRules.isMapperResponseValid(mapper) ? mapper : []));
                           });
        }
        return dispatch(findMapperErrorAction(convertResponseToError(response)));
    });
}}

export function setFagsakerAction(fagsaker: IFagsak[]):         ISetFagsakerAction              {return {type: MapperOgFagsakerActionKeys.FAGSAKER_SET, fagsaker}}
export function findFagsakerLoadAction(isLoading: boolean):     IFindFagsakerLoadAction         {return {type: MapperOgFagsakerActionKeys.FAGSAKER_LOAD, isLoading}}
export function findFagsakerErrorAction(error: IError):         IFindFagsakerErrorAction        {return {type: MapperOgFagsakerActionKeys.FAGSAKER_REQUEST_ERROR, error}}

export function findFagsaker(ident: string) {return (dispatch: any) => {
    dispatch(findFagsakerLoadAction(true));
    return get(ApiPath.FAGSAKER_FIND, {ident}, undefined,response => {
        if (response.ok) {
            // return response.json().then(r => dispatch(setFagsakerAction(r.fagsaker || [])));
            return response.json().then(r => dispatch(setFagsakerAction([]))); // TODO: Avklare hvorvidt fagsaker skal vises eller ikke
        }
        return dispatch(findFagsakerErrorAction(convertResponseToError(response)));
    });
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

export function createMappe(journalpostid: string, ident1: string, ident2: string | null) {return (dispatch: any) => {

    dispatch(createMappeRequestAction());

    const initialInfo: IPersonlig = {
        journalpostId: journalpostid,
        soeknad: {
            arbeid: {
                arbeidstaker: [],
                selvstendigNaeringsdrivende: [],
                frilanser: []
            },
            beredskap: [],
            nattevaak: [],
            spraak: 'nb',
            barn: {},
            tilsynsordning: {
                iTilsynsordning: JaNeiVetikke.NEI,
                opphold: []
            }
        }
    };

    const requestBody: Partial<IMappe> = !!ident2
        ? {personer: {[ident1]: initialInfo, [ident2]: initialInfo}}
        : {personer: {[ident1]: initialInfo}};

    return post(ApiPath.MAPPE_CREATE, undefined, undefined, requestBody, response => {
        if (response.status === 201) {
            return response.json()
                           .then(mappe => dispatch(createMappeSuccessAction(mappe.mappeId)));
        }
        return dispatch(createMappeErrorAction(convertResponseToError(response)));
    });
}}

export function resetMappeidAction():                       IResetMappeidAction                 {return {type: MapperOgFagsakerActionKeys.MAPPEID_RESET}}