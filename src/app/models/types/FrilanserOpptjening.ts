import intlHelper    from 'app/utils/intlUtils';
import {IntlShape}   from 'react-intl';

export interface IFrilanserOpptjening {
    startDato?: string;
    jobberFortsattSomFrilans?: boolean;
}

export class FrilanserOpptjening implements Required<IFrilanserOpptjening> {

    startDato: string;
    jobberFortsattSomFrilans: boolean;

    constructor(frilanser: IFrilanserOpptjening) {
        this.startDato = frilanser.startDato || '';
        this.jobberFortsattSomFrilans = frilanser.jobberFortsattSomFrilans || false;
    }

    values(): Required<IFrilanserOpptjening> {
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
