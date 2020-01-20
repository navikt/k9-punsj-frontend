import {IPeriode}    from 'app/models/types/Periode';
import {Periodeinfo} from 'app/models/types/Periodeinfo';

export interface IFrilanser {}

export class Frilanser implements Required<Periodeinfo<IFrilanser>> {

    periode: Required<IPeriode>;

    constructor(frilanser: Periodeinfo<IFrilanser>) {
        this.periode = new Periode(frilanser.periode || {}).generateDefaultValues();
    }
}