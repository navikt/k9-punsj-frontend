import {IPeriode, Periode} from 'app/models/types/Periode';
import {Periodeinfo}       from 'app/models/types/Periodeinfo';
import {numberToString}    from 'app/utils';
import {IntlShape}         from 'react-intl';

export interface IArbeidstaker {
    skalJobbeProsent?: number;
    organisasjonsnummer?: string | null;
    norskIdent?: string | null;
}

export type OrgOrPers = 'o' | 'p';

export class Arbeidstaker implements Required<Periodeinfo<IArbeidstaker>> {

    periode: Required<IPeriode>;
    skalJobbeProsent: number;
    organisasjonsnummer: string | null;
    norskIdent: string | null;

    constructor(arbeidstaker: Periodeinfo<IArbeidstaker>) {

        this.periode = new Periode(arbeidstaker.periode || {});
        this.skalJobbeProsent = arbeidstaker.skalJobbeProsent || 0;
        this.organisasjonsnummer = arbeidstaker.organisasjonsnummer === undefined ? null : arbeidstaker.organisasjonsnummer;
        this.norskIdent = arbeidstaker.norskIdent === undefined ? null : arbeidstaker.norskIdent;

        // Av organisasjonsnummer og norskIdent skal én være null og én være string
        if (this.organisasjonsnummer === null && this.norskIdent == null) {
            this.organisasjonsnummer = '';
        }
    }

    generateTgString(intl: IntlShape) {
        return numberToString(intl, this.skalJobbeProsent, 1);
    }

    orgOrPers(): OrgOrPers {
        return this.organisasjonsnummer === null ? 'p' : 'o';
    }
}