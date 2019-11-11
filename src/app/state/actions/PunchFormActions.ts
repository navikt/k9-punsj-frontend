import {PunchFormActionKeys} from "app/models/enums";
import {IOpphold} from "../../models/types";

interface ISetOppholdAction {type: PunchFormActionKeys.OPPHOLD_SET, opphold: IOpphold[]}

export type IPunchFormActionTypes = ISetOppholdAction;

export function setOppholdAction(opphold: IOpphold[]): ISetOppholdAction {return {type: PunchFormActionKeys.OPPHOLD_SET, opphold}}