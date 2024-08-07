export enum Sakstype {
    PLEIEPENGER_SYKT_BARN = 'PLEIEPENGER_SYKT_BARN',
    OMSORGSPENGER = 'OMSORGSPENGER',
    OMSORGSPENGER_KORRIGERING_AV_INNTEKTSMELDING = 'OMSORGSPENGER_KORRIGERING_AV_INNTEKTSMELDING',
    OMSORGSPENGER_FORDELING = 'OMSORGSPENGER_FORDELING',
    OMSORGSPENGER_KRONISK_SYKT_BARN = 'OMSORGSPENGER_KRONISK_SYKT_BARN',
    OMSORGSPENGER_LEGEERKLÆRING = 'OMSORGSPENGER_LEGEERKLÆRING',
    OMSORGSPENGER_ALENE_OM_OMSORGEN = 'OMSORGSPENGER_ALENE_OM_OMSORGEN',
    OMSORGSPENGER_MIDLERTIDIG_ALENE = 'OMSORGSPENGER_MIDLERTIDIG_ALENE',
    OMSORGSPENGER_UTBETALING = 'OMSORGSPENGER_UTBETALING',
    OMSORGSPENGER_SELVST_FRILANS = 'OMSORGSPENGER_SELVST_FRILANS',
    OMSORGSPENGER_ARBEIDSGIVER_IKKE_BETALER = 'OMSORGSPENGER_ARBEIDSGIVER_IKKE_BETALER',
    OPPLAERINGSPENGER = 'OPPLAERINGSPENGER',
    PLEIEPENGER_I_LIVETS_SLUTTFASE = 'PLEIEPENGER_I_LIVETS_SLUTTFASE',
    ANNET = 'ANNET',
    SKAL_IKKE_PUNSJES = 'SKAL_IKKE_PUNSJES',
    SEND_BREV = 'SEND_BREV',
    KLASSIFISER_OG_GAA_TIL_LOS = 'KLASSIFISER_OG_GAA_TIL_LOS',
}

export enum TilgjengeligSakstype {
    PLEIEPENGER_SYKT_BARN = 'PLEIEPENGER_SYKT_BARN',
    PLEIEPENGER_I_LIVETS_SLUTTFASE = 'PLEIEPENGER_I_LIVETS_SLUTTFASE',
    OMSORGSPENGER_KRONISK_SYKT_BARN = 'OMSORGSPENGER_KRONISK_SYKT_BARN',
    OMSORGSPENGER_MIDLERTIDIG_ALENE = 'OMSORGSPENGER_MIDLERTIDIG_ALENE',
    OMSORGSPENGER_ALENE_OM_OMSORGEN = 'OMSORGSPENGER_ALENE_OM_OMSORGEN',
    OMSORGSPENGER_UTBETALING = 'OMSORGSPENGER_UTBETALING',
    OMSORGSPENGER_KORRIGERING_AV_INNTEKTSMELDING = 'OMSORGSPENGER_KORRIGERING_AV_INNTEKTSMELDING',
    ANNET = 'ANNET',
    SKAL_IKKE_PUNSJES = 'SKAL_IKKE_PUNSJES',
    SEND_BREV = 'SEND_BREV',
    KLASSIFISER_OG_GAA_TIL_LOS = 'KLASSIFISER_OG_GAA_TIL_LOS',
    OPPLAERINGSPENGER = 'OPPLAERINGSPENGER',
}

const fellesSakstyper = [
    TilgjengeligSakstype.SEND_BREV,
    TilgjengeligSakstype.KLASSIFISER_OG_GAA_TIL_LOS,
    TilgjengeligSakstype.ANNET,
    TilgjengeligSakstype.SKAL_IKKE_PUNSJES,
];

export const korrigeringAvInntektsmeldingSakstyper = [
    TilgjengeligSakstype.OMSORGSPENGER_KORRIGERING_AV_INNTEKTSMELDING,
    ...fellesSakstyper,
];

export const pleiepengerSakstyper = [TilgjengeligSakstype.PLEIEPENGER_SYKT_BARN, ...fellesSakstyper];

export const pleiepengerILivetsSluttfaseSakstyper = [
    TilgjengeligSakstype.PLEIEPENGER_I_LIVETS_SLUTTFASE,
    ...fellesSakstyper,
];

export const omsorgspengerKroniskSyktBarnSakstyper = [
    TilgjengeligSakstype.OMSORGSPENGER_KRONISK_SYKT_BARN,
    ...fellesSakstyper,
];

export const omsorgspengerMidlertidigAleneSakstyper = [
    TilgjengeligSakstype.OMSORGSPENGER_MIDLERTIDIG_ALENE,
    ...fellesSakstyper,
];

export const omsorgspengerAleneOmOmsorgenSakstyper = [
    TilgjengeligSakstype.OMSORGSPENGER_ALENE_OM_OMSORGEN,
    ...fellesSakstyper,
];

export const opplæringspengerSakstyper = [TilgjengeligSakstype.OPPLAERINGSPENGER, ...fellesSakstyper];

export const omsorgspengerUtbetalingSakstyper = [TilgjengeligSakstype.OMSORGSPENGER_UTBETALING, ...fellesSakstyper];
