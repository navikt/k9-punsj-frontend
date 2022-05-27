import Kvittering from 'app/models/forms/soeknader/Kvittering';
import BegrunnelseForInnsending from '../../models/types/BegrunnelseForInnsending';

export interface IOMPUTSoknadKvitteringJournalpost {
    inneholderInformasjonSomIkkeKanPunsjes?: boolean;
    inneholderMedisinskeOpplysninger?: boolean;
    journalpostId: string;
}

export interface IOMPUTSoknadKvittering extends Kvittering {
    mottattDato: string;
    journalposter: IOMPUTSoknadKvitteringJournalpost[];
    ytelse: {
        type: string;
    };
    begrunnelseForInnsending: BegrunnelseForInnsending;
}
