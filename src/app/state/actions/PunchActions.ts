import {ApiPath}                     from 'app/apiConfig';
import {PunchActionKeys, PunchStep}  from 'app/models/enums';
import {IError, IJournalpost}        from 'app/models/types';
import {convertResponseToError, get} from 'app/utils';

interface ISetIdentAction                   {type: PunchActionKeys.IDENT_SET, ident1: string, ident2: string | null}

interface ISetStepAction                    {type: PunchActionKeys.STEP_SET, step: PunchStep}
interface IBackFromFormAction               {type: PunchActionKeys.BACK_FROM_FORM}
interface IBackFromMapperOgFagsakerAction   {type: PunchActionKeys.BACK_FROM_MAPPER}

interface ISetJournalpostAction             {type: PunchActionKeys.JOURNALPOST_SET, journalpost: IJournalpost}
interface IGetJournalpostLoadAction         {type: PunchActionKeys.JOURNALPOST_LOAD}
interface IGetJournalpostErrorAction        {type: PunchActionKeys.JOURNALPOST_REQUEST_ERROR, error: IError}

interface IResetAction                      {type: PunchActionKeys.RESET}

type        IIdentActionTypes       = ISetIdentAction;
type        INavigationTypes        = ISetStepAction | IBackFromFormAction | IBackFromMapperOgFagsakerAction;
type        IJournalpostActionTypes = ISetJournalpostAction | IGetJournalpostLoadAction | IGetJournalpostErrorAction;

export type IPunchActionTypes       = IIdentActionTypes |
                                      INavigationTypes |
                                      IJournalpostActionTypes |
                                      IResetAction;

export function setIdentAction(ident1: string, ident2?: string | null): ISetIdentAction                 {return {type: PunchActionKeys.IDENT_SET, ident1, ident2: ident2 || null}}

export function setStepAction(step: PunchStep):                         ISetStepAction                  {return {type: PunchActionKeys.STEP_SET, step}}
export function undoSearchForMapperAction():                            IBackFromMapperOgFagsakerAction {return {type: PunchActionKeys.BACK_FROM_MAPPER}}

export function setJournalpostAction(journalpost: IJournalpost):        ISetJournalpostAction           {return {type: PunchActionKeys.JOURNALPOST_SET, journalpost}}
export function getJournalpostLoadAction():                             IGetJournalpostLoadAction       {return {type: PunchActionKeys.JOURNALPOST_LOAD}}
export function getJournalpostErrorAction(error: IError):               IGetJournalpostErrorAction      {return {type: PunchActionKeys.JOURNALPOST_REQUEST_ERROR, error}}

export function getJournalpost(journalpostid: string) {return (dispatch: any) => {
    dispatch(getJournalpostLoadAction());
    return get(ApiPath.JOURNALPOST_GET, {journalpostId: journalpostid}, undefined, response => {
        if (response.ok) {
            return response.json()
                           .then(journalpost => dispatch(setJournalpostAction(journalpost)));
        }
        return dispatch(getJournalpostErrorAction(convertResponseToError(response)));
    });
}}

export function resetPunchAction():                                     IResetAction                    {return {type: PunchActionKeys.RESET}}