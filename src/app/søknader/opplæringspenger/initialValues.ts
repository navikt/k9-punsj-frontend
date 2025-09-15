import { Periode } from 'app/models/types/Periode';
import { IOLPSoknadBackend, OLPSoknad } from '../../models/types/OLPSoknad';

export const initialValues = ( 
    soknad: IOLPSoknadBackend,
    eksisterendePerioder: Periode[] = [],
) => {
    if (!soknad?.journalposter?.length) {
        throw Error('Mangler journalpost');
    }
    return new OLPSoknad(soknad, eksisterendePerioder);
};
