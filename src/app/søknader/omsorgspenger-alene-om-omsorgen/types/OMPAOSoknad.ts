import { PersonEnkel } from 'app/models/types';

import { SoeknadType } from '../../../models/forms/soeknader/SoeknadType';

export interface IOMPAOSoknad extends SoeknadType {
    metadata: {
        signatur: string | null;
    };
    periode: {
        fom: string;
    };
    barn: PersonEnkel;
}
