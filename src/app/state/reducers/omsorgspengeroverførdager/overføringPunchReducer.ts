import { Dispatch } from 'redux';
import {
    Innsendingsstatus,
    IOverføringPunchSkjema,
    tomtSkjema,
} from '../../../models/forms/omsorgspenger/overføring/PunchSkjema';
import { convertResponseToError, post } from '../../../utils';
import { ApiPath } from '../../../apiConfig';
import { RootStateType } from '../../RootState';
import { IError } from '../../../models/types';
import { resetDedupKey } from '../FellesReducer';

export interface IOverføringPunchState {
    skjema: IOverføringPunchSkjema;
    innsendingsstatus: Innsendingsstatus;
    innsendingsfeil?: IError;
}

enum ActionTypes {
    SET_SKJEMA = 'OVERFØRING/PUNCH/SET_SKJEMA',
    SENDER_INN_SKJEMA = 'OVERFØRING/PUNCH/SENDER_INN_SKJEMA',
    SKJEMA_ER_SENDT_INN = 'OVERFØRING/PUNCH/SKJEMA_ER_SENDT_INN',
    INNSENDINGSFEIL = 'OVERFØRING/PUNCH/INNSENDINGSFEIL',
}

interface ISetSkjemaAction {
    type: ActionTypes.SET_SKJEMA;
    payload: IOverføringPunchSkjema;
}

interface ISendInnSkjemaAction {
    type: ActionTypes.SENDER_INN_SKJEMA;
    payload: IOverføringPunchSkjema;
}

interface ISkjemaErSendtInnAction {
    type: ActionTypes.SKJEMA_ER_SENDT_INN;
}

interface IInnsendingsfeilAction {
    type: ActionTypes.INNSENDINGSFEIL;
    payload: IError;
}

type Actions = ISetSkjemaAction | ISendInnSkjemaAction | IInnsendingsfeilAction | ISkjemaErSendtInnAction;

export const setSkjema = (skjema: IOverføringPunchSkjema): ISetSkjemaAction => ({
    type: ActionTypes.SET_SKJEMA,
    payload: skjema,
});

export const senderInnSkjema = () => ({
    type: ActionTypes.SENDER_INN_SKJEMA,
});

export const skjemaErSendtInn = () => ({
    type: ActionTypes.SKJEMA_ER_SENDT_INN,
});

export const innsendingsfeil = (error: IError): IInnsendingsfeilAction => ({
    type: ActionTypes.INNSENDINGSFEIL,
    payload: error,
});

interface IOverførDagerDTO {
    søknad: IOverføringPunchSkjema;
    journalpostIder: string[];
    dedupKey: string;
}

export const sendInnSkjema =
    (skjema: IOverføringPunchSkjema) => (dispatch: Dispatch, getState: () => RootStateType) => {
        dispatch(senderInnSkjema());

        const { felles } = getState();
        const postBody: IOverførDagerDTO = {
            journalpostIder: [felles.journalpost!.journalpostId],
            søknad: skjema,
            dedupKey: felles.dedupKey,
        };
        post<IOverførDagerDTO>(
            ApiPath.OMS_OVERFØR_DAGER,
            undefined,
            undefined,
            postBody,
            // @ts-ignore
            (response, responseData) => {
                switch (response.status) {
                    case 202:
                        dispatch(skjemaErSendtInn());
                        return dispatch(resetDedupKey());
                    default: {
                        const error: IError = {
                            ...convertResponseToError(response),
                            exceptionId: responseData?.exceptionId,
                            message: responseData?.message,
                        };
                        return dispatch(innsendingsfeil(error));
                    }
                }
            }
        );
    };

const initialState: IOverføringPunchState = {
    skjema: tomtSkjema,
    innsendingsstatus: Innsendingsstatus.IkkeSendtInn,
};

export default function overføringPunchReducer(
    state: IOverføringPunchState = initialState,
    action: Actions
): IOverføringPunchState {
    switch (action.type) {
        case ActionTypes.SET_SKJEMA:
            return {
                ...state,
                skjema: action.payload,
            };
        case ActionTypes.SENDER_INN_SKJEMA:
            return {
                ...state,
                innsendingsstatus: Innsendingsstatus.SenderInn,
            };
        case ActionTypes.SKJEMA_ER_SENDT_INN:
            return {
                ...state,
                innsendingsstatus: Innsendingsstatus.SendtInn,
            };
        case ActionTypes.INNSENDINGSFEIL:
            return {
                ...state,
                innsendingsstatus: Innsendingsstatus.Innsendingsfeil,
                innsendingsfeil: action.payload,
            };
        default:
            return state;
    }
}
