import { get, post } from 'app/utils';
import { SoknadConfig, RegistreringsValgParams } from './types';

export const fetchEksisterendeSoknader = async (
    config: SoknadConfig,
    søkerId: string,
    pleietrengendeId: string | null | undefined,
) => {
    const idents = pleietrengendeId ? `${søkerId},${pleietrengendeId}` : søkerId;
    const response = await get(config.eksisterendeSoknaderPath, undefined, { 'X-Nav-NorskIdent': idents });

    if (!response.ok) {
        throw new Error('Kunne ikke hente eksisterende søknader.');
    }

    return response.json();
};

export const createSoknad = async (config: SoknadConfig, params: RegistreringsValgParams) => {
    // Bygg request body basert på søknadstype
    const requestBody: any = {
        journalpostId: params.journalpostid,
        norskIdent: params.søkerId,
        k9saksnummer: params.k9saksnummer,
    };

    // Legg til riktig ident-felt basert på søknadstype
    if (config.type === 'OMP_MA' && params.annenPart) {
        requestBody.annenPart = params.annenPart;
        // OMP_MA har også barn-felt som array
        requestBody.barn = [];
    } else if (params.pleietrengendeId) {
        // For PLS bruker vi pleietrengendeIdent, for andre kan det være barnIdent
        if (config.type === 'PPN') {
            requestBody.pleietrengendeIdent = params.pleietrengendeId;
        } else {
            requestBody.barnIdent = params.pleietrengendeId;
        }
    }

    const response = await post(config.createSoknadPath, undefined, undefined, requestBody);
    
    if (!response.ok) {
        throw new Error('Det oppstod en feil under opprettelse av søknad.');
    }
    
    return response.json();
};
