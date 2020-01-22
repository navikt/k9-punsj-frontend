import {TimeFormat} from 'app/models/enums';
import {datetime}   from 'app/utils';
import intlHelper   from 'app/utils/intlUtils';
import {IntlShape}  from 'react-intl';

export interface IPeriode {
    fraOgMed?: string | null;
    tilOgMed?: string | null;
}

interface IPeriodeStringsForDescription {
    ft: string;
    fom: string;
    tom: string;
}

export class Periode implements Required<IPeriode> {

    fraOgMed: string | null;
    tilOgMed: string | null;

    constructor(periode: IPeriode) {
        this.fraOgMed = periode.fraOgMed || null;
        this.tilOgMed = periode.tilOgMed || null;
    }

    fraOgMedTekstKort(intl: IntlShape) {
        return !!this.fraOgMed ? datetime(intl, TimeFormat.DATE_SHORT, this.fraOgMed) : '';
    }

    tilOgmedTekstKort(intl: IntlShape) {
        return !!this.tilOgMed ? datetime(intl, TimeFormat.DATE_SHORT, this.tilOgMed) : '';
    }

    generateStringsForDescription(intl: IntlShape): IPeriodeStringsForDescription {

        let ft: string = ''; // 'ft' hvis både fraOgMed og tilOgMed er gitt, 'f' hvis kun fraOgMed er gitt og 't' hvis kun tilOgMed er gitt

        if (!!this.fraOgMed && !!this.tilOgMed) {
            ft = 'ft';
        } else if (!!this.fraOgMed) {
            ft = 'f';
        } else if (!!this.tilOgMed) {
            ft = 't';
        }

        const fom = this.fraOgMedTekstKort(intl);
        const tom = this.tilOgmedTekstKort(intl);

        return {ft, fom, tom};
    }

    description(intl: IntlShape): string {

        let key: string;

        if (!!this.fraOgMed && !!this.tilOgMed) {
            key = 'periode.fratil';
        } else if (!!this.fraOgMed) {
            key = 'periode.fra';
        } else if (!!this.tilOgMed) {
            key = 'peride.til';
        } else {
            key = 'periode.udefinert';
        }

        const fom = this.fraOgMedTekstKort(intl);
        const tom = this.tilOgmedTekstKort(intl);

        return intlHelper(intl, key, {fom, tom});
    }
}