import { PersonEnkel } from 'app/models/types';
import BegrunnelseForInnsending from '../../models/types/BegrunnelseForInnsending';
import { AnnenForelderType } from './OMPUTSoknad';

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
        annenForelder: Pick<AnnenForelderType, 'situasjonBeskrivelse'> & {
            norskIdentitetsnummer: string;
            situasjon: string;
            periode: string;
        };
    };
    begrunnelseForInnsending: BegrunnelseForInnsending;
}
