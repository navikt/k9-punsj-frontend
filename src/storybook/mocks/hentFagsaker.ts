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
                historisk: false,
            },
            {
                fagsakId: 'DEF456',
                sakstype: 'PPN',
                pleietrengende: null,
                gyldigPeriode: null,
                historisk: false,
            },
            {
                fagsakId: 'HIST001',
                sakstype: 'PSB',
                pleietrengende: null,
                gyldigPeriode: { fom: '2019-01-01', tom: '2019-12-31' },
                historisk: true,
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
