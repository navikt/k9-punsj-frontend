import intlHelper from "../../utils/intlUtils";
import {IntlShape} from "react-intl";
import {IPeriode, Periode} from "./Periode";
import {Periodeinfo} from "./Periodeinfo";

export interface ISelvstendigNaerinsdrivende {
    periode?: IPeriode;
    virksomhetstyper?: string[];
    registrertIUtlandet?: boolean;
    landkode?: string;
    regnskapsførerNavn?: string;
    regnskapsførerTlf?: string;
    bruttoInntekt?: string;
    erNyoppstartet?: boolean;
    erVarigEndring?: boolean;
    endringDato?: string;
    endringInntekt?: string;
    endringBegrunnelse?: string;
}

export class SelvstendigNaerinsdrivende implements Required<Periodeinfo<ISelvstendigNaerinsdrivende>> {
    periode: Periode;
    virksomhetstyper: string[];
    registrertIUtlandet: boolean;
    landkode: string;
    regnskapsførerNavn: string;
    regnskapsførerTlf: string;
    bruttoInntekt: string;
    erNyoppstartet: boolean
    erVarigEndring: boolean;
    endringDato: string;
    endringInntekt: string;
    endringBegrunnelse: string;

    constructor(selvstendigNaeringsdrivende: Periodeinfo<ISelvstendigNaerinsdrivende>) {
        this.periode = new Periode(selvstendigNaeringsdrivende.periode || {});
        this.virksomhetstyper = selvstendigNaeringsdrivende.virksomhetstyper || [];
        this.landkode = selvstendigNaeringsdrivende.landkode || "";
        this.regnskapsførerNavn = selvstendigNaeringsdrivende.regnskapsførerNavn || '';
        this.regnskapsførerTlf = selvstendigNaeringsdrivende.regnskapsførerTlf || '';
        this.registrertIUtlandet = selvstendigNaeringsdrivende.registrertIUtlandet || false;
        this.bruttoInntekt = selvstendigNaeringsdrivende.bruttoInntekt || '';
        this.erNyoppstartet = selvstendigNaeringsdrivende.erNyoppstartet || false;
        this.erVarigEndring = selvstendigNaeringsdrivende.erVarigEndring || false;
        this.endringDato = selvstendigNaeringsdrivende.endringDato || '';
        this.endringInntekt = selvstendigNaeringsdrivende.endringInntekt || '';
        this.endringBegrunnelse = selvstendigNaeringsdrivende.endringBegrunnelse || '';
    }

    description(intl: IntlShape): string {
        return intlHelper(
            intl,
            'mappe.lesemodus.arbeid.selvstendigNaeringsdrivende.beskrivelse',
            {...this.periode.generateStringsForDescription(intl)}
        );
    }
}
