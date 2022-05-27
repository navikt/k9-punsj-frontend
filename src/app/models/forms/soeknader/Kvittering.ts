import BegrunnelseForInnsending from 'app/models/types/BegrunnelseForInnsending';
import { IOMPUTSoknadKvitteringJournalpost } from 'app/omsorgspenger-utbetaling/types/OMPUTSoknadKvittering';

type Kvittering = {
    mottattDato: string;
    journalposter: IOMPUTSoknadKvitteringJournalpost[];
    begrunnelseForInnsending: BegrunnelseForInnsending;
    språk: string;
    søker: {
        norskIdentitetsnummer: string;
    };
    søknadId: string;
    versjon: string;
};

export default Kvittering;
