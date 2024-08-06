import { IOLPSoknadBackend, OLPSoknad } from '../models/types/OLPSoknad';

 import/prefer-default-export
export const initialValues = (soknad: IOLPSoknadBackend | undefined): OLPSoknad => {
    if (!soknad?.journalposter?.length) {
        throw Error('Mangler journalpost');
    }
    return new OLPSoknad(soknad);
};
