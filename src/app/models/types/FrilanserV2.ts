import intlHelper    from 'app/utils/intlUtils';
import {IntlShape}   from 'react-intl';

export interface IFrilanserV2 {
    startDato?: string;
    jobberFortsattSomFrilans?: boolean;
}

export class FrilanserV2 implements Required<IFrilanserV2> {

    startDato: string;
    jobberFortsattSomFrilans: boolean;

    constructor(frilanser: IFrilanserV2) {
        this.startDato = frilanser.startDato || '';
    }

    values(): Required<IFrilanserV2> {
        return {
            startDato: this.startDato,
            jobberFortsattSomFrilans: this.jobberFortsattSomFrilans
        };
    }

    description(intl: IntlShape): string {
        return intlHelper(
            intl,
            'mappe.lesemodus.arbeid.frilanser.beskrivelse',
            {startdato: this.startDato}
        );
    }
}
