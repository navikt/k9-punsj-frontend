import {MappeSokActionKeys} from "../../models/enums/MappeSokActionKeys";
import {MapperVisningStep} from "../../models/enums/MapperVisningStep";

interface ISetIdentSokAction {
    type: MappeSokActionKeys.IDENT_SET;
    ident: string;
}

interface ISetStepSokAction {
    type: MappeSokActionKeys.STEP_SET;
    step: MapperVisningStep;
}

export type IMappeSokActionTypes =
    | ISetStepSokAction
    | ISetIdentSokAction;

export function setIdentSokAction(
    ident: string
): ISetIdentSokAction {
    return { type: MappeSokActionKeys.IDENT_SET, ident};
}

export function setStepSokAction(step: MapperVisningStep): ISetStepSokAction {
    return { type: MappeSokActionKeys.STEP_SET, step };
}
