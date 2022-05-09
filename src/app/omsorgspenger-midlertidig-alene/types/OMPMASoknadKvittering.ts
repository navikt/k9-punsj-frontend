import BegrunnelseForInnsending from '../../models/types/BegrunnelseForInnsending';
import { AnnenForelderType } from './OMPMASoknad';

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
        barn: Array<{
            norskIdentitetsnummer: string;
            fødselsdato?: string;
        }>;
        annenForelder: Pick<AnnenForelderType, 'situasjonBeskrivelse'> & {
            norskIdentitetsnummer: string;
            situasjon: string;
            periode: string;
        };
    };
    begrunnelseForInnsending: BegrunnelseForInnsending;
}
