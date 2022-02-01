import BegrunnelseForInnsending from '../BegrunnelseForInnsending';

export interface IOMPKSSoknadKvitteringJournalpost {
    inneholderInfomasjonSomIkkeKanPunsjes?: boolean;
    inneholderMedisinskeOpplysninger?: boolean;
    journalpostId: string;
}

export interface IOMPKSSoknadKvittering {
    mottattDato: string;
    journalposter: IOMPKSSoknadKvitteringJournalpost[];
    ytelse: {
        type: string;
        barn: {
            norskIdentitetsnummer: string;
            fødselsdato: string | null;
        };
        kroniskEllerFunksjonshemming: boolean
    };
    begrunnelseForInnsending: BegrunnelseForInnsending;
}
