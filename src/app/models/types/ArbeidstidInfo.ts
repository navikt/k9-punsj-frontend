import { ArbeidstidPeriodeMedTimer, IArbeidstidPeriodeMedTimer } from './Periode';
import { Periodeinfo } from './Periodeinfo';

export interface IArbeidstidInfo {
    perioder?: Periodeinfo<IArbeidstidPeriodeMedTimer>[];
}

export class ArbeidstidInfo implements Required<IArbeidstidInfo> {
    perioder: ArbeidstidPeriodeMedTimer[];

    constructor(ai: IArbeidstidInfo) {
        this.perioder = (ai.perioder || []).map((p) => new ArbeidstidPeriodeMedTimer(p));
    }
}
