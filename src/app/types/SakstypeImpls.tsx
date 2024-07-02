import { ROUTES } from 'app/constants/routes';

import { ISakstypeOmfordeling, ISakstypePunch, ISakstyper } from '../models/Sakstype';
import { Sakstype } from '../models/enums';

export const Pleiepenger: ISakstypePunch = {
    navn: Sakstype.PLEIEPENGER_SYKT_BARN,
    punchPath: ROUTES.VELG_SOKNAD,
};

export const PleiepengerILivetsSluttfase: ISakstypePunch = {
    navn: Sakstype.PLEIEPENGER_I_LIVETS_SLUTTFASE,
    punchPath: ROUTES.VELG_SOKNAD,
};

export const OmsorgspengerKroniskSyktBarnSakstypePunch: ISakstypePunch = {
    navn: Sakstype.OMSORGSPENGER_KRONISK_SYKT_BARN,
    punchPath: ROUTES.VELG_SOKNAD,
};

export const OmsorgspengerMidlertidigAlene: ISakstypePunch = {
    navn: Sakstype.OMSORGSPENGER_MIDLERTIDIG_ALENE,
    punchPath: ROUTES.VELG_SOKNAD,
};

export const OmsorgspengerUtbetaling: ISakstypePunch = {
    navn: Sakstype.OMSORGSPENGER_UTBETALING,
    punchPath: ROUTES.VELG_SOKNAD,
};
export const OmsorgspengerAleneOmOmsorgen: ISakstypePunch = {
    navn: Sakstype.OMSORGSPENGER_ALENE_OM_OMSORGEN,
    punchPath: ROUTES.VELG_SOKNAD,
};

export const OpplæringspengerPunch: ISakstypePunch = {
    navn: Sakstype.OPPLAERINGSPENGER,
    punchPath: ROUTES.VELG_SOKNAD,
};

export const KorrigeringAvInntektsmelding: ISakstypePunch = {
    navn: Sakstype.OMSORGSPENGER_KORRIGERING_AV_INNTEKTSMELDING,
    punchPath: ROUTES.KORRIGERING_INNTEKTSMELDING,
};

export const SendBrevPåEksisterendeFagsak: ISakstypePunch = {
    navn: Sakstype.SEND_BREV,
    punchPath: ROUTES.SEND_BREV_FAGSAK,
};

export const Annet: ISakstypeOmfordeling = {
    navn: Sakstype.ANNET,
};

export const klassifiserDokument: ISakstypeOmfordeling = {
    navn: Sakstype.KLASSIFISER_OG_GAA_TIL_LOS,
};

export const SkalIkkePunsjes: ISakstypeOmfordeling = {
    navn: Sakstype.SKAL_IKKE_PUNSJES,
};

export const Sakstyper: ISakstyper = {
    punchSakstyper: [
        Pleiepenger,
        PleiepengerILivetsSluttfase,
        OmsorgspengerKroniskSyktBarnSakstypePunch,
        OmsorgspengerAleneOmOmsorgen,
        OmsorgspengerMidlertidigAlene,
        OmsorgspengerUtbetaling,
        KorrigeringAvInntektsmelding,
        SendBrevPåEksisterendeFagsak,
        OpplæringspengerPunch,
    ],
    omfordelingssakstyper: [Annet, SkalIkkePunsjes, klassifiserDokument],
};
