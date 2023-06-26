import Kvittering from 'app/models/forms/soeknader/Kvittering';
import Ytelse from 'app/models/types/Ytelse';

export interface IOMPAOSoknadKvittering extends Kvittering {
    ytelse: {
        type: Ytelse;
        barn: {
            norskIdentitetsnummer: string;
            foedselsdato: string;
        };
        periode: string;
    };
}
