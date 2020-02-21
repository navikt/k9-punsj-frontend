import {Periode}        from 'app/models/types/Periode';
import {Periodeinfo}    from 'app/models/types/Periodeinfo';
import {numberToString} from 'app/utils';
import intlHelper       from 'app/utils/intlUtils';
import {IntlShape}      from 'react-intl';

export interface IArbeidstaker {
    skalJobbeProsent?: Periodeinfo<ITilstedevaerelsesgrad>[];
    organisasjonsnummer?: string | null;
    norskIdent?: string | null;
}

export interface ITilstedevaerelsesgrad {
    grad?: number;
}

export class Tilstedevaerelsesgrad implements Required<Periodeinfo<ITilstedevaerelsesgrad>> {

    periode: Periode;
    grad: number;

    constructor(tilstedevaerelsesgrad: Periodeinfo<ITilstedevaerelsesgrad>) {
        this.periode = new Periode(tilstedevaerelsesgrad.periode || {});
        this.grad = tilstedevaerelsesgrad.grad || 0;
    }

    values(): Required<Periodeinfo<ITilstedevaerelsesgrad>> {
        return {periode: this.periode.values(), grad: this.grad};
    }

    generateTgString = (intl: IntlShape): string => numberToString(intl, this.grad, 1);

    description(intl: IntlShape): string {
        const {ft, fom, tom} = this.periode.generateStringsForDescription(intl);
        const tg = this.generateTgString(intl);
        return intlHelper(intl, 'mappe.lesemodus.arbeid.arbeidstaker.tilstedevaerelsesgrad', {tg, ft, fom, tom});
    }
}

export type OrgOrPers = 'o' | 'p';

export class Arbeidstaker implements Required<IArbeidstaker> {

    skalJobbeProsent: Tilstedevaerelsesgrad[];
    organisasjonsnummer: string | null;
    norskIdent: string | null;

    constructor(arbeidstaker: Periodeinfo<IArbeidstaker>) {

        this.skalJobbeProsent = (arbeidstaker.skalJobbeProsent || []).map(tg => new Tilstedevaerelsesgrad(tg));
        this.organisasjonsnummer = arbeidstaker.organisasjonsnummer === undefined ? null : arbeidstaker.organisasjonsnummer;
        this.norskIdent = arbeidstaker.norskIdent === undefined ? null : arbeidstaker.norskIdent;

        // Av organisasjonsnummer og norskIdent skal én være null og én være string
        if (this.organisasjonsnummer === null && this.norskIdent == null) {
            this.organisasjonsnummer = '';
        }
    }

    values(): Required<IArbeidstaker> {
        const {skalJobbeProsent, organisasjonsnummer, norskIdent} = this; // tslint:disable-line:no-this-assignment
        return {skalJobbeProsent: skalJobbeProsent.map(tg => tg.values()), organisasjonsnummer, norskIdent};
    }

    generateTgStrings = (intl: IntlShape): string[] => this.skalJobbeProsent.map(tg => tg.generateTgString(intl));

    orgOrPers(): OrgOrPers {
        return this.organisasjonsnummer === null ? 'p' : 'o';
    }

    description(intl: IntlShape): string {
        const orgOrPers = this.orgOrPers();
        if (orgOrPers === 'o' && this.organisasjonsnummer && this.organisasjonsnummer.length) {
            return intlHelper(intl, 'mappe.lesemodus.arbeid.arbeidstaker.org.beskrivelse', {nr: this.organisasjonsnummer});
        } else if (orgOrPers === 'p' && this.norskIdent && this.norskIdent.length) {
            return intlHelper(intl, 'mappe.lesemodus.arbeid.arbeidstaker.pers.beskrivelse', {nr: this.norskIdent});
        } else {
            return intlHelper(intl, 'mappe.lesemodus.arbeid.arbeidstaker.ingenarbeidsgiver.beskrivelse');
        }
    }
}