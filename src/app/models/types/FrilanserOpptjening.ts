import intlHelper    from 'app/utils/intlUtils';
import {IntlShape}   from 'react-intl';

export interface IFrilanserOpptjening {
    startDato?: string;
    sluttdato?: string;
    jobberFortsattSomFrilans?: boolean;
}

export class FrilanserOpptjening implements IFrilanserOpptjening {

    startDato: string;
    sluttdato: string;
    jobberFortsattSomFrilans: boolean;

    constructor(frilanser: IFrilanserOpptjening) {
        this.startDato = frilanser.startDato || '';
        this.sluttdato = frilanser.sluttdato || '';
        this.jobberFortsattSomFrilans = frilanser.jobberFortsattSomFrilans || false;
    }

    values(): Required<IFrilanserOpptjening> {
        return {
            startDato: this.startDato,
            sluttdato: this.sluttdato,
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
