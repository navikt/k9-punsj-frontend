import intlHelper    from 'app/utils/intlUtils';
import {IntlShape}   from 'react-intl';
import {IPeriodeV2, PeriodeV2} from "./PeriodeV2";

export interface ISelvstendigNaeringsdrivendeV2 {
    perioder?: IPeriodeSelvstendigNæringsdrivende[];
    virksomhetstyper?: string[];
}

export class SelvstendigNaeringsdrivende implements Required<ISelvstendigNaeringsdrivendeV2> {

    perioder: PeriodeSelvstendigNæringsdrivende[];
    virksomhetstyper: string[];

    constructor(selvstendigNaeringsdrivende: ISelvstendigNaeringsdrivendeV2) {
        this.perioder = (selvstendigNaeringsdrivende.perioder || []).map(p => new PeriodeSelvstendigNæringsdrivende(p));
        this.virksomhetstyper = selvstendigNaeringsdrivende.virksomhetstyper || [];
    }
}


export interface IPeriodeSelvstendigNæringsdrivende {
    periode?: IPeriodeV2;
    virksomhetstyper?: string[];
    regnskapsførerNavn?: string;
    regnskapsførerTlf?: string;
    erVarigEndring?: boolean;
    endringDato?: string;
    endringBegrunnelse?: string;
    bruttoInntekt?: string;
    erNyoppstartet?: boolean;
    registrertIUtlandet?: boolean;
    landkode?: string;
}

export class PeriodeSelvstendigNæringsdrivende implements Required<IPeriodeSelvstendigNæringsdrivende> {
    periode: PeriodeV2;
    virksomhetstyper: string[];
    regnskapsførerNavn: string;
    regnskapsførerTlf: string;
    erVarigEndring: boolean;
    endringDato: string;
    endringBegrunnelse: string;
    bruttoInntekt: string;
    erNyoppstartet: boolean;
    registrertIUtlandet: boolean;
    landkode: string;

    constructor(pmf: IPeriodeSelvstendigNæringsdrivende) {
        this.periode = new PeriodeV2(pmf.periode || {});
        this.virksomhetstyper = pmf.virksomhetstyper || [];
        this.regnskapsførerNavn = pmf.regnskapsførerNavn || '';
        this.regnskapsførerTlf = pmf.regnskapsførerTlf || '';
        this.erVarigEndring = pmf.erVarigEndring || false;
        this.endringDato = pmf.endringDato || '';
        this.endringBegrunnelse = pmf.endringBegrunnelse || '';
        this.bruttoInntekt = pmf.bruttoInntekt || '';
        this.erNyoppstartet = pmf.erNyoppstartet || false;
        this.registrertIUtlandet = pmf.registrertIUtlandet || false;
        this.landkode = pmf.landkode || '';
    }

    description(intl: IntlShape): string {
        return intlHelper(
            intl,
            'mappe.lesemodus.arbeid.selvstendigNaeringsdrivende.beskrivelse',
            {...this.periode.generateStringsForDescription(intl)}
        );
    }
}
