import {SoknaderSokActionKeys} from "../../models/enums/SoknaderSokActionKeys";
import {SoknaderVisningStep} from "../../models/enums/SoknaderVisningStep";

interface ISetIdentSokAction {
    type: SoknaderSokActionKeys.IDENT_SET;
    ident: string;
}

interface ISetStepSokAction {
    type: SoknaderSokActionKeys.STEP_SET;
    step: SoknaderVisningStep;
}

export type ISoknaderSokActionTypes =
    | ISetStepSokAction
    | ISetIdentSokAction;

export function setIdentSokAction(
    ident: string
): ISetIdentSokAction {
    return { type: SoknaderSokActionKeys.IDENT_SET, ident};
}

export function setStepSokAction(step: SoknaderVisningStep): ISetStepSokAction {
    return { type: SoknaderSokActionKeys.STEP_SET, step };
}
