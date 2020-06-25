import {ApiPath}                       from 'app/apiConfig';
import {FordelingActionKeys, Sakstype} from 'app/models/enums';
import {IError}                        from 'app/models/types';
import {convertResponseToError, post}  from 'app/utils';

interface ISetSakstypeAction        {type: FordelingActionKeys.SAKSTYPE_SET, sakstype?: Sakstype}

interface IOmfordelingRequestAction {type: FordelingActionKeys.OMFORDELING_REQUEST}
interface IOmfordelingSuccessAction {type: FordelingActionKeys.OMFORDELING_SUCCESS}
interface IOmfordelingErrorAction   {type: FordelingActionKeys.OMFORDELING_ERROR, error: IError}

export type IFordelingActionTypes = ISetSakstypeAction |
                                    IOmfordelingRequestAction |
                                    IOmfordelingSuccessAction |
                                    IOmfordelingErrorAction;

export const setSakstypeAction = (sakstype?: Sakstype): ISetSakstypeAction => ({type: FordelingActionKeys.SAKSTYPE_SET, sakstype});

export const omfordelingRequestAction   = ():               IOmfordelingRequestAction   => ({type: FordelingActionKeys.OMFORDELING_REQUEST});
export const omfordelingSuccessAction   = ():               IOmfordelingSuccessAction   => ({type: FordelingActionKeys.OMFORDELING_SUCCESS});
export const omfordelingErrorAction     = (error: IError):  IOmfordelingErrorAction     => ({type: FordelingActionKeys.OMFORDELING_ERROR, error});

export const omfordel = (journalpostid: string, sakstype: Sakstype) => {return (dispatch: any) => {

    if (sakstype === Sakstype.PLEIEPENGER_SYKT_BARN) {return}

    dispatch(omfordelingRequestAction());

    let ytelse: string;
    switch (sakstype) {
        case Sakstype.OMSORGSPENGER:                    ytelse = 'Omsorgspenger';           break;
        case Sakstype.OPPLAERINGSPENGER:                ytelse = 'Opplæringspenger';        break;
        case Sakstype.PLEIEPENGER_I_LIVETS_SLUTTFASE:   ytelse = 'PleiepengerNærstående';   break;
        default:                                        ytelse = 'Annet';
    }
    post(
        ApiPath.JOURNALPOST_OMFORDEL,
        {journalpostId: journalpostid},
        undefined,
        {ytelse},
        response => {
            if (response.status === 204) {return dispatch(omfordelingSuccessAction())}
            return dispatch(omfordelingErrorAction(convertResponseToError(response)));
        }
    );
}};
