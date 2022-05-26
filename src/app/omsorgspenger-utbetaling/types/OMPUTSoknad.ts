import { PersonEnkel } from 'app/models/types';
import { SoeknadType } from '../../models/forms/soeknader/SoeknadType';

export interface IOMPUTSoknad extends SoeknadType {
    barn: PersonEnkel[];
}
