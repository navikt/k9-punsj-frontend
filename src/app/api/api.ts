/* eslint-disable import/prefer-default-export */

import { ApiPath } from 'app/apiConfig';
import Fagsak from 'app/types/Fagsak';
import { get } from 'app/utils';
import { ArbeidsgivereResponse } from '../models/types/ArbeidsgivereResponse';

export const finnArbeidsgivere = (
    søkerId: string,
    callback: (response: Response, data: ArbeidsgivereResponse) => void,
    fom?: string,
    tom?: string
): void => {
    if (fom && tom) {
        get(
            `${ApiPath.FINN_ARBEIDSGIVERE}?fom=${fom}&tom=${tom}`,
            { norskIdent: søkerId },
            { 'X-Nav-NorskIdent': søkerId },
            callback
        );
    } else {
        get(ApiPath.FINN_ARBEIDSGIVERE, { norskIdent: søkerId }, { 'X-Nav-NorskIdent': søkerId }, callback);
    }
};

export const finnFagsaker = (søkersFødselsnummer: string, callback: (response: Response, data: Fagsak[]) => void) =>
    get(ApiPath.HENT_FAGSAK_PÅ_IDENT, undefined, { 'X-Nav-NorskIdent': søkersFødselsnummer }, callback);
