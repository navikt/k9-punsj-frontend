import { PersonEnkel } from 'app/models/types';
import BegrunnelseForInnsending from '../../models/types/BegrunnelseForInnsending';

export interface IOMPUTSoknadKvitteringJournalpost {
    inneholderInformasjonSomIkkeKanPunsjes?: boolean;
    inneholderMedisinskeOpplysninger?: boolean;
    journalpostId: string;
}

export interface IOMPUTSoknadKvittering {
    mottattDato: string;
    journalposter: IOMPUTSoknadKvitteringJournalpost[];
    ytelse: {
        type: string;
        barn: PersonEnkel[];
    };
    begrunnelseForInnsending: BegrunnelseForInnsending;
}
