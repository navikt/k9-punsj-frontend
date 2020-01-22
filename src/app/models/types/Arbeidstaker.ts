import {Periode}        from 'app/models/types/Periode';
import {Periodeinfo}    from 'app/models/types/Periodeinfo';
import {numberToString} from 'app/utils';
import intlHelper       from 'app/utils/intlUtils';
import {IntlShape}      from 'react-intl';

export interface IArbeidstaker {
    skalJobbeProsent?: number;
    organisasjonsnummer?: string | null;
    norskIdent?: string | null;
}

export type OrgOrPers = 'o' | 'p';

export class Arbeidstaker implements Required<Periodeinfo<IArbeidstaker>> {

    periode: Periode;
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

    description(intl: IntlShape): string {

        const {ft, fom, tom} = this.periode.generateStringsForDescription(intl);

        let op: string = '';    // 'o' hvis arbeidsgiver er organisasjon og 'p' hvis arbeidsgiver er person
        let opnr: string = '';  // Arbeidsgivers organisasjons- eller fødselsnummer

        const orgOrPers = this.orgOrPers();
        if (orgOrPers === 'o' && this.organisasjonsnummer && this.organisasjonsnummer.length) {
            op = orgOrPers;
            opnr = this.organisasjonsnummer;
        } else if (orgOrPers === 'p' && this.norskIdent && this.norskIdent.length) {
            op = orgOrPers;
            opnr = this.norskIdent;
        }

        const tg = this.generateTgString(intl); // Tilstedeværelsesgrad i prosent

        return intlHelper(intl, 'mappe.lesemodus.arbeid.arbeidstaker.beskrivelse', {ft, fom, tom, op, opnr, tg});
    }
}