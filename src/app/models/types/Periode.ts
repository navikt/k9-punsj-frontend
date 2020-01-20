export interface IPeriode {
    fraOgMed?: string | null;
    tilOgMed?: string | null;
}

export class Periode implements Required<IPeriode> {

    fraOgMed: string | null;
    tilOgMed: string | null;

    constructor(periode: IPeriode) {
        this.fraOgMed = periode.fraOgMed || null;
        this.tilOgMed = periode.tilOgMed || null;
    }
}