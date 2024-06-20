import { DokumenttypeForkortelse, FordelingDokumenttype, Sakstype } from 'app/models/enums';
import { ArbeidstidPeriodeMedTimer, IArbeidstidPeriodeMedTimer, Periodeinfo } from 'app/models/types';
import { ROUTES } from 'app/constants/routes';
import { Tidsformat } from './timeUtils';

export const formattereDatoIArray = (dato: number[]) => {
    const formatertDato: string[] = [];
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
    if (host.includes('intern.dev.nav.no') || host.includes('localhost')) {
        return `https://app-q1.adeo.no/modiapersonoversikt/person/${fødselsnummer}/meldinger/`;
    }
    if (host.includes('intern.nav.no')) {
        return `https://app.adeo.no/modiapersonoversikt/person/${fødselsnummer}/meldinger/`;
    }
    return null;
};

export function timerOgMinutterTilTimerMedDesimaler({ timer, minutter }: { timer: string; minutter: string }): string {
    const totalMinutes = parseInt(timer || '0', 10) * 60 + parseInt(minutter || '0', 10);
    const timerOgDesimaler = totalMinutes / 60;
    if (Number.isNaN(timerOgDesimaler)) {
        return '0';
    }

    const rounded = parseFloat(timerOgDesimaler.toFixed(2));
    return rounded === 0 ? '0' : String(rounded);
}

export function timerMedDesimalerTilTimerOgMinutter(timerOgDesimaler = 0): [string, string] {
    const totalMinutes = Math.round(timerOgDesimaler * 60);
    const minutes = totalMinutes % 60;
    const timer = Math.floor(totalMinutes / 60);
    return [!Number.isNaN(timer) ? String(timer) : '0', !Number.isNaN(minutes) ? String(minutes) : '0'];
}
export const konverterPeriodeTilTimerOgMinutter = (periode: Periodeinfo<IArbeidstidPeriodeMedTimer>) => {
    const { tidsformat, faktiskArbeidTimerPerDag, jobberNormaltTimerPerDag, jobberNormaltPerDag, faktiskArbeidPerDag } =
        periode;
    const timerOgMinutter =
        tidsformat === Tidsformat.Desimaler
            ? {
                  jobberNormaltPerDag: {
                      timer: timerMedDesimalerTilTimerOgMinutter(Number(jobberNormaltTimerPerDag))[0],
                      minutter: timerMedDesimalerTilTimerOgMinutter(Number(jobberNormaltTimerPerDag))[1],
                  },
                  faktiskArbeidPerDag: {
                      timer: timerMedDesimalerTilTimerOgMinutter(Number(faktiskArbeidTimerPerDag))[0],
                      minutter: timerMedDesimalerTilTimerOgMinutter(Number(faktiskArbeidTimerPerDag))[1],
                  },
              }
            : {
                  jobberNormaltPerDag,
                  faktiskArbeidPerDag,
              };

    return new ArbeidstidPeriodeMedTimer({
        ...periode,
        periode: periode.periode,
        jobberNormaltPerDag: {
            timer: timerOgMinutter.jobberNormaltPerDag?.timer || '0',
            minutter: timerOgMinutter.jobberNormaltPerDag?.minutter || '0',
        },
        faktiskArbeidPerDag: {
            timer: timerOgMinutter.faktiskArbeidPerDag?.timer || '0',
            minutter: timerOgMinutter.faktiskArbeidPerDag?.minutter || '0',
        },
    });
};

export const getPathFraForkortelse = (ytelseType?: DokumenttypeForkortelse) => {
    switch (ytelseType) {
        case DokumenttypeForkortelse.PSB:
            return ROUTES.PSB_ROOT;
        case DokumenttypeForkortelse.PPN:
            return ROUTES.PLS_ROOT;
        case DokumenttypeForkortelse.OMP_KS:
            return ROUTES.OMPKS_ROOT;
        case DokumenttypeForkortelse.OMP_MA:
            return ROUTES.OMPMA_ROOT;
        case DokumenttypeForkortelse.OMP_AO:
            return ROUTES.OMPAO_ROOT;
        case DokumenttypeForkortelse.OMP_UT:
            return ROUTES.OMPUT_ROOT;
        case DokumenttypeForkortelse.OLP:
            return ROUTES.OLP_ROOT;
        default:
            return undefined;
    }
};

export const getPathFraDokumenttype = (dokumenttype: FordelingDokumenttype) => {
    switch (dokumenttype) {
        case FordelingDokumenttype.PLEIEPENGER:
            return ROUTES.PSB_ROOT;
        case FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE:
            return ROUTES.PLS_ROOT;
        case FordelingDokumenttype.OMSORGSPENGER_KS:
            return ROUTES.OMPKS_ROOT;
        case FordelingDokumenttype.OMSORGSPENGER_MA:
            return ROUTES.OMPMA_ROOT;
        case FordelingDokumenttype.OMSORGSPENGER_AO:
            return ROUTES.OMPAO_ROOT;
        case FordelingDokumenttype.OMSORGSPENGER_UT:
            return ROUTES.OMPUT_ROOT;
        case FordelingDokumenttype.KORRIGERING_IM:
            return ROUTES.KORRIGERING_ROOT;
        case FordelingDokumenttype.OPPLAERINGSPENGER:
            return ROUTES.OLP_ROOT;
        default:
            return undefined;
    }
};

export const getSakstypeFraForkortelse = (ytelseType?: DokumenttypeForkortelse): Sakstype | undefined => {
    switch (ytelseType) {
        case DokumenttypeForkortelse.PSB:
            return Sakstype.PLEIEPENGER_SYKT_BARN;
        case DokumenttypeForkortelse.PPN:
            return Sakstype.PLEIEPENGER_I_LIVETS_SLUTTFASE;
        case DokumenttypeForkortelse.OMP_KS:
            return Sakstype.OMSORGSPENGER_KRONISK_SYKT_BARN;
        case DokumenttypeForkortelse.OMP_MA:
            return Sakstype.OMSORGSPENGER_MIDLERTIDIG_ALENE;
        case DokumenttypeForkortelse.OMP_AO:
            return Sakstype.OMSORGSPENGER_ALENE_OM_OMSORGEN;
        case DokumenttypeForkortelse.OMP_UT:
            return Sakstype.OMSORGSPENGER_UTBETALING;
        case DokumenttypeForkortelse.OLP:
            return Sakstype.OPPLAERINGSPENGER;
        default:
            return undefined;
    }
};

export const getDokumenttypeFraForkortelse = (
    ytelseType?: DokumenttypeForkortelse,
): FordelingDokumenttype | undefined => {
    switch (ytelseType) {
        case DokumenttypeForkortelse.PSB:
            return FordelingDokumenttype.PLEIEPENGER;
        case DokumenttypeForkortelse.PPN:
            return FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE;
        case DokumenttypeForkortelse.OMP:
            return FordelingDokumenttype.OMSORGSPENGER;
        case DokumenttypeForkortelse.OMP_KS:
            return FordelingDokumenttype.OMSORGSPENGER_KS;
        case DokumenttypeForkortelse.OMP_MA:
            return FordelingDokumenttype.OMSORGSPENGER_MA;
        case DokumenttypeForkortelse.OMP_AO:
            return FordelingDokumenttype.OMSORGSPENGER_AO;
        case DokumenttypeForkortelse.OMP_UT:
            return FordelingDokumenttype.OMSORGSPENGER_UT;
        case DokumenttypeForkortelse.OLP:
            return FordelingDokumenttype.OPPLAERINGSPENGER;
        default:
            return undefined;
    }
};
