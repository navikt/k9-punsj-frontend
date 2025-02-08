export const hentFagsaker = {
    matcher: {
        url: 'path:/api/k9-punsj/saker/hent',
        method: 'GET',
    },
    response: {
        status: 200,
        body: [
            {
                fagsakId: 'ABC123',
                sakstype: 'PSB',
                pleietrengende: null,
                gyldigPeriode: null,
            },
            {
                fagsakId: 'DEF456',
                sakstype: 'PPN',
                pleietrengende: null,
                gyldigPeriode: null,
            },
        ],
    },
};

export const hentFagsakerMedFeil = {
    matcher: {
        url: 'path:/api/k9-punsj/saker/hent',
        method: 'GET',
    },
    response: {
        status: 400,
        body: {},
    },
};

export const hentFagsakerTomtArray = {
    matcher: {
        url: 'path:/api/k9-punsj/saker/hent',
        method: 'GET',
    },
    response: {
        status: 200,
        body: [],
    },
};
