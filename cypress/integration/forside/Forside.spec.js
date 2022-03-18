describe('forside', () => {
    it('kan søke opp journalpost', () => {
        cy.visit('/');
        cy.soekPaaJournalpost();
        cy.url().should('contains', '/journalpost/200#/');
    });

    it('får feilmelding når journalposten ikke finnes', () => {
        cy.intercept('GET', '/api/k9-punsj/journalpost/201', {
            statusCode: 404,
        });

        cy.visit('/');
        cy.soekPaaJournalpost('201');
        cy.contains(/Det finnes ingen journalposter med ID 201/i).should('exist');
    });

    it('viser feilmelding ved forbidden', () => {
        cy.intercept('GET', '/api/k9-punsj/journalpost/203', {
            statusCode: 403,
        });

        cy.visit('/');
        cy.soekPaaJournalpost('203');
        cy.contains(/Du har ikke tilgang til å slå opp denne personen/i).should('exist');
    });

    // teste 409 på journalpost
    // teste uhåndterte feilmeldinger
});
