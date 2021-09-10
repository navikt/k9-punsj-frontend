import intlHelper from 'app/utils/intlUtils';
import { IntlShape } from 'react-intl';

export interface IFrilanserOpptjening {
    startdato?: string;
    sluttdato?: string;
    jobberFortsattSomFrilans?: boolean;
}

export class FrilanserOpptjening implements IFrilanserOpptjening {
    startdato: string;

    sluttdato: string;

    jobberFortsattSomFrilans: boolean;

    constructor(frilanser: IFrilanserOpptjening) {
        this.startdato = frilanser.startdato || '';
        this.sluttdato = frilanser.sluttdato || '';
        this.jobberFortsattSomFrilans = frilanser.jobberFortsattSomFrilans || false;
    }

    values(): Required<IFrilanserOpptjening> {
        return {
            startdato: this.startdato,
            sluttdato: this.sluttdato,
            jobberFortsattSomFrilans: this.jobberFortsattSomFrilans,
        };
    }

    description(intl: IntlShape): string {
        return intlHelper(intl, 'mappe.lesemodus.arbeid.frilanser.beskrivelse', {
            startdato: this.startdato,
        });
    }
}
