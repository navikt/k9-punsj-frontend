import { PunchActionKeys, PunchStep } from 'app/models/enums';

interface ISetIdentAction {
  type: PunchActionKeys.IDENT_SET;
  ident1: string;
  ident2: string | null;
}

interface ISetStepAction {
  type: PunchActionKeys.STEP_SET;
  step: PunchStep;
}
interface IBackFromFormAction {
  type: PunchActionKeys.BACK_FROM_FORM;
}
interface IBackFromMapperOgFagsakerAction {
  type: PunchActionKeys.BACK_FROM_MAPPER;
}

interface IResetAction {
  type: PunchActionKeys.RESET;
}

type IIdentActionTypes = ISetIdentAction;
type INavigationTypes =
  | ISetStepAction
  | IBackFromFormAction
  | IBackFromMapperOgFagsakerAction;

export type IPunchActionTypes =
  | IIdentActionTypes
  | INavigationTypes
  | IResetAction;

export function setIdentAction(
  ident1: string,
  ident2?: string | null
): ISetIdentAction {
  return { type: PunchActionKeys.IDENT_SET, ident1, ident2: ident2 || null };
}

export function setStepAction(step: PunchStep): ISetStepAction {
  return { type: PunchActionKeys.STEP_SET, step };
}
export function undoSearchForEksisterendeSoknaderAction(): IBackFromMapperOgFagsakerAction {
  return { type: PunchActionKeys.BACK_FROM_MAPPER };
}
export function undoSearchForSoknaderAction(): IBackFromMapperOgFagsakerAction {
  return { type: PunchActionKeys.BACK_FROM_MAPPER };
}

export function resetPunchAction(): IResetAction {
  return { type: PunchActionKeys.RESET };
}
