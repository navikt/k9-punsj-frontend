import intlHelper from "../../utils/intlUtils";
import {IntlShape} from "react-intl";
import {IPeriodeV2, PeriodeV2} from "./PeriodeV2";
import {PeriodeinfoV2} from "./PeriodeInfoV2";

export interface ISelvstendigNaerinsdrivende {
    periode?: IPeriodeV2;
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
}

export class SelvstendigNaerinsdrivende implements Required<PeriodeinfoV2<ISelvstendigNaerinsdrivende>> {
    periode: PeriodeV2;
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

    constructor(selvstendigNaeringsdrivende: PeriodeinfoV2<ISelvstendigNaerinsdrivende>) {
        this.periode = new PeriodeV2(selvstendigNaeringsdrivende.periode || {});
        this.virksomhetstyper = selvstendigNaeringsdrivende.virksomhetstyper || [];
        this.landkode = selvstendigNaeringsdrivende.landkode || "";
        this.regnskapsførerNavn = selvstendigNaeringsdrivende.regnskapsførerNavn || "";
        this.regnskapsførerTlf = selvstendigNaeringsdrivende.regnskapsførerTlf || "";
        this.registrertIUtlandet = selvstendigNaeringsdrivende.registrertIUtlandet || false;
        this.bruttoInntekt = selvstendigNaeringsdrivende.bruttoInntekt || "";
        this.erNyoppstartet = selvstendigNaeringsdrivende.erNyoppstartet || false;
        this.erVarigEndring = selvstendigNaeringsdrivende.erVarigEndring || false;
        this.endringDato = selvstendigNaeringsdrivende.endringDato || '';
        this.endringInntekt = selvstendigNaeringsdrivende.endringInntekt|| '';
    }

    description(intl: IntlShape): string {
        return intlHelper(
            intl,
            'mappe.lesemodus.arbeid.selvstendigNaeringsdrivende.beskrivelse',
            {...this.periode.generateStringsForDescription(intl)}
        );
    }
}
