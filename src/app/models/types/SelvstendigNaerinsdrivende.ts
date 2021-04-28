import {Periodeinfo} from 'app/models/types/Periodeinfo';
import {IPeriode, Periode} from "./Periode";
import intlHelper from "../../utils/intlUtils";
import {IntlShape} from "react-intl";

export interface ISelvstendigNaerinsdrivende {
    periode?: IPeriode;
    virksomhetstyper?: string[];
    registrertIUtlandet?: boolean;
    landkode?: string;
    regnskapsførerNavn?: string;
    regnskapsførerTlf?: string;
    bruttoInntekt?: string,
    erNyoppstartet?: boolean
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

    constructor(selvstendigNaeringsdrivende: Periodeinfo<ISelvstendigNaerinsdrivende>) {
        this.periode = new Periode(selvstendigNaeringsdrivende.periode || {});
        this.virksomhetstyper = selvstendigNaeringsdrivende.virksomhetstyper || [];
        this.landkode = selvstendigNaeringsdrivende.landkode || "";
        this.regnskapsførerNavn = selvstendigNaeringsdrivende.regnskapsførerNavn || "";
        this.regnskapsførerTlf = selvstendigNaeringsdrivende.regnskapsførerNavn || "";
        this.registrertIUtlandet = selvstendigNaeringsdrivende.registrertIUtlandet || false;
        this.bruttoInntekt = selvstendigNaeringsdrivende.bruttoInntekt || "";
        this.erNyoppstartet = selvstendigNaeringsdrivende.erNyoppstartet || false;
    }

    description(intl: IntlShape): string {
        return intlHelper(
            intl,
            'mappe.lesemodus.arbeid.selvstendigNaeringsdrivende.beskrivelse',
            {...this.periode.generateStringsForDescription(intl)}
        );
    }
}
