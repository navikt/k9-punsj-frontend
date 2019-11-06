import {JaNeiVetikke, PunchFormActionKeys} from "app/models/enums";

interface ISetTilsynAction {type: PunchFormActionKeys.TILSYN_SET, tilsyn: JaNeiVetikke}

export type IPunchFormActionTypes = ISetTilsynAction;

export function setTilsynAction(tilsyn: JaNeiVetikke): ISetTilsynAction {return {type: PunchFormActionKeys.TILSYN_SET, tilsyn}}