export enum IdentActionKeys {
    IDENT_FELLES_SET = 'IDENT_SET_FELLES',
    IDENT_RESET = 'IDENT_RESET',
    IDENT_SET_ANNEN_PART = 'IDENT_SET_ANNEN_PART',
}

interface ISetIdentFellesAction {
    type: IdentActionKeys.IDENT_FELLES_SET;
    ident1: string;
    ident2: string;
    annenSokerIdent: string | null;
}

export type IIdentReset = {
    type: IdentActionKeys.IDENT_RESET;
};
export type IIdentSetAnnenPart = {
    type: IdentActionKeys.IDENT_SET_ANNEN_PART;
    annenPart: string;
};

export type IIdentActions = ISetIdentFellesAction | IIdentReset | IIdentSetAnnenPart;

export const resetIdentState = () => ({
    type: IdentActionKeys.IDENT_RESET,
});

export const setAnnenPartAction = (annenPart: string) => ({ type: IdentActionKeys.IDENT_SET_ANNEN_PART, annenPart });

export function setIdentFellesAction(
    ident1: string,
    ident2?: string | null,
    annenSokerIdent?: string | null
): ISetIdentFellesAction {
    return {
        type: IdentActionKeys.IDENT_FELLES_SET,
        ident1,
        ident2: ident2 || '',
        annenSokerIdent: annenSokerIdent || null,
    };
}
