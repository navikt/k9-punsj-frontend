export interface IHentSoknad {
    norskIdent: string;
    periode?: ISoknadPeriode
}

export interface ISoknadPeriode {
    fom?: string;
    tom?: string;
}

export class SoknadPeriode implements Required<ISoknadPeriode> {
    fom: string;
    tom: string;

    constructor(periode: ISoknadPeriode) {

        this.fom = periode.fom || '';
        this.tom = periode.tom || '';
    }
}
