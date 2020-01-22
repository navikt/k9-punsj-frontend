import {Periode}     from 'app/models/types/Periode';
import {Periodeinfo} from 'app/models/types/Periodeinfo';
import intlHelper    from 'app/utils/intlUtils';
import {IntlShape}   from 'react-intl';

export interface ISelvstendigNaerinsdrivende {}

export class SelvstendigNaerinsdrivende implements Required<Periodeinfo<ISelvstendigNaerinsdrivende>> {

    periode: Periode;

    constructor(selvstendigNaeringsdrivende: Periodeinfo<ISelvstendigNaerinsdrivende>) {
        this.periode = new Periode(selvstendigNaeringsdrivende.periode || {});
    }

    description(intl: IntlShape): string {
        return intlHelper(
            intl,
            'mappe.lesemodus.arbeid.selvstendigNaeringsdrivende.beskrivelse',
            {...this.periode.generateStringsForDescription(intl)}
        );
    }
}