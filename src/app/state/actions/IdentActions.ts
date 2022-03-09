import { Personvalg } from 'app/models/types/IdentState';

export enum IdentActionKeys {
    IDENT_FELLES_SET = 'IDENT_SET_FELLES',
    IDENT_SET_FLERE_BARN = 'IDENT_SET_FLERE_BARN',
}

interface ISetIdentFellesAction {
    type: IdentActionKeys.IDENT_FELLES_SET;
    ident1: string;
    ident2: string | null;
    annenSokerIdent: string | null;
}
export interface ISetFlereBarnAction {
    type: IdentActionKeys.IDENT_SET_FLERE_BARN;
    ident2: null;
    barn: Personvalg[];
}

export type IIdentActions = ISetIdentFellesAction;

export const setFlereBarnAction = (barn: Personvalg[]) => ({
    type: IdentActionKeys.IDENT_SET_FLERE_BARN,
    barn,
});

export function setIdentFellesAction(
    ident1: string,
    ident2?: string | null,
    annenSokerIdent?: string | null
): ISetIdentFellesAction {
    return {
        type: IdentActionKeys.IDENT_FELLES_SET,
        ident1,
        ident2: ident2 || null,
        annenSokerIdent: annenSokerIdent || null,
    };
}
