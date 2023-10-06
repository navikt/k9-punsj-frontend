import { DokumenttypeForkortelse, FordelingDokumenttype } from 'app/models/enums';
import {
    ArbeidstidPeriodeMedTimer,
    IArbeidstidPeriodeMedTimer,
    ITimerOgMinutterString,
    Periodeinfo,
} from 'app/models/types';
import { Tidsformat } from './timeUtils';

export const formattereDatoIArray = (dato: number[]) => {
    const formatertDato: string[] = [];
    // eslint-disable-next-line no-plusplus
    for (let i = dato.length - 1; i >= 0; i--) {
        formatertDato.push(i > 0 ? `${dato[i]}.` : `${dato[i]}`);
    }
    return formatertDato.join('');
};
export const formatDato = (dato: string) => {
    const [year, month, day] = dato.split('-');
    return `${day}.${month}.${year}`;
};

export const sjekkPropertyEksistererOgIkkeErNull = (property: string, object: any) => {
    if (!object) {
        return false;
    }
    if (property in object && object[property] !== null) {
        return true;
    }
    return false;
};

export const nummerPrefiks = (tekst: string, number: number) => `${number}. ${tekst}`;
export const verdiOgTekstHvisVerdi = (verdi: any, tekst: string) => (verdi ? `${verdi} ${tekst}` : '');
export const capitalize = (tekst: string) => (tekst ? tekst[0].toUpperCase() + tekst.substring(1) : tekst);
export const erYngreEnn4år = (dato: string) => {
    const fireAarSiden = new Date();
    fireAarSiden.setFullYear(fireAarSiden.getFullYear() - 4);
    return new Date(dato) > fireAarSiden;
};

export const erEldreEnn4år = (dato: string) => {
    const fireAarSiden = new Date();
    fireAarSiden.setFullYear(fireAarSiden.getFullYear() - 4);
    return new Date(dato) < fireAarSiden;
};

export const printAndReturnValue = (value: any) => {
    console.log(value);
    return value;
};

export const finnVisningsnavnForSakstype = (kode: string) => {
    const sakstyper = [
        {
            kode: DokumenttypeForkortelse.PSB,
            navn: 'Pleiepenger sykt barn',
        },
        {
            kode: DokumenttypeForkortelse.PPN,
            navn: 'Pleiepenger i livets sluttfase',
        },
        {
            kode: DokumenttypeForkortelse.OMP,
            navn: 'Omsorgspenger',
        },
        {
            kode: DokumenttypeForkortelse.OMP_KS,
            navn: 'Omsorgspenger kronisk sykt barn',
        },
        {
            kode: DokumenttypeForkortelse.OMP_MA,
            navn: 'Ekstra omsorgsdager midlertidig alene',
        },
        {
            kode: DokumenttypeForkortelse.OMP_AO,
            navn: 'Alene om omsorgen',
        },
        {
            kode: DokumenttypeForkortelse.OMP_UT,
            navn: 'Direkte utbetaling av omsorgspenger',
        },
    ];
    return sakstyper.find((st) => st.kode === kode)?.navn || kode;
};

export const finnForkortelseForDokumenttype = (
    dokumenttype?: FordelingDokumenttype,
): DokumenttypeForkortelse | undefined => {
    if (!dokumenttype) {
        return undefined;
    }
    const dokumenttyper = [
        {
            navn: FordelingDokumenttype.PLEIEPENGER,
            forkortelse: DokumenttypeForkortelse.PSB,
        },
        {
            navn: FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE,
            forkortelse: DokumenttypeForkortelse.PPN,
        },
        {
            navn: FordelingDokumenttype.KORRIGERING_IM,
            forkortelse: DokumenttypeForkortelse.OMP,
        },
        {
            navn: FordelingDokumenttype.OMSORGSPENGER,
            forkortelse: DokumenttypeForkortelse.OMP,
        },
        {
            navn: FordelingDokumenttype.OMSORGSPENGER_UT,
            forkortelse: DokumenttypeForkortelse.OMP,
        },
        {
            navn: FordelingDokumenttype.OMSORGSPENGER_KS,
            forkortelse: DokumenttypeForkortelse.OMP_KS,
        },
        {
            navn: FordelingDokumenttype.OMSORGSPENGER_MA,
            forkortelse: DokumenttypeForkortelse.OMP_MA,
        },
        {
            navn: FordelingDokumenttype.OMSORGSPENGER_AO,
            forkortelse: DokumenttypeForkortelse.OMP_AO,
        },
    ];
    return dokumenttyper.find((dt) => dt.navn === dokumenttype)?.forkortelse;
};

export const getModiaPath = (fødselsnummer?: string) => {
    const { host } = window.location;
    if (!fødselsnummer) {
        return null;
    }
    if (host.includes('dev.adeo.no') || host.includes('localhost')) {
        return `https://app-q1.adeo.no/modiapersonoversikt/person/${fødselsnummer}/meldinger/`;
    }
    if (host.includes('nais.adeo.no')) {
        return `https://app.adeo.no/modiapersonoversikt/person/${fødselsnummer}/meldinger/`;
    }
    return null;
};

function TimerMedDesimalerTilTimerOgMinutter(timerOgDesimaler: number): [string, string] {
    const totalMinutes = Math.round(timerOgDesimaler * 60);
    const minutes = String(totalMinutes % 60);
    const timer = String(Math.floor(totalMinutes / 60));
    return [timer, minutes];
}
export const konverterTidTilTimerOgMinutter = (periode: Periodeinfo<IArbeidstidPeriodeMedTimer>) => {
    if (periode.tidsformat === Tidsformat.Desimaler) {
        const [normaltTimer, normaltMinutter] = TimerMedDesimalerTilTimerOgMinutter(
            Number(periode.jobberNormaltTimerPerDag || 0),
        );
        const [faktiskTimer, faktiskMinutter] = TimerMedDesimalerTilTimerOgMinutter(
            Number(periode.faktiskArbeidTimerPerDag || 0),
        );
        return new ArbeidstidPeriodeMedTimer({
            ...periode,
            periode: periode.periode,
            jobberNormaltPerDag: {
                timer: normaltTimer,
                minutter: normaltMinutter,
            },
            faktiskArbeidPerDag: {
                timer: faktiskTimer,
                minutter: faktiskMinutter,
            },
        });
    }
    return new ArbeidstidPeriodeMedTimer({
        ...periode,
        periode: periode.periode,
        jobberNormaltPerDag: {
            timer: periode.jobberNormaltPerDag?.timer || '0',
            minutter: periode.jobberNormaltPerDag?.minutter || '0',
        },
        faktiskArbeidPerDag: {
            timer: periode.faktiskArbeidPerDag?.timer || '0',
            minutter: periode.faktiskArbeidPerDag?.minutter || '0',
        },
    });
};

export const konverterTidTilTimerOgMinutterLazyCopy = ({
    tidsformat,
    faktiskArbeidTimerPerDag,
    jobberNormaltTimerPerDag,
    jobberNormaltPerDag,
    faktiskArbeidPerDag,
}: {
    tidsformat: Tidsformat;
    faktiskArbeidTimerPerDag?: string;
    jobberNormaltTimerPerDag?: string;
    jobberNormaltPerDag: ITimerOgMinutterString;
    faktiskArbeidPerDag: ITimerOgMinutterString;
}) => {
    if (tidsformat === Tidsformat.Desimaler) {
        const [normaltTimer, normaltMinutter] = TimerMedDesimalerTilTimerOgMinutter(
            Number(jobberNormaltTimerPerDag || 0),
        );
        const [faktiskTimer, faktiskMinutter] = TimerMedDesimalerTilTimerOgMinutter(
            Number(faktiskArbeidTimerPerDag || 0),
        );
        return new ArbeidstidPeriodeMedTimer({
            jobberNormaltPerDag: {
                timer: normaltTimer,
                minutter: normaltMinutter,
            },
            faktiskArbeidPerDag: {
                timer: faktiskTimer,
                minutter: faktiskMinutter,
            },
        });
    }
    return new ArbeidstidPeriodeMedTimer({
        jobberNormaltPerDag: {
            timer: jobberNormaltPerDag?.timer || '0',
            minutter: jobberNormaltPerDag?.minutter || '0',
        },
        faktiskArbeidPerDag: {
            timer: faktiskArbeidPerDag?.timer || '0',
            minutter: faktiskArbeidPerDag?.minutter || '0',
        },
    });
};
