import { IntlShape } from 'react-intl';

import { TimeFormat } from 'app/models/enums';
import intlHelper from 'app/utils/intlUtils';

import { datetime, initializeDate, Tidsformat } from 'app/utils';
import DateRange from './DateRange';
import { Periodeinfo } from './Periodeinfo';
import { DeepRequired } from 'app/utils/deep-required';

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
        const { fom, tom } = this; // tslint:disable-line:no-this-assignment
        return { fom, tom };
    }

    fomTekstKort(intl: IntlShape) {
        return this.fom ? datetime(intl, TimeFormat.DATE_SHORT, this.fom) : '';
    }

    tilOgmedTekstKort(intl: IntlShape) {
        return this.tom ? datetime(intl, TimeFormat.DATE_SHORT, this.tom) : '';
    }

    generateStringsForDescription(intl: IntlShape): IPeriodeStringsForDescription {
        let ft = ''; // 'ft' hvis både fraOgMed og tilOgMed er gitt, 'f' hvis kun fraOgMed er gitt og 't' hvis kun tilOgMed er gitt

        if (!!this.fom && !!this.tom) {
            ft = 'ft';
        } else if (this.fom) {
            ft = 'f';
        } else if (this.tom) {
            ft = 't';
        }

        const fom = this.fomTekstKort(intl);
        const tom = this.tilOgmedTekstKort(intl);

        return { ft, fom, tom };
    }

    description(intl: IntlShape): string {
        let key: string;

        if (!!this.fom && !!this.tom) {
            key = 'periode.fratil';
        } else if (this.fom) {
            key = 'periode.fra';
        } else if (this.tom) {
            key = 'periode.til';
        } else {
            key = 'periode.udefinert';
        }

        const fom = this.fomTekstKort(intl);
        const tom = this.tilOgmedTekstKort(intl);

        return intlHelper(intl, key, { fom, tom });
    }

    startsBefore(otherPeriod: Periode): boolean {
        const dateInQuestion = initializeDate(otherPeriod.fom);
        const periodFom = initializeDate(this.fom);
        return periodFom.isBefore(dateInQuestion);
    }

    includesDate(dateString: string | Date) {
        const dateInQuestion = initializeDate(dateString);
        const fomDayjs = initializeDate(this.fom);
        const tomDayjs = initializeDate(this.tom);
        return (
            (dateInQuestion.isSame(fomDayjs) || dateInQuestion.isAfter(fomDayjs)) &&
            (dateInQuestion.isSame(tomDayjs) || dateInQuestion.isBefore(tomDayjs))
        );
    }

    tilDateRange(): DateRange {
        return {
            fom: new Date(this.fom),
            tom: new Date(this.tom),
        };
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
    jobberNormaltPerDag?: ITimerOgMinutterString;
    faktiskArbeidPerDag?: ITimerOgMinutterString;
    tidsformat?: Tidsformat;
}

export class ArbeidstidPeriodeMedTimer implements Required<Periodeinfo<IArbeidstidPeriodeMedTimer>> {
    periode: Periode;

    faktiskArbeidTimerPerDag: string;

    jobberNormaltTimerPerDag: string;

    jobberNormaltPerDag: ITimerOgMinutterString;

    faktiskArbeidPerDag: ITimerOgMinutterString;

    tidsformat: Tidsformat;

    constructor(pmf: Periodeinfo<IArbeidstidPeriodeMedTimer>) {
        this.periode = new Periode(pmf.periode || {});
        this.faktiskArbeidTimerPerDag = pmf.faktiskArbeidTimerPerDag || '';
        this.jobberNormaltTimerPerDag = pmf.jobberNormaltTimerPerDag || '';
        this.jobberNormaltPerDag = pmf.jobberNormaltPerDag || {
            timer: '',
            minutter: '',
        };
        this.faktiskArbeidPerDag = pmf.faktiskArbeidPerDag || {
            timer: '',
            minutter: '',
        };
        this.tidsformat = pmf.tidsformat || Tidsformat.TimerOgMin;
    }

    fomTekstKort(intl: IntlShape) {
        return this.periode.fom ? datetime(intl, TimeFormat.DATE_SHORT, this.periode.fom) : '';
    }

    tilOgmedTekstKort(intl: IntlShape) {
        return this.periode.tom ? datetime(intl, TimeFormat.DATE_SHORT, this.periode.tom) : '';
    }

    description(intl: IntlShape): string {
        let key: string;

        if (!!this.periode.fom && !!this.periode.tom) {
            key = 'periode.fratil';
        } else if (this.periode.fom) {
            key = 'periode.fra';
        } else if (this.periode.tom) {
            key = 'periode.til';
        } else {
            key = 'periode.udefinert';
        }

        const fom = this.fomTekstKort(intl);
        const tom = this.tilOgmedTekstKort(intl);

        return intlHelper(intl, key, { fom, tom });
    }
}

export interface ITimerOgMinutter {
    timer?: number;
    minutter?: number;
}

export interface ITimerOgMinutterString {
    timer?: string;
    minutter?: string;
}

export interface IOmsorgstid {
    perDag: ITimerOgMinutterString;
    perDagString: string;
    tidsformat: Tidsformat;
}

export class PeriodeMedTimerMinutter implements DeepRequired<Periodeinfo<IOmsorgstid>> {
    periode: Periode;
    tidsformat: Tidsformat;
    perDag: Required<ITimerOgMinutterString>;
    perDagString: string;

    constructor(pmf: Periodeinfo<IOmsorgstid>) {
        this.periode = new Periode(pmf.periode || {});
        this.perDag = {
            timer: pmf.perDag?.timer ?? '0',
            minutter: pmf.perDag?.minutter ?? '0',
        };
        this.perDagString = pmf.perDagString ?? '';
        this.tidsformat = pmf.tidsformat ?? Tidsformat.TimerOgMin;
    }

    values(): DeepRequired<Periodeinfo<IOmsorgstid>> {
        return {
            periode: this.periode.values(),
            perDag: this.perDag,
            perDagString: this.perDagString,
            tidsformat: this.tidsformat,
        };
    }

    fomTekstKort(intl: IntlShape) {
        return this.periode.fom ? datetime(intl, TimeFormat.DATE_SHORT, this.periode.fom) : '';
    }

    tilOgmedTekstKort(intl: IntlShape) {
        return this.periode.tom ? datetime(intl, TimeFormat.DATE_SHORT, this.periode.tom) : '';
    }

    description(intl: IntlShape): string {
        let key: string;

        if (!!this.periode.fom && !!this.periode.tom) {
            key = 'periode.fratil';
        } else if (this.periode.fom) {
            key = 'periode.fra';
        } else if (this.periode.tom) {
            key = 'periode.til';
        } else {
            key = 'periode.udefinert';
        }

        const fom = this.fomTekstKort(intl);
        const tom = this.tilOgmedTekstKort(intl);

        return intlHelper(intl, key, { fom, tom });
    }
}

export interface IPeriodeFerieMedFlagg {
    skalHaFerie?: boolean;
}

export class PeriodeFerieMedFlagg implements Required<Periodeinfo<IPeriodeFerieMedFlagg>> {
    periode: Periode;

    skalHaFerie: boolean;

    constructor(pmf: Periodeinfo<IPeriodeFerieMedFlagg>) {
        this.periode = new Periode(pmf.periode || {});
        this.skalHaFerie = pmf.skalHaFerie || false;
    }
}
