import {TimeFormat} from 'app/models/enums';
import {datetime} from 'app/utils';
import intlHelper from 'app/utils/intlUtils';
import {IntlShape} from 'react-intl';
import {Periodeinfo} from "./Periodeinfo";

export interface IPeriode {
    fom?: string | null;
    tom?: string | null;
}

export class Periode implements Required<IPeriode> {

    fom: string;
    tom: string;

    constructor(periode: IPeriode) {
        this.fom = periode.fom || '';
        this.tom = periode.tom || '';
    }

    values(): Required<IPeriode> {
        const {fom, tom} = this; // tslint:disable-line:no-this-assignment
        return {fom, tom};
    }

    fomTekstKort(intl: IntlShape) {
        return !!this.fom ? datetime(intl, TimeFormat.DATE_SHORT, this.fom) : '';
    }

    tilOgmedTekstKort(intl: IntlShape) {
        return !!this.tom ? datetime(intl, TimeFormat.DATE_SHORT, this.tom) : '';
    }

    generateStringsForDescription(intl: IntlShape): IPeriodeStringsForDescription {

        let ft: string = ''; // 'ft' hvis både fraOgMed og tilOgMed er gitt, 'f' hvis kun fraOgMed er gitt og 't' hvis kun tilOgMed er gitt

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

interface IPeriodeStringsForDescription {
    ft: string;
    fom: string;
    tom: string;
}

export interface IArbeidstidPeriodeMedTimer {
    periode?: IPeriode;
    faktiskArbeidTimerPerDag?: string;
    jobberNormaltTimerPerDag?: string;
}

export class ArbeidstidPeriodeMedTimer implements Required<Periodeinfo<IArbeidstidPeriodeMedTimer>> {
    periode: Periode;
    faktiskArbeidTimerPerDag: string;
    jobberNormaltTimerPerDag: string;

    constructor(pmf: Periodeinfo<IArbeidstidPeriodeMedTimer>) {
        this.periode = new Periode(pmf.periode || {})
        this.faktiskArbeidTimerPerDag = pmf.faktiskArbeidTimerPerDag || '';
        this.jobberNormaltTimerPerDag = pmf.jobberNormaltTimerPerDag || '';
    }

    fomTekstKort(intl: IntlShape) {
        return !!this.periode.fom ? datetime(intl, TimeFormat.DATE_SHORT, this.periode.fom) : '';
    }

    tilOgmedTekstKort(intl: IntlShape) {
        return !!this.periode.tom ? datetime(intl, TimeFormat.DATE_SHORT, this.periode.tom) : '';
    }

    description(intl: IntlShape): string {

        let key: string;

        if (!!this.periode.fom && !!this.periode.tom) {
            key = 'periode.fratil';
        } else if (!!this.periode.fom) {
            key = 'periode.fra';
        } else if (!!this.periode.tom) {
            key = 'periode.til';
        } else {
            key = 'periode.udefinert';
        }

        const fom = this.fomTekstKort(intl);
        const tom = this.tilOgmedTekstKort(intl);

        return intlHelper(intl, key, {fom, tom});
    }
}

export interface IPeriodeMedTimerMinutter {
    timer?: number;
    minutter?: number;
}

export class PeriodeMedTimerMinutter implements Required<Periodeinfo<IPeriodeMedTimerMinutter>> {
    periode: Periode;
    timer: number;
    minutter: number;

    constructor(pmf: Periodeinfo<IPeriodeMedTimerMinutter>) {
        this.periode = new Periode(pmf.periode || {})
        this.timer = pmf.timer || 0;
        this.minutter = pmf.minutter || 0;
    }

    values(): Required<Periodeinfo<IPeriodeMedTimerMinutter>> {
        return {periode: this.periode.values(), timer: this.timer, minutter: this.minutter};
    }

    fomTekstKort(intl: IntlShape) {
        return !!this.periode.fom ? datetime(intl, TimeFormat.DATE_SHORT, this.periode.fom) : '';
    }

    tilOgmedTekstKort(intl: IntlShape) {
        return !!this.periode.tom ? datetime(intl, TimeFormat.DATE_SHORT, this.periode.tom) : '';
    }

    description(intl: IntlShape): string {

        let key: string;

        if (!!this.periode.fom && !!this.periode.tom) {
            key = 'periode.fratil';
        } else if (!!this.periode.fom) {
            key = 'periode.fra';
        } else if (!!this.periode.tom) {
            key = 'periode.til';
        } else {
            key = 'periode.udefinert';
        }

        const fom = this.fomTekstKort(intl);
        const tom = this.tilOgmedTekstKort(intl);

        return intlHelper(intl, key, {fom, tom});
    }
}

