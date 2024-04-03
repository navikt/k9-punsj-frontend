export type SoeknadType = {
    soeknadId: string;
    soekerId: string;
    journalposter: string[];
    mottattDato?: string;
    klokkeslett?: string;
    harInfoSomIkkeKanPunsjes?: boolean;
    harMedisinskeOpplysninger?: boolean;
    k9saksnummer?: string;
};
