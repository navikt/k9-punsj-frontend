import {ApiPath}                                  from 'app/apiConfig';
import {JaNeiVetikke, EksisterendeSoknaderActionKeys} from 'app/models/enums';
import {IError, IPersonlig} from 'app/models/types';
import {MappeRules}                               from 'app/rules';
import {convertResponseToError, get, post}        from 'app/utils';;
import {ISoknadV2} from "../../models/types/Soknadv2";

interface ISetEksisterendeSoknaderAction                  {type: EksisterendeSoknaderActionKeys.EKSISTERENDE_SOKNADER_SET, eksisterendeSoknaderSvar: ISoknadV2[]}
interface IFindEksisterendeSoknaderLoadingAction          {type: EksisterendeSoknaderActionKeys.EKSISTERENDE_SOKNADER_LOAD, isLoading: boolean}
interface IFindEksisterendeSoknaderErrorAction            {type: EksisterendeSoknaderActionKeys.EKSISTERENDE_SOKNADER_REQUEST_ERROR, error: IError}

interface IOpenEksisterendeSoknadAction                  {type: EksisterendeSoknaderActionKeys.EKSISTERENDE_SOKNAD_OPEN, soknadInfo: ISoknadV2}
interface ICloseEksisterendeSoknadAction                 {type: EksisterendeSoknaderActionKeys.EKSISTERENDE_SOKNAD_CLOSE}
interface IChooseSoknadAction                {type: EksisterendeSoknaderActionKeys.EKSISTERENDE_SOKNAD_CHOOSE, soknadInfo: ISoknadV2}
interface IUndoChoiceOfSoknadAction          {type: EksisterendeSoknaderActionKeys.EKSISTERENDE_SOKNAD_UNDO_CHOICE}

interface ICreateSoknadRequestAction         {type: EksisterendeSoknaderActionKeys.SOKNAD_CREATE_REQUEST}
interface ICreateSoknadSuccessAction         {type: EksisterendeSoknaderActionKeys.SOKNAD_CREATE_SUCCESS, id: string}
interface ICreateSoknadErrorAction           {type: EksisterendeSoknaderActionKeys.SOKNAD_CREATE_ERROR, error: IError}

interface IResetSoknadidAction               {type: EksisterendeSoknaderActionKeys.SOKNADID_RESET}

type        IMapperActionTypes      = ISetEksisterendeSoknaderAction | IFindEksisterendeSoknaderErrorAction | IFindEksisterendeSoknaderLoadingAction;
type        ISoknadinfoActionTypes   = IOpenEksisterendeSoknadAction | ICloseEksisterendeSoknadAction | IChooseSoknadAction | IUndoChoiceOfSoknadAction;
type        ICreateSoknadActions     = ICreateSoknadRequestAction | ICreateSoknadErrorAction | ICreateSoknadSuccessAction;

export type IEksisterendeSoknaderActionTypes = IMapperActionTypes |
                                           ISoknadinfoActionTypes |
                                           ICreateSoknadActions |
                                           IResetSoknadidAction;

export function setEksisterendeSoknaderAction(eksisterendeSoknaderSvar: ISoknadV2[]):              ISetEksisterendeSoknaderAction                {return {type: EksisterendeSoknaderActionKeys.EKSISTERENDE_SOKNADER_SET, eksisterendeSoknaderSvar}}
export function findEksisterendeSoknaderLoadingAction(isLoading: boolean):    IFindEksisterendeSoknaderLoadingAction        {return {type: EksisterendeSoknaderActionKeys.EKSISTERENDE_SOKNADER_LOAD, isLoading}}
export function findEksisterendeSoknaderErrorAction(error: IError):           IFindEksisterendeSoknaderErrorAction          {return {type: EksisterendeSoknaderActionKeys.EKSISTERENDE_SOKNADER_REQUEST_ERROR, error}}

export function findEksisterendeSoknader(ident1: string, ident2: string | null) {return (dispatch: any) => {
    dispatch(findEksisterendeSoknaderLoadingAction(true));
    const idents = ident2 ? `${ident1},${ident2}` : ident1;
    return get(ApiPath.EKSISTERENDE_SOKNADER_FIND, undefined, {'X-Nav-NorskIdent': idents}, (response, soknader) => {
        if (response.ok) {
            return dispatch(setEksisterendeSoknaderAction(soknader));
        }
        return dispatch(findEksisterendeSoknaderErrorAction(convertResponseToError(response)));
    });
}}

export function sokEksisterendeSoknader(ident1: string, ident2: string | null) {return (dispatch: any) => {
    dispatch(findEksisterendeSoknaderLoadingAction(true));
    const idents = ident2 ? `${ident1},${ident2}` : ident1;
    return get(ApiPath.EKSISTERENDE_SOKNADER_SOK, undefined, {'X-Nav-NorskIdent': idents}, response => {
        if (response.ok) {
            return response.json()
                .then(r => {
                    const {mapper} = r;
                    dispatch(setEksisterendeSoknaderAction(MappeRules.isMapperResponseValid(mapper) ? mapper : []));
                });
        }
        return dispatch(findEksisterendeSoknaderErrorAction(convertResponseToError(response)));
    });
}}

export function openEksisterendeSoknadAction(soknadInfo: ISoknadV2):                 IOpenEksisterendeSoknadAction                {return {type: EksisterendeSoknaderActionKeys.EKSISTERENDE_SOKNAD_OPEN, soknadInfo}}
export function closeEksisterendeSoknadAction():                             ICloseEksisterendeSoknadAction               {return {type: EksisterendeSoknaderActionKeys.EKSISTERENDE_SOKNAD_CLOSE}}
export function chooseEksisterendeSoknadAction(soknadInfo: ISoknadV2):               IChooseSoknadAction              {return {type: EksisterendeSoknaderActionKeys.EKSISTERENDE_SOKNAD_CHOOSE, soknadInfo}}
export function undoChoiceOfEksisterendeSoknadAction():                      IUndoChoiceOfSoknadAction        {return {type: EksisterendeSoknaderActionKeys.EKSISTERENDE_SOKNAD_UNDO_CHOICE}}
export function createSoknadRequestAction():                     ICreateSoknadRequestAction       {return {type: EksisterendeSoknaderActionKeys.SOKNAD_CREATE_REQUEST}}
export function createSoknadSuccessAction(id: string):           ICreateSoknadSuccessAction       {return {type: EksisterendeSoknaderActionKeys.SOKNAD_CREATE_SUCCESS, id}}
export function createSoknadErrorAction(error: IError):          ICreateSoknadErrorAction         {return {type: EksisterendeSoknaderActionKeys.SOKNAD_CREATE_ERROR, error}}
export function resetSoknadidAction():                           IResetSoknadidAction             {return {type: EksisterendeSoknaderActionKeys.SOKNADID_RESET}}
export function createSoknad(journalpostid: string, ident1: string, ident2: string | null) {return (dispatch: any) => {

    dispatch(createSoknadRequestAction());

    const initialInfo: IPersonlig = {
        journalpostId: journalpostid,
        soeknad: {
            søknadId: '',
            perioder: [{}],
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

    const requestBody = {
        journalpostId: journalpostid,
        norskIdent: ident1
    }


    post(ApiPath.SOKNAD_CREATE, undefined, undefined, requestBody, (response, soknad) => {
        if (response.status === 201) {
            return dispatch(createSoknadSuccessAction(soknad.soeknadId));
        }
        return dispatch(createSoknadErrorAction(convertResponseToError(response)));
    });
}}
