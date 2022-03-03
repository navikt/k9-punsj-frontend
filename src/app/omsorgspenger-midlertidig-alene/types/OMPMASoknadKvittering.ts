import BegrunnelseForInnsending from '../../models/types/BegrunnelseForInnsending';

export interface IOMPMASoknadKvitteringJournalpost {
    inneholderInformasjonSomIkkeKanPunsjes?: boolean;
    inneholderMedisinskeOpplysninger?: boolean;
    journalpostId: string;
}

export interface IOMPMASoknadKvittering {
    mottattDato: string;
    journalposter: IOMPMASoknadKvitteringJournalpost[];
    ytelse: {
        type: string;
        barn: {
            norskIdentitetsnummer: string;
            fødselsdato: string | null;
        };
        kroniskEllerFunksjonshemming: boolean;
    };
    begrunnelseForInnsending: BegrunnelseForInnsending;
}
