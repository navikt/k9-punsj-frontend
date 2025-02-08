export const hentArbeidsgivere = {
    matcher: {
        url: 'path:/api/k9-punsj/arbeidsgivere',
        method: 'GET',
    },
    response: {
        status: 200,
        body: {
            organisasjoner: [
                {
                    navn: 'BEDRIFT AS',
                    orgNummer: '123456789',
                },
                {
                    navn: 'FIRMA AS',
                    orgNummer: '987654321',
                },
            ],
        },
    },
};
