import {FordelingActionKeys, Sakstype} from 'app/models/enums';

interface ISetSakstypeAction {type: FordelingActionKeys.SAKSTYPE_SET, sakstype: Sakstype}

export type IFordelingActionTypes = ISetSakstypeAction;

export const setSakstypeAction = (sakstype: Sakstype): ISetSakstypeAction => ({type: FordelingActionKeys.SAKSTYPE_SET, sakstype});