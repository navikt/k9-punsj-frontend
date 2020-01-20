import {IPeriode}    from 'app/models/types/Periode';
import {Periodeinfo} from 'app/models/types/Periodeinfo';

export interface ISelvstendigNaerinsdrivende {}

export class SelvstendigNaerinsdrivende implements Required<Periodeinfo<ISelvstendigNaerinsdrivende>> {

    periode: Required<IPeriode>;

    constructor(selvstendigNaeringsdrivende: ISelvstendigNaerinsdrivende) {
        this.periode = new Periode(selvstendigNaeringsdrivende.periode || {}).generateDefaultValues();
    }
}