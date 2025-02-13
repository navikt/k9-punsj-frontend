export const hentPerson = {
    matcher: {
        url: 'path:/api/k9-punsj/person',
        method: 'GET',
    },
    response: {
        status: 200,
        body: {
            etternavn: 'NORDMANN',
            fornavn: 'OLA',
            fødselsdato: '1990-01-01',
            identitetsnummer: '01019012345',
            mellomnavn: null,
            sammensattNavn: 'OLA NORDMANN',
        },
    },
};
