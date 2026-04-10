import { HttpResponse, http } from 'msw';

import { ApiPath } from 'app/apiConfig';

import olpInstitusjoner from '../../cypress/fixtures/olp/olpInstitusjoner.json';
import olpSoknad from '../../cypress/fixtures/olp/olpSoknad.json';
import olpValidering from '../../cypress/fixtures/olp/olpValidering.json';

const mockHandlersOLP = {
    tomMappe: http.get(ApiPath.OLP_EKSISTERENDE_SOKNADER_FIND, () =>
        HttpResponse.json({
            søker: olpSoknad.soekerId,
            fagsakTypeKode: 'OLP',
            søknader: [],
        }),
    ),

    mappeMedSøknad: http.get(ApiPath.OLP_EKSISTERENDE_SOKNADER_FIND, () =>
        HttpResponse.json({
            søker: olpSoknad.soekerId,
            fagsakTypeKode: 'OLP',
            søknader: [olpSoknad],
        }),
    ),

    nySoeknad: http.post(ApiPath.OLP_SOKNAD_CREATE, () => HttpResponse.json(olpSoknad, { status: 201 })),

    soknad: http.get(ApiPath.OLP_SOKNAD_GET.replace('{id}', olpSoknad.soeknadId), () => HttpResponse.json(olpSoknad)),

    oppdater: http.put(ApiPath.OLP_SOKNAD_UPDATE, () => HttpResponse.json(olpSoknad)),

    ingenEksisterendePerioder: http.post(ApiPath.OLP_K9_PERIODER, () => HttpResponse.json([])),

    institusjoner: http.get(ApiPath.OLP_INSTITUSJONER, () => HttpResponse.json(olpInstitusjoner)),

    valider: http.post(ApiPath.OLP_SOKNAD_VALIDER, () => HttpResponse.json(olpValidering, { status: 202 })),

    sendInn: http.post(ApiPath.OLP_SOKNAD_SUBMIT, () => HttpResponse.json(olpValidering, { status: 202 })),
};

export default mockHandlersOLP;
