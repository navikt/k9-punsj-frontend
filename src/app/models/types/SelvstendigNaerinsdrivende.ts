import { IntlShape } from 'react-intl';

import intlHelper from 'app/utils/intlUtils';

import { IPeriode, Periode } from './Periode';
import { Periodeinfo } from './Periodeinfo';

export interface ISelvstendigNaerinsdrivende {
    periode?: IPeriode;
    virksomhetstyper?: string[];
    registrertIUtlandet?: boolean;
    landkode?: string | null;
    regnskapsførerNavn?: string | null;
    regnskapsførerTlf?: string | null;
    bruttoInntekt?: string | null;
    erNyoppstartet?: boolean;
    erVarigEndring?: boolean;
    endringDato?: string | null;
    endringInntekt?: string | null;
    endringBegrunnelse?: string | null;
}

export class SelvstendigNaerinsdrivende implements Required<Periodeinfo<ISelvstendigNaerinsdrivende>> {
    periode: Periode;

    virksomhetstyper: string[];

    registrertIUtlandet: boolean;

    landkode: string | null;

    regnskapsførerNavn: string | null;

    regnskapsførerTlf: string | null;

    bruttoInntekt: string | null;

    erNyoppstartet: boolean;

    erVarigEndring: boolean;

    endringDato: string | null;

    endringInntekt: string | null;

    endringBegrunnelse: string | null;

    constructor(selvstendigNaeringsdrivende: Periodeinfo<ISelvstendigNaerinsdrivende>) {
        this.periode = new Periode(selvstendigNaeringsdrivende.periode || {});
        this.virksomhetstyper = selvstendigNaeringsdrivende.virksomhetstyper || [];
        this.landkode = selvstendigNaeringsdrivende.landkode || null;
        this.regnskapsførerNavn = selvstendigNaeringsdrivende.regnskapsførerNavn || null;
        this.regnskapsførerTlf = selvstendigNaeringsdrivende.regnskapsførerTlf || null;
        this.registrertIUtlandet = selvstendigNaeringsdrivende.registrertIUtlandet ?? true;
        this.bruttoInntekt = selvstendigNaeringsdrivende.bruttoInntekt || null;
        this.erNyoppstartet = selvstendigNaeringsdrivende.erNyoppstartet || false;
        this.erVarigEndring = selvstendigNaeringsdrivende.erVarigEndring || false;
        this.endringDato = selvstendigNaeringsdrivende.endringDato || null;
        this.endringInntekt = selvstendigNaeringsdrivende.endringInntekt || null;
        this.endringBegrunnelse = selvstendigNaeringsdrivende.endringBegrunnelse || null;
    }

    description(intl: IntlShape): string {
        return intlHelper(intl, 'mappe.lesemodus.arbeid.selvstendigNaeringsdrivende.beskrivelse', {
            ...this.periode.generateStringsForDescription(intl),
        });
    }
}
