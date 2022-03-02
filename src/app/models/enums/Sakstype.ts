export enum Sakstype {
    PLEIEPENGER_SYKT_BARN = 'PLEIEPENGER_SYKT_BARN',
    OMSORGSPENGER = 'OMSORGSPENGER',
    OMSORGSPENGER_OVERFØRING = 'OMSORGSPENGER_OVERFØRING',
    OMSORGSPENGER_KORRIGERING_AV_INNTEKTSMELDING = 'OMSORGSPENGER_KORRIGERING_AV_INNTEKTSMELDING',
    OMSORGSPENGER_FORDELING = 'OMSORGSPENGER_FORDELING',
    OMSORGSPENGER_KRONISK_SYKT_BARN = 'OMSORGSPENGER_KRONISK_SYKT_BARN',
    OMSORGSPENGER_LEGEERKLÆRING = 'OMSORGSPENGER_LEGEERKLÆRING',
    OMSORGSPENGER_ALENE_OM_OMSORG = 'OMSORGSPENGER_ALENE_OM_OMSORG',
    OMSORGSPENGER_MIDLERTIDIG_ALENE = 'OMSORGSPENGER_MIDLERTIDIG_ALENE',
    OMSORGSPENGER_SELVST_FRILANS = 'OMSORGSPENGER_SELVST_FRILANS',
    OMSORGSPENGER_ARBEIDSGIVER_IKKE_BETALER = 'OMSORGSPENGER_ARBEIDSGIVER_IKKE_BETALER',
    OPPLAERINGSPENGER = 'OPPLAERINGSPENGER',
    PLEIEPENGER_I_LIVETS_SLUTTFASE = 'PLEIEPENGER_I_LIVETS_SLUTTFASE',
    ANNET = 'ANNET',
    SKAL_IKKE_PUNSJES = 'SKAL_IKKE_PUNSJES',
}

export enum TilgjengeligSakstype {
    PLEIEPENGER_SYKT_BARN = 'PLEIEPENGER_SYKT_BARN',
    PLEIEPENGER_I_LIVETS_SLUTTFASE = 'PLEIEPENGER_I_LIVETS_SLUTTFASE',
    OMSORGSPENGER_KRONISK_SYKT_BARN = 'OMSORGSPENGER_KRONISK_SYKT_BARN',
    OMSORGSPENGER_KORRIGERING_AV_INNTEKTSMELDING = 'OMSORGSPENGER_KORRIGERING_AV_INNTEKTSMELDING',
    ANNET = 'ANNET',
    SKAL_IKKE_PUNSJES = 'SKAL_IKKE_PUNSJES',
}

export const korrigeringAvInntektsmeldingSakstyper = [
    TilgjengeligSakstype.OMSORGSPENGER_KORRIGERING_AV_INNTEKTSMELDING,
    TilgjengeligSakstype.ANNET,
    TilgjengeligSakstype.SKAL_IKKE_PUNSJES,
];

export const pleiepengerSakstyper = [
    TilgjengeligSakstype.PLEIEPENGER_SYKT_BARN,
    TilgjengeligSakstype.ANNET,
    TilgjengeligSakstype.SKAL_IKKE_PUNSJES,
];

export const pleiepengerILivetsSluttfaseSakstyper = [
    TilgjengeligSakstype.PLEIEPENGER_I_LIVETS_SLUTTFASE,
    TilgjengeligSakstype.ANNET,
    TilgjengeligSakstype.SKAL_IKKE_PUNSJES,
];

export const omsorgspengerKroniskSyktBarnSakstyper = [
    TilgjengeligSakstype.OMSORGSPENGER_KRONISK_SYKT_BARN,
    TilgjengeligSakstype.ANNET,
    TilgjengeligSakstype.SKAL_IKKE_PUNSJES,
];
