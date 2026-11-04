import { http, HttpResponse } from 'msw/http';
import { ApiPath } from 'app/apiConfig';

export const opprettNottat = http.post(ApiPath.OPPRETT_NOTAT, () =>
    HttpResponse.json({ journalpostId: '200' }, { status: 201 }),
);

export const opprettNottatMedFeil = http.post(ApiPath.OPPRETT_NOTAT, () =>
    HttpResponse.json({}, { status: 400 }),
);
