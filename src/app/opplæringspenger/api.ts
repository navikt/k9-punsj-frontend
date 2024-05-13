import { ApiPath } from 'app/apiConfig';
import { Periode } from 'app/models/types';
import { ValideringResponse } from 'app/models/types/ValideringResponse';
import { get, post, put } from 'app/utils';

import { IOLPSoknadBackend } from '../models/types/OLPSoknad';
import { IOLPSoknadKvittering } from './OLPSoknadKvittering';
import { IOLPSoknadMappe } from './types/OLPSoknadMappe';

export const hentSoeknad = (ident: string, soeknadId: string): Promise<IOLPSoknadBackend> =>
    get(ApiPath.OLP_SOKNAD_GET, { id: soeknadId }, { 'X-Nav-NorskIdent': ident }).then((response) => {
        if (!response.ok) {
            throw Error('Kunne ikke hente søknad.');
        }
        return response.json();
    });

export const oppdaterSoeknad = (soeknad: Partial<IOLPSoknadBackend>): Promise<Partial<IOLPSoknadBackend>> =>
    put(ApiPath.OLP_SOKNAD_UPDATE, { soeknadId: soeknad.soeknadId }, soeknad).then((response) => {
        if (!response.ok) {
            throw Error('Det oppstod en feil under lagring.');
        }
        return response.json();
    });

export const validerSoeknad = async (
    soeknad: Partial<IOLPSoknadBackend>,
    ident: string,
): Promise<IOLPSoknadKvittering | ValideringResponse> => {
    const response = await post(ApiPath.OLP_SOKNAD_VALIDER, undefined, { 'X-Nav-NorskIdent': ident }, soeknad);
    return response.json();
};

export const hentEksisterendePerioder = async (ident: string): Promise<Periode[]> => {
    const response = await post(ApiPath.OLP_K9_PERIODER, {}, { 'X-Nav-NorskIdent': ident }, { brukerIdent: ident });
    if (!response.ok) {
        throw Error('Kunne ikke hente eksisterende perioder');
    }
    return response.json();
};

export const sendSoeknad = async (
    soeknadId: string,
    ident: string,
): Promise<IOLPSoknadBackend | ValideringResponse> => {
    const response = await post(
        ApiPath.OLP_SOKNAD_SUBMIT,
        undefined,
        { 'X-Nav-NorskIdent': ident },
        { norskIdent: ident, soeknadId },
    );
    if (!response.ok) {
        if (response.status === 400) {
            throw Error('skjema.feil.ikke_sendt');
        }

        if (response.status === 409) {
            throw Error('skjema.feil.konflikt');
        }
        throw Error('skjema.feil.ikke_sendt');
    }
    return response.json();
};

export const opprettSoeknad = (
    journalpostId: string,
    ident: string,
    pleietrengendeId: string,
    k9saksnummer?: string,
): Promise<IOLPSoknadBackend> =>
    post(ApiPath.OLP_SOKNAD_CREATE, undefined, undefined, {
        journalpostId,
        norskIdent: ident,
        pleietrengendeId,
        k9saksnummer,
    }).then((response) => {
        if (!response.ok) {
            throw Error('Det oppstod en feil under opprettelse av søknad.');
        }
        return response.json();
    });

export const hentEksisterendeSoeknader = (ident: string): Promise<IOLPSoknadMappe> =>
    get(ApiPath.OLP_EKSISTERENDE_SOKNADER_FIND, undefined, { 'X-Nav-NorskIdent': ident }).then((response) => {
        if (!response.ok) {
            throw Error('Kunne ikke hente påbegynte registreringer.');
        }
        return response.json();
    });

export default {
    opprettSoeknad,
    oppdaterSoeknad,
    validerSoeknad,
    hentEksisterendeSoeknader,
};
