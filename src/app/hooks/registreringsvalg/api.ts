import { get, post } from 'app/utils';
import { SoknadConfig, RegistreringsValgParams } from './types';

export const fetchEksisterendeSoknader = async (
    config: SoknadConfig,
    søkerId: string,
    pleietrengendeId?: string | null,
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
        // For PLS/PPN/PSB/OMP_KS bruker vi pleietrengendeIdent
        if (config.type === 'PPN' || config.type === 'PSB' || config.type === 'OMP_KS') {
            requestBody.pleietrengendeIdent = params.pleietrengendeId;
        } else if (config.type === 'OLP') {
            // OLP bruker pleietrengendeId (ikke pleietrengendeIdent)
            requestBody.pleietrengendeId = params.pleietrengendeId;
        } else {
            // For OMP_AO bruker vi barnIdent
            requestBody.barnIdent = params.pleietrengendeId;
        }
    }
    // OMP_UT trenger ikke noen ekstra ident-felt

    const response = await post(config.createSoknadPath, undefined, undefined, requestBody);

    if (!response.ok) {
        throw new Error('Det oppstod en feil under opprettelse av søknad.');
    }

    return response.json();
};
