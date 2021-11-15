import initialState from '../../state/PleiepengerPunsjInitialState';

describe('Pleiepenger punsj', () => {
    beforeEach(() => {
        cy.intercept(
            {
                method: 'GET',
                url: '/me',
            },
            JSON.stringify({ name: 'Bobby Binders' })
        );

        cy.intercept(
            {
                method: 'GET',
                url: '/api/k9-punsj/journalpost/200',
            },
            { fixture: 'journalpost.json' }
        );

        cy.intercept(
            {
                method: 'POST',
                url: '/api/k9-punsj/pleiepenger-sykt-barn-soknad/k9sak/info',
            },
            { body: [] }
        );
        cy.intercept(
            {
                method: 'GET',
                url: '/api/k9-punsj/pleiepenger-sykt-barn-soknad/mappe/0416e1a2-8d80-48b1-a56e-ab4f4b4821fe',
            },
            { fixture: 'pleiepengerSoknad.json' }
        );

        cy.intercept(
            {
                method: 'PUT',
                url: '/api/k9-punsj/pleiepenger-sykt-barn-soknad/oppdater',
            },
            { fixture: 'PleiepengerSoknadSomKanSendesInn.json' }
        );

        cy.intercept(
            {
                method: 'POST',
                url: '/api/k9-punsj/pleiepenger-sykt-barn-soknad/valider',
            },
            { statusCode: 202, fixture: 'pleiepengerSoknadValidering.json' }
        );

        cy.intercept(
            {
                method: 'POST',
                url: '/api/k9-punsj/pleiepenger-sykt-barn-soknad/send',
            },
            { statusCode: 202, fixture: 'pleiepengerSoknadValidering.json' }
        );

        cy.visit('/journalpost/200#/pleiepenger/skjema/0416e1a2-8d80-48b1-a56e-ab4f4b4821fe', {
            onBeforeLoad: (window) => {
                window.__initialState__ = initialState;
            },
        });
    });
    it('kan sende inn søknad om pleiepenger', () => {
        cy.soknadperioderInput('08.11.2021', '11.11.2021');

        cy.sendInnPleiepengeSoknad();

        cy.findByText(
            'Opplysningene er sendt til behandling. Vær oppmerksom på at det kan ta litt tid før opplysningene er synlige på behandlingen i K9-sak.'
        ).should('exist');
        cy.findByText('Oppsummering').should('exist');
        cy.findByRole('button', { name: /tilbake til los/i }).should('exist');
    });
});
