import {Periode}        from 'app/models/types/Periode';
import {Periodeinfo}    from 'app/models/types/Periodeinfo';
import {numberToString} from 'app/utils';
import intlHelper       from 'app/utils/intlUtils';
import {IntlShape}      from 'react-intl';

export interface IArbeidstakerV2 {
    arbeidstidInfo?: IArbeidstidInfoV2;
    organisasjonsnummer?: string | null;
    norskIdentitetsnummer?: string | null;
}

export interface IArbeidstidInfoV2 {
    jobberNormaltTimerPerDag?: string | null;
    perioder?: Periodeinfo<ITilstedevaerelsesgradV2>[];

}

export class ArbeidstidInfoV2 {
    jobberNormaltTimerPerDag: string;
    perioder: Periodeinfo<ITilstedevaerelsesgradV2>[];

    constructor(ai: IArbeidstidInfoV2) {
        this.jobberNormaltTimerPerDag = ai.jobberNormaltTimerPerDag || '0';
        this.perioder = (ai.perioder || []).map(p => new TilstedevaerelsesgradV2(p));
    }
}

export interface ITilstedevaerelsesgradV2 {
    faktiskArbeidTimerPerDag?: string;
}

export class TilstedevaerelsesgradV2 implements Required<Periodeinfo<ITilstedevaerelsesgradV2>> {
    periode: Periode;
    faktiskArbeidTimerPerDag: string;

    constructor(tilstedevaerelsesgrad: Periodeinfo<ITilstedevaerelsesgradV2>) {
        this.periode = new Periode(tilstedevaerelsesgrad.periode || {});
        this.faktiskArbeidTimerPerDag = tilstedevaerelsesgrad.faktiskArbeidTimerPerDag || '0';
    }

    values(): Required<Periodeinfo<ITilstedevaerelsesgradV2>> {
        return {periode: this.periode.values(), faktiskArbeidTimerPerDag: this.faktiskArbeidTimerPerDag};
    }

    description(intl: IntlShape): string {
        const {ft, fom, tom} = this.periode.generateStringsForDescription(intl);
        const tg = this.faktiskArbeidTimerPerDag
        return intlHelper(intl, 'mappe.lesemodus.arbeid.arbeidstaker.tilstedevaerelsesgrad', {tg, ft, fom, tom});
    }
}

export type OrgOrPers = 'o' | 'p';

export class ArbeidstakerV2 implements Required<IArbeidstakerV2> {

    arbeidstidInfo: ArbeidstidInfoV2;
    organisasjonsnummer: string | null;
    norskIdentitetsnummer: string | null;

    constructor(arbeidstaker: Periodeinfo<IArbeidstakerV2>) {

        this.arbeidstidInfo = new ArbeidstidInfoV2(arbeidstaker.arbeidstidInfo || {});
        this.organisasjonsnummer = arbeidstaker.organisasjonsnummer === undefined ? null : arbeidstaker.organisasjonsnummer;
        this.norskIdentitetsnummer = arbeidstaker.norskIdentitetsnummer === undefined ? null : arbeidstaker.norskIdentitetsnummer;

        // Av organisasjonsnummer og norskIdent skal én være null og én være string
        if (this.organisasjonsnummer === null && this.norskIdentitetsnummer == null) {
            this.organisasjonsnummer = '';
        }
    }

    values(): Required<IArbeidstakerV2> {
        const {arbeidstidInfo, organisasjonsnummer, norskIdentitetsnummer} = this; // tslint:disable-line:no-this-assignment
        return {arbeidstidInfo, organisasjonsnummer, norskIdentitetsnummer};
    }

    generateTgStrings = (): (string | undefined)[] => this.arbeidstidInfo.perioder.map(tg => tg.faktiskArbeidTimerPerDag);

    orgOrPers(): OrgOrPers {
        return this.organisasjonsnummer === null ? 'p' : 'o';
    }

    description(intl: IntlShape): string {
        const orgOrPers = this.orgOrPers();
        if (orgOrPers === 'o' && this.organisasjonsnummer && this.organisasjonsnummer.length) {
            return intlHelper(intl, 'mappe.lesemodus.arbeid.arbeidstaker.org.beskrivelse', {nr: this.organisasjonsnummer});
        } else if (orgOrPers === 'p' && this.norskIdentitetsnummer && this.norskIdentitetsnummer.length) {
            return intlHelper(intl, 'mappe.lesemodus.arbeid.arbeidstaker.pers.beskrivelse', {nr: this.norskIdentitetsnummer});
        } else {
            return intlHelper(intl, 'mappe.lesemodus.arbeid.arbeidstaker.ingenarbeidsgiver.beskrivelse');
        }
    }
}
