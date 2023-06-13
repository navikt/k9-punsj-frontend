import { MutationFunction, UseMutationResult, useMutation } from 'react-query';

import { ApiPath } from 'app/apiConfig';
import { IPeriode, Periode } from 'app/models/types';
import { ValideringResponse } from 'app/models/types/ValideringResponse';
import { get, post, put } from 'app/utils';

import { IOMPAOSoknad } from './types/OMPAOSoknad';
import { IOMPAOSoknadKvittering } from './types/OMPAOSoknadKvittering';
import { IOMPAOSoknadSvar } from './types/OMPAOSoknadSvar';

export const hentSoeknad = (ident: string, soeknadId: string): Promise<IOMPAOSoknad> =>
    get(ApiPath.OMP_AO_SOKNAD_GET, { id: soeknadId }, { 'X-Nav-NorskIdent': ident }).then((response) => {
        if (!response.ok) {
            throw Error('Kunne ikke hente søknad.');
        }
        return response.json();
    });

export const oppdaterSoeknad = (soeknad: Partial<IOMPAOSoknad>): Promise<Partial<IOMPAOSoknad>> =>
    put(ApiPath.OMP_AO_SOKNAD_UPDATE, { soeknadId: soeknad.soeknadId }, soeknad).then((response) => {
        if (!response.ok) {
            throw Error('Det oppstod en feil under lagring.');
        }
        return response.json();
    });

export const validerSoeknad = async (
    soeknad: Partial<IOMPAOSoknad>,
    ident: string,
): Promise<IOMPAOSoknadKvittering | ValideringResponse> => {
    const response = await post(ApiPath.OMP_AO_SOKNAD_VALIDER, undefined, { 'X-Nav-NorskIdent': ident }, soeknad);
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

export const opprettSoeknad = (journalpostId: string, ident: string, pleietrengendeId: string): Promise<IOMPAOSoknad> =>
    post(ApiPath.OMP_AO_SOKNAD_CREATE, undefined, undefined, {
        journalpostId,
        norskIdent: ident,
        pleietrengendeIdent: pleietrengendeId,
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

type OppdaterSoeknadMutationVariables = Partial<IOMPAOSoknad>;

export const useOppdaterSoeknadMutation = (payload, options): UseMutationResult<IOMPAOSoknad> =>
    useMutation(() => oppdaterSoeknad(payload), options);

export const useValiderSoeknadMutation = (payload, options): UseMutationResult<IOMPAOSoknadKvittering> =>
    useMutation(() => validerSoeknad(payload, payload.norskIdent), options);

export default {
    opprettSoeknad,
    oppdaterSoeknad,
    validerSoeknad,
    hentEksisterendeSoeknader,
};
