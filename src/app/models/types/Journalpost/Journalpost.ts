import journalpostStatus from 'app/models/enums/JournalpostStatus';

export interface IJournalpost {
    journalpostId: string;
    norskIdent?: string;
    dokumenter: IDokument[];
    dato?: string;
    punsjInnsendingType: Partial<IInnsendingType>;
    journalpostStatus: journalpostStatus;
    kanKopieres?: boolean;
    kanOpprettesJournalføringsoppgave?: boolean;
    erFerdigstilt: boolean;
    registrertInformasjon: {
        brukerIdent: string;
        annenPart?: string;
        pleietrengendeIdent?: string;
        barnIdent?: string;
        ytelsestype: string;
    };
    kanSendeInn: boolean;
    erSaksbehandler: boolean;
}

export interface IDokument {
    dokumentId: string;
}

export interface IDokumentInfo {
    // eslint-disable-next-line camelcase
    dokument_id: string;
}

export interface IJournalpostInfo {
    journalpostId: string;
    dato: string;
    dokumenter: IDokumentInfo[];
    klokkeslett?: string;
    punsjInnsendingType: IInnsendingType;
}

export interface IInnsendingType {
    kode: string;
    navn: string;
    erScanning: boolean;
}
