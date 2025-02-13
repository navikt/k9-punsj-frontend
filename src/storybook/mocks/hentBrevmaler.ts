export const hentBrevmaler = {
    matcher: {
        url: 'path:/api/k9-formidling/brev/maler',
        method: 'GET',
    },
    response: {
        status: 200,
        body: {
            GENERELT_FRITEKSTBREV: {
                kode: 'GENERELT_FRITEKSTBREV',
                navn: 'Fritekstbrev',
                støtterTittelOgFritekst: true,
                støtterFritekst: true,
            },
            INNHENTE_OPPLYSNINGER: {
                kode: 'INNHENTE_OPPLYSNINGER',
                navn: 'Innhente opplysninger',
                støtterTittelOgFritekst: false,
                støtterFritekst: true,
            },
        },
    },
};
