import { UseMutationOptions, UseMutationResult, useMutation } from '@tanstack/react-query';

import { ApiPath } from 'app/apiConfig';
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

export const oppdaterSoeknad = (soeknad: Partial<IOMPAOSoknad>): Promise<IOMPAOSoknad> =>
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

export const sendSoeknad = async (
    soeknadId: string,
    ident: string,
): Promise<IOMPAOSoknadKvittering | ValideringResponse> => {
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

export const opprettSoeknad = (
    journalpostId: string,
    ident: string,
    pleietrengendeId: string,
    k9saksnummer?: string,
): Promise<IOMPAOSoknad> =>
    post(ApiPath.OMP_AO_SOKNAD_CREATE, undefined, undefined, {
        journalpostId,
        norskIdent: ident,
        barnIdent: pleietrengendeId,
        k9saksnummer,
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

export const useOppdaterSoeknadMutation = (
    options?: Omit<
        UseMutationOptions<IOMPAOSoknad, Error, { soeknad: Partial<IOMPAOSoknad>; submitSoknad: boolean }>,
        'mutationFn'
    >,
): UseMutationResult<IOMPAOSoknad, Error, { soeknad: Partial<IOMPAOSoknad>; submitSoknad: boolean }> =>
    useMutation({
        mutationFn: ({ soeknad }: { soeknad: Partial<IOMPAOSoknad>; submitSoknad: boolean }) =>
            oppdaterSoeknad(soeknad),
        ...options,
    });

export const useValiderSoeknadMutation = (
    hooks: any,
): UseMutationResult<
    void,
    Error,
    { soeknad: Partial<IOMPAOSoknad>; skalForhaandsviseSoeknad: boolean; isValid: boolean }
> => {
    const validateSoeknad = async ({
        soeknad,
        skalForhaandsviseSoeknad,
        isValid,
    }: {
        soeknad: Partial<IOMPAOSoknad>;
        skalForhaandsviseSoeknad: boolean;
        isValid: boolean;
    }) => {
        try {
            const data = await validerSoeknad(soeknad, soeknad.soekerId as string);
            if ('ytelse' in data && skalForhaandsviseSoeknad && isValid) {
                const kvitteringResponse = data as IOMPAOSoknadKvittering;
                hooks.setVisForhaandsvisModal(true);
                hooks.setKvittering?.(kvitteringResponse);
            }
            if ('feil' in data && data?.feil?.length) {
                hooks.setK9FormatErrors(data.feil);
                hooks.setKvittering?.(undefined);
            } else {
                hooks.setK9FormatErrors([]);
            }
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error);
        }
    };

    return useMutation({
        mutationFn: validateSoeknad,
        onSuccess: () => {
            if (!hooks.setKvittering) {
                throw Error('Kvittering-context er ikke satt');
            }
        },
    });
};

export function useSendSoeknadMutation(
    onSuccess: (data: IOMPAOSoknadKvittering | ValideringResponse) => void,
    onError: (error: Error) => void,
) {
    return useMutation({
        mutationFn: ({ soeknadId, ident }: { soeknadId: string; ident: string }) => sendSoeknad(soeknadId, ident),
        onSuccess,
        onError,
    });
}

export default {
    opprettSoeknad,
    oppdaterSoeknad,
    validerSoeknad,
    hentEksisterendeSoeknader,
};
