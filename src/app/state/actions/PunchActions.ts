import {ApiPath}                     from 'app/apiConfig';
import {PunchActionKeys, PunchStep}  from 'app/models/enums';
import {IError, IJournalpost}        from 'app/models/types';
import {convertResponseToError, get} from 'app/utils';

interface ISetIdentAction                   {type: PunchActionKeys.IDENT_SET, ident: string}

interface ISetStepAction                    {type: PunchActionKeys.STEP_SET, step: PunchStep}
interface IBackFromFormAction               {type: PunchActionKeys.BACK_FROM_FORM}
interface IBackFromMapperOgFagsakerAction   {type: PunchActionKeys.BACK_FROM_MAPPER}

interface ISetJournalpostAction             {type: PunchActionKeys.JOURNALPOST_SET, journalpost: IJournalpost}
interface IGetJournalpostLoadAction         {type: PunchActionKeys.JOURNALPOST_LOAD}
interface IGetJournalpostErrorAction        {type: PunchActionKeys.JOURNALPOST_REQUEST_ERROR, error: IError}

type        IIdentActionTypes       = ISetIdentAction;
type        INavigationTypes        = ISetStepAction | IBackFromFormAction | IBackFromMapperOgFagsakerAction;
type        IJournalpostActionTypes = ISetJournalpostAction | IGetJournalpostLoadAction | IGetJournalpostErrorAction;

export type IPunchActionTypes       = IIdentActionTypes |
                                      INavigationTypes |
                                      IJournalpostActionTypes;

export function setIdentAction(ident: string):                      ISetIdentAction                 {return {type: PunchActionKeys.IDENT_SET, ident}}

export function setStepAction(step: PunchStep):                     ISetStepAction                  {return {type: PunchActionKeys.STEP_SET, step}}
export function undoSearchForMapperAction():                        IBackFromMapperOgFagsakerAction {return {type: PunchActionKeys.BACK_FROM_MAPPER}}

export function setJournalpostAction(journalpost: IJournalpost):    ISetJournalpostAction           {return {type: PunchActionKeys.JOURNALPOST_SET, journalpost}}
export function getJournalpostLoadAction():                         IGetJournalpostLoadAction       {return {type: PunchActionKeys.JOURNALPOST_LOAD}}
export function getJournalpostErrorAction(error: IError):           IGetJournalpostErrorAction      {return {type: PunchActionKeys.JOURNALPOST_REQUEST_ERROR, error}}

export function getJournalpost(journalpostid: string) {return (dispatch: any) => {
    dispatch(getJournalpostLoadAction());
    return get(ApiPath.JOURNALPOST_GET, {journalpost_id: journalpostid}, undefined, response => {
        if (response.ok) {
            return response.json()
                           .then(journalpost => dispatch(setJournalpostAction(journalpost)));
        }
        return dispatch(getJournalpostErrorAction(convertResponseToError(response)));
    });
}}