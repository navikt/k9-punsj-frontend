import { IArbeidstidPeriodeMedTimer, IPeriode, IPunchPSBFormState, Periodeinfo } from '../models/types';

export const sjekkHvisArbeidstidPeriodeMedTimerErFylltUt = (
    periode: Periodeinfo<IArbeidstidPeriodeMedTimer>[],
): boolean => {
    if (periode.length > 0 && periode[0].faktiskArbeidTimerPerDag && periode[0].jobberNormaltTimerPerDag) {
        return true;
    }
    return false;
};

export const sjekkHvisPeriodeErFylltUt = (periode: IPeriode[]): boolean => {
    if (
        periode.length > 0 &&
        !!periode[0].fom &&
        !!periode[0].tom &&
        periode[0].fom.length > 0 &&
        periode[0].tom.length > 0
    ) {
        return true;
    }
    return false;
};

export const sjekkHvisArbeidstidErAngitt = (punchFormState: IPunchPSBFormState) => {
    let erArbeidstidAngitt = false;
    const erArbeidstidFyltUt =
        !!punchFormState.soknad?.arbeidstid?.arbeidstakerList &&
        punchFormState.soknad?.arbeidstid?.arbeidstakerList.length > 0 &&
        !!punchFormState.soknad?.arbeidstid?.arbeidstakerList[0].arbeidstidInfo &&
        !!punchFormState.soknad?.arbeidstid?.arbeidstakerList[0].arbeidstidInfo.perioder &&
        sjekkHvisArbeidstidPeriodeMedTimerErFylltUt(
            punchFormState.soknad?.arbeidstid?.arbeidstakerList[0].arbeidstidInfo.perioder,
        );

    const erFLArbeidstidFyltUt =
        !!punchFormState.soknad?.arbeidstid?.frilanserArbeidstidInfo &&
        !!punchFormState.soknad?.arbeidstid?.frilanserArbeidstidInfo.perioder &&
        sjekkHvisArbeidstidPeriodeMedTimerErFylltUt(
            punchFormState.soknad?.arbeidstid?.frilanserArbeidstidInfo.perioder,
        );

    const erSNArbeidstidFyltUt =
        !!punchFormState.soknad?.arbeidstid?.selvstendigNæringsdrivendeArbeidstidInfo &&
        !!punchFormState.soknad?.arbeidstid?.selvstendigNæringsdrivendeArbeidstidInfo.perioder &&
        sjekkHvisArbeidstidPeriodeMedTimerErFylltUt(
            punchFormState.soknad?.arbeidstid?.selvstendigNæringsdrivendeArbeidstidInfo.perioder,
        );

    if (
        !!punchFormState.soknad?.lovbestemtFerieSomSkalSlettes &&
        sjekkHvisPeriodeErFylltUt(punchFormState.soknad?.lovbestemtFerieSomSkalSlettes)
    ) {
        if (erArbeidstidFyltUt || erFLArbeidstidFyltUt || erSNArbeidstidFyltUt) erArbeidstidAngitt = true;
    } else {
        erArbeidstidAngitt = true;
    }

    return erArbeidstidAngitt;
};
