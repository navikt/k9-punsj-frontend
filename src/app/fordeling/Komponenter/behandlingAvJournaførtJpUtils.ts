import { ROUTES } from 'app/constants/routes';
import { FordelingDokumenttype, Sakstype } from 'app/models/enums';

export const getSakstypeFraDokumenttype = (dokumenttype?: FordelingDokumenttype): Sakstype | undefined => {
    switch (dokumenttype) {
        case FordelingDokumenttype.PLEIEPENGER:
            return Sakstype.PLEIEPENGER_SYKT_BARN;
        case FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE:
            return Sakstype.PLEIEPENGER_I_LIVETS_SLUTTFASE;
        case FordelingDokumenttype.OMSORGSPENGER_KS:
            return Sakstype.OMSORGSPENGER_KRONISK_SYKT_BARN;
        case FordelingDokumenttype.OMSORGSPENGER_MA:
            return Sakstype.OMSORGSPENGER_MIDLERTIDIG_ALENE;
        case FordelingDokumenttype.OMSORGSPENGER_AO:
            return Sakstype.OMSORGSPENGER_ALENE_OM_OMSORGEN;
        case FordelingDokumenttype.OMSORGSPENGER_UT:
            return Sakstype.OMSORGSPENGER_UTBETALING;
        case FordelingDokumenttype.KORRIGERING_IM:
            return Sakstype.OMSORGSPENGER_KORRIGERING_AV_INNTEKTSMELDING;
        case FordelingDokumenttype.OPPLAERINGSPENGER:
            return Sakstype.OPPLAERINGSPENGER;

        default:
            return undefined;
    }
};

export const getPunchPathFraSakstype = (sakstype?: Sakstype): string | undefined => {
    switch (sakstype) {
        case Sakstype.PLEIEPENGER_SYKT_BARN:
        case Sakstype.PLEIEPENGER_I_LIVETS_SLUTTFASE:
        case Sakstype.OMSORGSPENGER_KRONISK_SYKT_BARN:
        case Sakstype.OMSORGSPENGER_MIDLERTIDIG_ALENE:
        case Sakstype.OMSORGSPENGER_UTBETALING:
        case Sakstype.OMSORGSPENGER_ALENE_OM_OMSORGEN:
        case Sakstype.OPPLAERINGSPENGER:
            return ROUTES.VELG_SOKNAD;
        case Sakstype.OMSORGSPENGER_KORRIGERING_AV_INNTEKTSMELDING:
            return ROUTES.KORRIGERING_INNTEKTSMELDING;
        case Sakstype.SEND_BREV:
            return ROUTES.SEND_BREV_FAGSAK;
        default:
            return undefined;
    }
};
