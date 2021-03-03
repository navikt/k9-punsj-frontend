import {TimeFormat} from 'app/models/enums';
import {datetime}   from 'app/utils';
import intlHelper   from 'app/utils/intlUtils';
import {IntlShape}  from 'react-intl';

export interface IPeriodeV2 {
    fom?: string | null;
    tom?: string | null;
}

interface IPeriodeStringsForDescriptionV2 {
    ft: string;
    fom: string;
    tom: string;
}

export interface IPeriodeMedFaktiskeTimer {
    periode?: IPeriodeV2;
    faktiskArbeidTimerPerDag?: string;
}

export class PeriodeMedFaktiskeTimer implements Required<IPeriodeMedFaktiskeTimer> {
    periode: PeriodeV2;
    faktiskArbeidTimerPerDag: string;

    constructor(pmf: IPeriodeMedFaktiskeTimer) {
        this.periode = new PeriodeV2(pmf.periode || {})
        this.faktiskArbeidTimerPerDag = this.faktiskArbeidTimerPerDag || '0';
    }
}

export class PeriodeV2 implements Required<IPeriodeV2> {

    fom: string | null;
    tom: string | null;

    constructor(periode: IPeriodeV2) {
        this.fom = periode.fom || null;
        this.tom = periode.tom || null;
    }

    values(): Required<IPeriodeV2> {
        const {fom, tom} = this; // tslint:disable-line:no-this-assignment
        return {fom, tom};
    }

    fomTekstKort(intl: IntlShape) {
        return !!this.fom ? datetime(intl, TimeFormat.DATE_SHORT, this.fom) : '';
    }

    tilOgmedTekstKort(intl: IntlShape) {
        return !!this.tom ? datetime(intl, TimeFormat.DATE_SHORT, this.tom) : '';
    }

    generateStringsForDescription(intl: IntlShape): IPeriodeStringsForDescriptionV2 {

        let ft: string = ''; // 'ft' hvis både fom og tom er gitt, 'f' hvis kun fom er gitt og 't' hvis kun tom er gitt

        if (!!this.fom && !!this.tom) {
            ft = 'ft';
        } else if (!!this.fom) {
            ft = 'f';
        } else if (!!this.tom) {
            ft = 't';
        }

        const fom = this.fomTekstKort(intl);
        const tom = this.tilOgmedTekstKort(intl);

        return {ft, fom, tom};
    }

    description(intl: IntlShape): string {

        let key: string;

        if (!!this.fom && !!this.tom) {
            key = 'periode.fratil';
        } else if (!!this.fom) {
            key = 'periode.fra';
        } else if (!!this.tom) {
            key = 'periode.til';
        } else {
            key = 'periode.udefinert';
        }

        const fom = this.fomTekstKort(intl);
        const tom = this.tilOgmedTekstKort(intl);

        return intlHelper(intl, key, {fom, tom});
    }
}
