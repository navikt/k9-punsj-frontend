export const sendBrev = {
    matcher: {
        url: 'path:/api/k9-punsj/brev/bestill',
        method: 'POST',
    },
    response: {
        status: 200,
        body: {},
    },
};

export const sendBrevMedFeil = {
    matcher: {
        url: 'path:/api/k9-punsj/brev/bestill',
        method: 'POST',
    },
    response: {
        status: 400,
        body: {},
    },
};
