export type SoeknadType = {
    soeknadId: string;
    soekerId: string;
    journalposter: Set<string>;
    mottattDato?: string;
    klokkeslett?: string;
    harInfoSomIkkeKanPunsjes?: boolean;
    harMedisinskeOpplysninger?: boolean;
};
