import { IPSBSoknad, IPeriode } from 'app/models/types';
import { IPSBSoknadUt } from 'app/models/types/PSBSoknadUt';
import { IArbeidstaker } from 'app/models/types/Arbeidstaker';
import { filterPeriodsBySoknadsperioder } from 'app/utils/arbeidstidPeriodUtils';

/**
 * Sjekker om søknadsperioder er endret (slettet eller endret datoer).
 * Returnerer true hvis perioder er slettet eller endret, men ikke hvis bare nye perioder er lagt til.
 *
 * @param eksisterendePerioder - Eksisterende søknadsperioder
 * @param nyePerioder - Nye søknadsperioder
 * @returns true hvis perioder er slettet eller endret, false hvis bare nye er lagt til eller ingen endringer
 */
export const harSoknadsperioderBlittEndretEllerSlettet = (
    eksisterendePerioder: IPeriode[],
    nyePerioder: IPeriode[] | undefined,
): boolean => {
    if (!nyePerioder) {
        return false;
    }

    // Hvis antall perioder er redusert, er noe slettet
    if (nyePerioder.length < eksisterendePerioder.length) {
        return true;
    }

    // Lag et sett med "fingeravtrykk" av eksisterende perioder (fom + tom)
    const eksisterendeFingeravtrykk = new Set(
        eksisterendePerioder.filter((p) => p.fom && p.tom).map((p) => `${p.fom}|${p.tom}`),
    );

    // Sjekk om alle eksisterende perioder finnes i nye perioder med samme datoer
    const nyeFingeravtrykk = new Set(nyePerioder.filter((p) => p.fom && p.tom).map((p) => `${p.fom}|${p.tom}`));

    // Hvis noen eksisterende perioder mangler eller har endrede datoer, er de endret/slettet
    for (const fingeravtrykk of eksisterendeFingeravtrykk) {
        if (!nyeFingeravtrykk.has(fingeravtrykk)) {
            return true;
        }
    }

    // Hvis alle eksisterende perioder finnes med samme datoer, er det bare nye perioder lagt til
    return false;
};

/**
 * Filtrerer arbeidstid og tilsyn perioder basert på søknadsperioder når søknadsperioder er endret eller slettet.
 * Fjerner eller kutter ned perioder som faller utenfor de nye søknadsperiodene.
 *
 * @param eksisterendeSoknad - Eksisterende søknad med alle perioder fra store
 * @param nyeSoknadsperioder - Nye søknadsperioder etter endring eller sletting
 * @param aktuellArbeidstid - Aktuell arbeidstid fra soknad (kan inneholde nylige endringer)
 * @param aktuellTilsynsordning - Aktuell tilsynsordning fra soknad (kan inneholde nylige endringer)
 * @returns Objekt med filtrerte arbeidstid og tilsynsordning, eller undefined hvis ingen endringer
 */
export const filtrerPerioderVedEndringAvSoknadsperiode = (
    eksisterendeSoknad: IPSBSoknadUt,
    nyeSoknadsperioder: IPeriode[],
    aktuellArbeidstid?: IPSBSoknad['arbeidstid'],
    aktuellTilsynsordning?: IPSBSoknad['tilsynsordning'],
): Partial<Pick<IPSBSoknad, 'arbeidstid' | 'tilsynsordning'>> | undefined => {
    // Bruk aktuelle data hvis de finnes, ellers bruk eksisterende fra store
    const arbeidstidTilFiltrering = aktuellArbeidstid || eksisterendeSoknad?.arbeidstid;
    const tilsynsordningTilFiltrering = aktuellTilsynsordning || eksisterendeSoknad?.tilsynsordning;
    // Sjekk om det finnes perioder å filtrere
    const harArbeidstidPerioder =
        arbeidstidTilFiltrering?.arbeidstakerList?.some(
            (arbeidstaker: IArbeidstaker) =>
                arbeidstaker.arbeidstidInfo?.perioder && arbeidstaker.arbeidstidInfo.perioder.length > 0,
        ) ||
        (arbeidstidTilFiltrering?.frilanserArbeidstidInfo?.perioder &&
            arbeidstidTilFiltrering.frilanserArbeidstidInfo.perioder.length > 0) ||
        (arbeidstidTilFiltrering?.selvstendigNæringsdrivendeArbeidstidInfo?.perioder &&
            arbeidstidTilFiltrering.selvstendigNæringsdrivendeArbeidstidInfo.perioder.length > 0);
    const harTilsynPerioder = tilsynsordningTilFiltrering?.perioder && tilsynsordningTilFiltrering.perioder.length > 0;

    // Hvis det ikke finnes perioder å filtrere, returner undefined
    if (!harArbeidstidPerioder && !harTilsynPerioder) {
        return undefined;
    }

    const resultat: Partial<Pick<IPSBSoknad, 'arbeidstid' | 'tilsynsordning'>> = {};

    // Start med en kopi av hele arbeidstid objektet hvis det finnes
    if (arbeidstidTilFiltrering) {
        resultat.arbeidstid = { ...arbeidstidTilFiltrering };

        // Filtrer arbeidstid perioder fra alle arbeidstakere
        if (arbeidstidTilFiltrering.arbeidstakerList) {
            const oppdaterteArbeidstakerList = arbeidstidTilFiltrering.arbeidstakerList.map(
                (arbeidstaker: IArbeidstaker) => {
                    if (arbeidstaker.arbeidstidInfo?.perioder) {
                        const filtrertePerioder = filterPeriodsBySoknadsperioder(
                            arbeidstaker.arbeidstidInfo.perioder,
                            nyeSoknadsperioder,
                        );
                        return {
                            ...arbeidstaker,
                            arbeidstidInfo: {
                                ...arbeidstaker.arbeidstidInfo,
                                perioder: filtrertePerioder,
                            },
                        };
                    }
                    return arbeidstaker;
                },
            );

            resultat.arbeidstid.arbeidstakerList = oppdaterteArbeidstakerList;
        }

        // Filtrer frilanser arbeidstid perioder
        if (arbeidstidTilFiltrering.frilanserArbeidstidInfo?.perioder) {
            const filtrerteFrilanserPerioder = filterPeriodsBySoknadsperioder(
                arbeidstidTilFiltrering.frilanserArbeidstidInfo.perioder,
                nyeSoknadsperioder,
            );

            resultat.arbeidstid.frilanserArbeidstidInfo = {
                ...arbeidstidTilFiltrering.frilanserArbeidstidInfo,
                perioder: filtrerteFrilanserPerioder,
            };
        }

        // Filtrer selvstendig næringsdrivende arbeidstid perioder
        if (arbeidstidTilFiltrering.selvstendigNæringsdrivendeArbeidstidInfo?.perioder) {
            const filtrerteSelvstendigPerioder = filterPeriodsBySoknadsperioder(
                arbeidstidTilFiltrering.selvstendigNæringsdrivendeArbeidstidInfo.perioder,
                nyeSoknadsperioder,
            );

            resultat.arbeidstid.selvstendigNæringsdrivendeArbeidstidInfo = {
                ...arbeidstidTilFiltrering.selvstendigNæringsdrivendeArbeidstidInfo,
                perioder: filtrerteSelvstendigPerioder,
            };
        }
    }

    // Filtrer tilsynsordning perioder
    if (tilsynsordningTilFiltrering?.perioder) {
        const filtrerteTilsynPerioder = filterPeriodsBySoknadsperioder(
            tilsynsordningTilFiltrering.perioder,
            nyeSoknadsperioder,
        );

        resultat.tilsynsordning = {
            ...tilsynsordningTilFiltrering,
            perioder: filtrerteTilsynPerioder,
        };
    }

    return resultat;
};
