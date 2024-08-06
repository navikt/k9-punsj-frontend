export enum FordelingDokumenttype {
    PLEIEPENGER = 'PLEIEPENGER',
    PLEIEPENGER_I_LIVETS_SLUTTFASE = 'PLEIEPENGER_I_LIVETS_SLUTTFASE',
    KORRIGERING_IM = 'KORRIGERING_IM',
    OMSORGSPENGER_KS = 'OMSORGSPENGER_KS',
    OMSORGSPENGER = 'OMSORGSPENGER',
    OMSORGSPENGER_MA = 'OMSORGSPENGER_MA',
    OMSORGSPENGER_AO = 'OMSORGSPENGER_AO',
    OMSORGSPENGER_UT = 'OMSORGSPENGER_UT',
    OPPLAERINGSPENGER = 'OPPLAERINGSPENGER',
    ANNET = 'ANNET',
}

export enum DokumenttypeForkortelse {
    PSB = 'PSB',
    PPN = 'PPN',
    OMP = 'OMP',
    OMP_KS = 'OMP_KS',
    OMP_MA = 'OMP_MA',
    OMP_AO = 'OMP_AO',
    OMP_UT = 'OMP_UT',
    OLP = 'OLP',
}

export enum FordelingOmsorgspengerSubMenyValg {
    OMSORGSPENGER_KS = 'OMSORGSPENGER_KS',
    OMSORGSPENGER_AO = 'OMSORGSPENGER_AO',
    OMSORGSPENGER_MA = 'OMSORGSPENGER_MA',
    OMSORGSPENGER_UT = 'OMSORGSPENGER_UT',
    KORRIGERING_IM = 'KORRIGERING_IM',
}

export const dokumenttyperForPsbOmsOlp = [
    FordelingDokumenttype.PLEIEPENGER,
    FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE,
    FordelingDokumenttype.OMSORGSPENGER_KS,
    FordelingDokumenttype.OMSORGSPENGER_MA,
    FordelingDokumenttype.OMSORGSPENGER_AO,
    FordelingDokumenttype.OMSORGSPENGER_UT,
    FordelingDokumenttype.KORRIGERING_IM,
    FordelingDokumenttype.OPPLAERINGSPENGER,
];
