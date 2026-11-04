import { http, HttpResponse } from 'msw/http';
import { ApiPath } from 'app/apiConfig';

export const fagsaker = [
    {
        fagsakId: 'ABC123',
        sakstype: 'PSB',
        reservert: false,
        gyldigPeriode: { fom: '2024-01-01', tom: '2024-12-31' },
        historisk: false,
    },
    {
        fagsakId: 'DEF456',
        sakstype: 'PPN',
        reservert: false,
        gyldigPeriode: { fom: '2024-01-01', tom: '2024-12-31' },
        historisk: false,
    },
    {
        fagsakId: 'HIST001',
        sakstype: 'PSB',
        reservert: false,
        gyldigPeriode: { fom: '2019-01-01', tom: '2019-12-31' },
        historisk: true,
    },
];

export const hentFagsaker = http.get(ApiPath.HENT_FAGSAK_PÅ_IDENT, () => HttpResponse.json(fagsaker));

export const hentFagsakerMedFeil = http.get(ApiPath.HENT_FAGSAK_PÅ_IDENT, () =>
    HttpResponse.json({}, { status: 400 }),
);

export const hentFagsakerTomtArray = http.get(ApiPath.HENT_FAGSAK_PÅ_IDENT, () => HttpResponse.json([]));
