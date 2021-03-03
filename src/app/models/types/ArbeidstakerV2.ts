import intlHelper       from 'app/utils/intlUtils';
import {IntlShape}      from 'react-intl';
import {ArbeidstidInfo, IArbeidstidInfo} from "./Soknadv2";

export interface IArbeidstakerV2 {
    arbeidstidInfo?: IArbeidstidInfo;
    organisasjonsnummer?: string | null;
    norskIdent?: string | null;
}

export type OrgOrPers = 'o' | 'p';

export class ArbeidstakerV2 implements Required<IArbeidstakerV2> {

    arbeidstidInfo: ArbeidstidInfo;
    organisasjonsnummer: string | null;
    norskIdent: string | null;

    constructor(arbeidstaker: IArbeidstakerV2) {

        this.arbeidstidInfo = new ArbeidstidInfo(arbeidstaker.arbeidstidInfo || {});
        this.organisasjonsnummer = arbeidstaker.organisasjonsnummer === undefined ? null : arbeidstaker.organisasjonsnummer;
        this.norskIdent = arbeidstaker.norskIdent === undefined ? null : arbeidstaker.norskIdent;

        // Av organisasjonsnummer og norskIdent skal én være null og én være string
        if (this.organisasjonsnummer === null && this.norskIdent == null) {
            this.organisasjonsnummer = '';
        }
    }

    generateFaktiskeTimer = (): string[] => this.arbeidstidInfo.perioder.map(p => p.faktiskArbeidTimerPerDag);

    values(): Required<IArbeidstakerV2> {
        const {arbeidstidInfo, organisasjonsnummer, norskIdent} = this; // tslint:disable-line:no-this-assignment
        return {arbeidstidInfo, organisasjonsnummer, norskIdent};
    }

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
