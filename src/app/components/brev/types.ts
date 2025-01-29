export enum DokumentMalType {
    INNHENT_DOK = 'INNHEN',
    INNOPP = 'INNOPP',
    REVURDERING_DOK = 'REVURD',
    FORLENGET_DOK = 'FORLEN',
    FORLENGET_MEDL_DOK = 'FORLME',
    VEDTAK_MEDHOLD = 'VEDMED',
    KLAGE_AVVIST_DOK = 'KLAGAV',
    KLAGE_YTELSESVEDTAK_STADFESTET_DOK = 'KLAGVE',
    KLAGE_YTELSESVEDTAK_OPPHEVET_DOK = 'KLAGNY',
    KLAGE_OVERSENDT_KLAGEINSTANS_DOK = 'KLAGOV',
    ANKE_VEDTAK_OMGJORING = 'VEDOGA',
    ANKE_BESLUTNING_OM_OPPHEVING = 'ANKEBO',
    TBKVAR = 'TBKVAR',
    KORRIGVARS = 'KORRIGVARS',
    FRITKS = 'FRITKS',
    GENERELT_FRITEKSTBREV = 'GENERELT_FRITEKSTBREV',
    GENERELT_FRITEKSTBREV_NYNORSK = 'GENERELT_FRITEKSTBREV_NYNORSK',
    VARSEL_OM_TILBAKEKREVING = 'VARS',
    INNVILGELSE = 'INNVILGELSE',
    AVSLAG = 'AVSLAG',
    UTLED = 'UTLED',
    HENLEGG_BEHANDLING_DOK = 'HENLEG',
}

export enum BrevFormKeys {
    brevmalkode = 'brevmalkode',
    mottaker = 'mottaker',
    velgAnnenMottaker = 'velgAnnenMottaker',
    orgNummer = 'orgNummer',
    overskrift = 'overskrift',
    brødtekst = 'brødtekst',
}

export interface IBrevForm {
    [BrevFormKeys.brevmalkode]: string;
    [BrevFormKeys.mottaker]: string;
    [BrevFormKeys.velgAnnenMottaker]: boolean;
    [BrevFormKeys.orgNummer]: string;
    [BrevFormKeys.overskrift]: string;
    [BrevFormKeys.brødtekst]: string;
}

export interface IBrevMottaker {
    type: IBrevMottakerType;
    id: string;
}

export interface IBrevDokumentdata {
    fritekst?: string;
    fritekstbrev?: {
        overskrift: string;
        brødtekst: string;
    };
}

export interface IBrev {
    soekerId: string;
    mottaker: IBrevMottaker;
    fagsakYtelseType: string;
    dokumentMal: string;
    dokumentdata: IBrevDokumentdata;
    journalpostId?: string;
    saksnummer?: string;
}

export enum IBrevMottakerType {
    aktørId = 'AKTØRID',
    orgNr = 'ORGNR',
}

export interface IBrevmalLink {
    type: string;
    rel: string;
    href: string;
}

export interface IMal {
    navn: string;
    mottakere: string[];
    linker: IBrevmalLink[];
    støtterFritekst: boolean;
    støtterTittelOgFritekst: boolean;
    kode: string;
    støtterTredjepartsmottaker: boolean;
}

export interface Brevmal {
    [key: string]: IMal;
}
