import {IPeriode}    from 'app/models/types/Periode';
import {Periodeinfo} from 'app/models/types/Periodeinfo';

export interface IArbeidstaker {
    skalJobbeProsent?: number;
    organisasjonsnummer?: string | null;
    norskIdent?: string | null;
}

export class Arbeidstaker implements Required<Periodeinfo<IArbeidstaker>> {

    periode: Required<IPeriode>;
    skalJobbeProsent: number;
    organisasjonsnummer: string | null;
    norskIdent: string | null;

    constructor(arbeidstaker: IArbeidstaker) {
        this.periode = new Periode(arbeidstaker.periode || {}).generateDefaultValues();
        this.skalJobbeProsent = arbeidstaker.skalJobbeProsent || 100;
        this.organisasjonsnummer = arbeidstaker.organisasjonsnummer || null;
        this.norskIdent = arbeidstaker.norskIdent || null;
    }
}