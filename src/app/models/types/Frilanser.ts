import {Periode}     from 'app/models/types/Periode';
import {Periodeinfo} from 'app/models/types/Periodeinfo';
import intlHelper    from 'app/utils/intlUtils';
import {IntlShape}   from 'react-intl';

export interface IFrilanser {}

export class Frilanser implements Required<Periodeinfo<IFrilanser>> {

    periode: Periode;

    constructor(frilanser: Periodeinfo<IFrilanser>) {
        this.periode = new Periode(frilanser.periode || {});
    }

    values(): Required<Periodeinfo<IFrilanser>> {
        return {periode: this.periode.values()};
    }

    description(intl: IntlShape): string {
        return intlHelper(
            intl,
            'mappe.lesemodus.arbeid.frilanser.beskrivelse',
            {...this.periode.generateStringsForDescription(intl)}
        );
    }
}