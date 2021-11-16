describe('forside', () => {
    beforeEach(() => {
        cy.intercept(
            {
                method: 'GET',
                url: '/me',
            },
            JSON.stringify({ name: 'Bobby Binders' })
        );
    });

    it('kan søke opp journalpost', () => {
        cy.intercept(
            {
                method: 'GET',
                url: '/api/k9-punsj/journalpost/200',
            },
            { fixture: 'journalpost.json' }
        );

        cy.visit('/');
        cy.soekPaaJournalpost();
        cy.url().should('contains', '/journalpost/200#/');
    });

    it('får feilmelding når journalposten ikke finnes', () => {
        cy.intercept('GET', '/api/k9-punsj/journalpost/200', {
            statusCode: 404,
        });

        cy.visit('/');
        cy.soekPaaJournalpost();
        cy.contains(/Det finnes ingen journalposter med ID 200/i).should('exist');
    });

    it('viser feilmelding ved forbidden', () => {
        cy.intercept('GET', '/api/k9-punsj/journalpost/200', {
            statusCode: 403,
        });

        cy.visit('/');
        cy.soekPaaJournalpost();
        cy.contains(/Du har ikke tilgang til å slå opp denne personen/i).should('exist');
    });
});
