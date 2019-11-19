import {PunchFormActionKeys} from "app/models/enums";
import {IOpphold, ISoknad} from "app/models/types";

interface ISetSoknadAction {type: PunchFormActionKeys.SOKNAD_SET, soknad: ISoknad}
interface ISetOppholdAction {type: PunchFormActionKeys.OPPHOLD_SET, opphold: IOpphold[]}

export type IPunchFormActionTypes = ISetSoknadAction | ISetOppholdAction;

export function setSoknadAction(soknad: ISoknad): ISetSoknadAction {return {type: PunchFormActionKeys.SOKNAD_SET, soknad}}
export function setOppholdAction(opphold: IOpphold[]): ISetOppholdAction {return {type: PunchFormActionKeys.OPPHOLD_SET, opphold}}