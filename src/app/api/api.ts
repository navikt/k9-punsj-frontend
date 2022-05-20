/* eslint-disable import/prefer-default-export */

import { ApiPath } from 'app/apiConfig';
import { get, post } from 'app/utils';
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

export const eksisterendeSoeknaderQuery = ({ path, ident }: { path: ApiPath; ident: string }) =>
    get(path, undefined, { 'X-Nav-NorskIdent': ident }).then((response) => {
        if (!response.ok) {
            throw Error('Kunne ikke hente påbegynte registreringer.');
        }
        return response.json();
    });

export const createSoeknadMutation = ({
    path,
    journalpostId,
    ident,
}: {
    path: ApiPath;
    journalpostId: string;
    ident: string;
}) =>
    post(path, undefined, undefined, {
        journalpostId,
        norskIdent: ident,
    }).then((response) => {
        if (!response.ok) {
            throw Error('Det oppstod en feil under opprettelse av søknad.');
        }
        return response.json();
    });
