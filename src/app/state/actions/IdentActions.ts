import {PunchActionKeys} from "../../models/enums";

export enum IdentActionKeys {
    IDENT_FELLES_SET = "IDENT_SET_FELLES"
}

interface ISetIdentFellesAction {
    type: IdentActionKeys.IDENT_FELLES_SET;
    ident1: string;
    ident2: string | null;
    annenSokerIdent: string | null;
}

export type IIdentActions = ISetIdentFellesAction;

export function setIdentFellesAction(
    ident1: string,
    ident2?: string | null,
    annenSokerIdent?: string | null
): ISetIdentFellesAction {
    return { type: IdentActionKeys.IDENT_FELLES_SET, ident1, ident2: ident2 || null, annenSokerIdent: annenSokerIdent || null};
}
