
export interface IHentSoknad {
    norskIdent: string;
    periode?: ISoknadPeriode
}

export interface ISoknadPeriode {
    fom: string;
    tom: string;
}
