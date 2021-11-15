import initialState from '../../state/PleiepengerPunsjInitialState';

describe('Pleiepenger punsj', () => {
    before(() => {
        cy.visit('/journalpost/200#/pleiepenger/hentsoknader', {
            onBeforeLoad: (window) => {
                window.__initialState__ = initialState;
            },
        });
    });
    it('kan sende inn søknad om pleiepenger', () => {
        cy.intercept(
            {
                method: 'POST',
                url: '/api/k9-punsj/pleiepenger-sykt-barn-soknad/k9sak/info',
            },
            { statusCode: 200, body: [] }
        );
        cy.intercept(
            {
                method: 'GET',
                url: '/api/k9-punsj/pleiepenger-sykt-barn-soknad/mappe/0416e1a2-8d80-48b1-a56e-ab4f4b4821fe',
            },
            { statusCode: 200, fixture: 'pleiepengerSoknad.json' }
        );

        
    });
});
