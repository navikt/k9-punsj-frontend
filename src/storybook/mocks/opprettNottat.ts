export const opprettNottat = {
    matcher: {
        url: 'path:/api/k9-punsj/notat/opprett',
        method: 'POST',
    },
    response: {
        status: 201,
        body: { journalpostId: '200' },
    },
};

export const opprettNottatMedFeil = {
    matcher: {
        url: 'path:/api/k9-punsj/notat/opprett',
        method: 'POST',
    },
    response: {
        status: 400,
        body: {},
    },
};
