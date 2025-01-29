export enum BrevFormKeys {
    brevmalkode = 'brevmalkode',
    mottaker = 'mottaker',
    velgAnnenMottaker = 'velgAnnenMottaker',
    orgNummer = 'orgNummer',
    fritekst = 'fritekst',
    fritekstbrev = 'fritekstbrev',
}

export interface IBrevForm {
    [BrevFormKeys.brevmalkode]: string;
    [BrevFormKeys.mottaker]: string;
    [BrevFormKeys.fritekst]: string;
    [BrevFormKeys.velgAnnenMottaker]: boolean;
    [BrevFormKeys.orgNummer]: string;
    [BrevFormKeys.fritekstbrev]: {
        overskrift: string;
        brødtekst: string;
    };
}

export interface IBrevMottaker {
    type: IBrevMottakerType;
    id: string;
}

export interface IBrevDokumentdata {
    [BrevFormKeys.fritekst]?: string;
    [BrevFormKeys.fritekstbrev]?: {
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
