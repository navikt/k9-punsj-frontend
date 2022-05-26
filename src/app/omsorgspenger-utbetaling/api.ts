import { ApiPath } from 'app/apiConfig';
import { ValideringResponse } from 'app/models/types/ValideringResponse';
import { get, post, put } from 'app/utils';
import { IOMPUTSoknad } from './types/OMPUTSoknad';
import { IOMPUTSoknadSvar } from './types/OMPUTSoknadSvar';

export const hentSoeknad = (ident: string, soeknadId: string): Promise<IOMPUTSoknad> =>
    get(ApiPath.OMP_UT_SOKNAD_GET, { id: soeknadId }, { 'X-Nav-NorskIdent': ident }).then((response) => {
        if (!response.ok) {
            throw Error('Kunne ikke hente søknad.');
        }
        return response.json();
    });

export const oppdaterSoeknad = (soeknad: IOMPUTSoknad): Promise<IOMPUTSoknad> =>
    put(ApiPath.OMP_UT_SOKNAD_UPDATE, { soeknadId: soeknad.soeknadId }, soeknad).then((response) => {
        if (!response.ok) {
            throw Error('Det oppstod en feil under lagring.');
        }
        return response.json();
    });

export const validerSoeknad = async (
    soeknad: IOMPUTSoknad,
    ident: string
): Promise<IOMPUTSoknad | ValideringResponse> => {
    const response = await post(
        ApiPath.OMP_UT_SOKNAD_VALIDER,
        { id: soeknad.soeknadId },
        { 'X-Nav-NorskIdent': ident },
        soeknad
    );
    return response.json();
};

export const opprettSoeknad = (journalpostId: string, ident: string): Promise<IOMPUTSoknad> =>
    post(ApiPath.OMP_UT_SOKNAD_CREATE, undefined, undefined, {                                                                                       
        journalpostId,
        norskIdent: ident,
    }).then((response) => {
        if (!response.ok) {
            throw Error('Det oppstod en feil under opprettelse av søknad.');
        }
        return response.json();
    });

export const hentEksisterendeSoeknader = (ident: string): Promise<IOMPUTSoknadSvar> =>
    get(ApiPath.OMP_UT_EKSISTERENDE_SOKNADER_FIND, undefined, { 'X-Nav-NorskIdent': ident }).then((response) => {
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
