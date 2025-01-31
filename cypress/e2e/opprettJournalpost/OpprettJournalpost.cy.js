describe('Opprett journalpost', () => {
    it('skal navigere inn fra forsiden', () => {
        cy.visit('/');
        cy.findByTestId('opprett-journalpost-inngang').click();
        cy.url().should('contains', '/opprett-journalpost');
    });

    it('skal kunne fylle ut skjema', () => {
        cy.visit('/');
        cy.findByTestId('opprett-journalpost-inngang').click();
        cy.url().should('contains', '/opprett-journalpost');
        cy.findByLabelText('Søkers fødselsnummer').type('02021477330');
        cy.findByLabelText('Velg fagsak').select('1DMU93M');
        cy.findByLabelText('Tittel').type('Eksempel på tittel');
        cy.findByLabelText('Notat').type('Eksempel på notat');
        cy.findByRole('button', { name: /opprett journalpost/i }).click();
        cy.findByRole('button', { name: /gå til journalpost/i }).click();
        cy.url().should('contains', '/journalpost/200');
    });
});
