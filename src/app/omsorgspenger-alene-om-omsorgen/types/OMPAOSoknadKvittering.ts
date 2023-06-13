import Kvittering from 'app/models/forms/soeknader/Kvittering';
import { PersonEnkel } from 'app/models/types';
import Ytelse from 'app/models/types/Ytelse';

export interface IOMPAOSoknadKvittering extends Kvittering {
    ytelse: {
        type: Ytelse;
        barn: PersonEnkel;
        periode: string;
    };
}
