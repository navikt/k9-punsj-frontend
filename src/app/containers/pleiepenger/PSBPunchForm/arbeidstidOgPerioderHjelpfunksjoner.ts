import {IArbeidstidPeriodeMedTimer, IPeriode, IPunchFormState, Periodeinfo} from "../../../models/types";

const sjekkHvisArbeidstidPeriodeMedTimerErFylltUt = (periode: Periodeinfo<IArbeidstidPeriodeMedTimer>[]): boolean => {
    if (periode.length > 0
        && typeof periode[0].faktiskArbeidTimerPerDag !== 'undefined'
        && typeof periode[0].jobberNormaltTimerPerDag !== 'undefined'
        && periode[0].faktiskArbeidTimerPerDag.length > 0
        && periode[0].jobberNormaltTimerPerDag.length > 0) {
        return true;
    }
    return false;
}

const sjekkHvisPeriodeErFylltUt = (periode: IPeriode[]): boolean => {
    if (periode.length > 0
        && !!periode[0].fom && !!periode[0].tom
        && periode[0].fom.length > 0
        && periode[0].tom.length > 0) {
        return true;
    }
    return false;
}

const sjekkHvisArbeidstidErAngitt = (punchFormState: IPunchFormState) => {
    let erArbeidstidAngitt = false;
    if (!!punchFormState.soknad?.lovbestemtFerieSomSkalSlettes && sjekkHvisPeriodeErFylltUt(punchFormState.soknad?.lovbestemtFerieSomSkalSlettes)) {
        if (!!punchFormState.soknad?.arbeidstid?.arbeidstakerList
            && punchFormState.soknad?.arbeidstid?.arbeidstakerList.length > 0
            && !!punchFormState.soknad?.arbeidstid?.arbeidstakerList[0].arbeidstidInfo
            && !!punchFormState.soknad?.arbeidstid?.arbeidstakerList[0].arbeidstidInfo.perioder
            && sjekkHvisArbeidstidPeriodeMedTimerErFylltUt(punchFormState.soknad?.arbeidstid?.arbeidstakerList[0].arbeidstidInfo.perioder)) {
            erArbeidstidAngitt = true;
        } else if (!!punchFormState.soknad?.arbeidstid?.frilanserArbeidstidInfo
            && !!punchFormState.soknad?.arbeidstid?.frilanserArbeidstidInfo.perioder
            && sjekkHvisArbeidstidPeriodeMedTimerErFylltUt(punchFormState.soknad?.arbeidstid?.frilanserArbeidstidInfo.perioder)) {
            erArbeidstidAngitt = true;
        } else if (!!punchFormState.soknad?.arbeidstid?.selvstendigNæringsdrivendeArbeidstidInfo
            && !!punchFormState.soknad?.arbeidstid?.selvstendigNæringsdrivendeArbeidstidInfo.perioder
            && sjekkHvisArbeidstidPeriodeMedTimerErFylltUt(punchFormState.soknad?.arbeidstid?.selvstendigNæringsdrivendeArbeidstidInfo.perioder)) {
            erArbeidstidAngitt = true;
        }
    }else{
        erArbeidstidAngitt = true;
    }
    return erArbeidstidAngitt;
};

export default sjekkHvisArbeidstidErAngitt;