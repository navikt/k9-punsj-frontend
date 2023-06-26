import BegrunnelseForInnsending from 'app/models/types/BegrunnelseForInnsending';

export interface Journalpost {
    inneholderInfomasjonSomIkkeKanPunsjes?: boolean;
    inneholderInformasjonSomIkkeKanPunsjes?: boolean;
    inneholderMedisinskeOpplysninger?: boolean;
    journalpostId: string;
}

type Kvittering = {
    mottattDato: string;
    journalposter: Journalpost[];
    begrunnelseForInnsending: BegrunnelseForInnsending;
    språk: string;
    søker: {
        norskIdentitetsnummer: string;
    };
    søknadId: string;
    versjon: string;
};

export default Kvittering;
