import {
    IPSBSoknadKvitteringArbeidstidInfo,
    IPSBSoknadKvitteringBosteder,
    IPSBSoknadKvitteringLovbestemtFerie,
    IPSBSoknadKvitteringTilsynsordning,
    IPSBSoknadKvitteringUtenlandsopphold,
} from 'app/models/types/PSBSoknadKvittering';
import { formatereTekstMedTimerOgMinutter, getCountryList, sjekkPropertyEksistererOgIkkeErNull } from 'app/utils';

export const sjekkHvisPerioderEksisterer = (property: string, object: any) =>
    sjekkPropertyEksistererOgIkkeErNull(property, object) && Object.keys(object[property].perioder).length > 0;

export const endreLandkodeTilLandnavnIPerioder = (
    perioder: IPSBSoknadKvitteringBosteder | IPSBSoknadKvitteringUtenlandsopphold,
) => {
    const kopiAvPerioder = JSON.parse(JSON.stringify(perioder));
    Object.keys(perioder).forEach((periode) => {
        const landNavn = getCountryList().find((country) => country.code === perioder[periode].land);
        if (landNavn) kopiAvPerioder[periode].land = landNavn?.name;
    });
    return kopiAvPerioder;
};

export const formattereTimerForArbeidstakerPerioder = (perioder: IPSBSoknadKvitteringArbeidstidInfo) => {
    const kopiAvPerioder = JSON.parse(JSON.stringify(perioder));
    Object.keys(perioder).forEach((periode) => {
        kopiAvPerioder[periode].jobberNormaltTimerPerDag = kopiAvPerioder[periode].jobberNormaltTimerPerDag
            ? formatereTekstMedTimerOgMinutter(kopiAvPerioder[periode].jobberNormaltTimerPerDag)
            : '0';
        kopiAvPerioder[periode].faktiskArbeidTimerPerDag = kopiAvPerioder[periode].faktiskArbeidTimerPerDag
            ? formatereTekstMedTimerOgMinutter(kopiAvPerioder[periode].faktiskArbeidTimerPerDag)
            : '0';
    });
    return kopiAvPerioder;
};

export const formattereTimerOgMinutterForOmsorgstilbudPerioder = (perioder: IPSBSoknadKvitteringTilsynsordning) => {
    const kopiAvPerioder = JSON.parse(JSON.stringify(perioder));
    Object.keys(perioder).forEach((periode) => {
        kopiAvPerioder[periode].etablertTilsynTimerPerDag = formatereTekstMedTimerOgMinutter(
            kopiAvPerioder[periode].etablertTilsynTimerPerDag,
        );
    });
    return kopiAvPerioder;
};

export const genererSkalHaFerie = (perioder: IPSBSoknadKvitteringLovbestemtFerie) =>
    Object.entries(perioder).reduce((acc: { [key: string]: typeof value }, [key, value]) => {
        if (value.skalHaFerie) {
            acc[key] = value;
        }
        return acc;
    }, {});

export const genererIkkeSkalHaFerie = (perioder: IPSBSoknadKvitteringLovbestemtFerie) =>
    Object.entries(perioder).reduce((acc: { [key: string]: typeof value }, [key, value]) => {
        if (!value.skalHaFerie) {
            acc[key] = value;
        }
        return acc;
    }, {});
