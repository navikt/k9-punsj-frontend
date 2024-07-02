import { PersonEnkel } from 'app/models/types';
import { SoeknadType } from 'app/models/forms/soeknader/SoeknadType';

export interface IOMPAOSoknad extends SoeknadType {
    metadata: {
        signatur: string;
    };
    periode: {
        fom: string;
    };
    barn: PersonEnkel;
}
