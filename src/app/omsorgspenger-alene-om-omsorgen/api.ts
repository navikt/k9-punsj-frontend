import { ApiPath } from 'app/apiConfig';
import { IPeriode, Periode } from 'app/models/types';
import { ValideringResponse } from 'app/models/types/ValideringResponse';
import { get, post, put } from 'app/utils';

import { IOMPAOSoknad, IOMPAOSoknadBackend } from './types/OMPAOSoknad';
import { IOMPAOSoknadKvittering } from './types/OMPAOSoknadKvittering';
import { IOMPAOSoknadSvar } from './types/OMPAOSoknadSvar';

export const hentSoeknad = (ident: string, soeknadId: string): Promise<IOMPAOSoknadBackend> =>
    get(ApiPath.OMP_AO_SOKNAD_GET, { id: soeknadId }, { 'X-Nav-NorskIdent': ident }).then((response) => {
        if (!response.ok) {
            throw Error('Kunne ikke hente søknad.');
        }
        return response.json();
    });

export const oppdaterSoeknad = (soeknad: Partial<IOMPAOSoknadBackend>): Promise<Partial<IOMPAOSoknadBackend>> =>
    put(ApiPath.OMP_AO_SOKNAD_UPDATE, { soeknadId: soeknad.soeknadId }, soeknad).then((response) => {
        if (!response.ok) {
            throw Error('Det oppstod en feil under lagring.');
        }
        return response.json();
    });

export const validerSoeknad = async (
    soeknad: Partial<IOMPAOSoknadBackend>,
    ident: string,
): Promise<IOMPAOSoknadKvittering | ValideringResponse> => {
    const response = await post(ApiPath.OMP_AO_SOKNAD_VALIDER, undefined, { 'X-Nav-NorskIdent': ident }, soeknad);
    return response.json();
};

export const hentEksisterendePerioder = async (ident: string, periode?: IPeriode): Promise<Periode[]> => {
    const response = await post(
        ApiPath.OMP_AO_K9_PERIODER,
        {},
        { 'X-Nav-NorskIdent': ident },
        { brukerIdent: ident, periode },
    );
    if (!response.ok) {
        throw Error('Kunne ikke hente eksisterende perioder');
    }
    return response.json();
};

export const sendSoeknad = async (soeknadId: string, ident: string): Promise<IOMPAOSoknad | ValideringResponse> => {
    const response = await post(
        ApiPath.OMP_AO_SOKNAD_SUBMIT,
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

export const opprettSoeknad = (journalpostId: string, ident: string): Promise<IOMPAOSoknadBackend> =>
    post(ApiPath.OMP_AO_SOKNAD_CREATE, undefined, undefined, {
        journalpostId,
        norskIdent: ident,
    }).then((response) => {
        if (!response.ok) {
            throw Error('Det oppstod en feil under opprettelse av søknad.');
        }
        return response.json();
    });

export const hentEksisterendeSoeknader = (ident: string): Promise<IOMPAOSoknadSvar> =>
    get(ApiPath.OMP_AO_EKSISTERENDE_SOKNADER_FIND, undefined, { 'X-Nav-NorskIdent': ident }).then((response) => {
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
