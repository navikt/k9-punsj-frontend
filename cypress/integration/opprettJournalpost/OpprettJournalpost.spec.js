describe('Opprett journalpost', () => {
    it('skal navigere inn fra forsiden', () => {
        cy.visit('/');
        cy.findByTestId('opprett-journalpost-inngang').click();
        cy.url().should('contains', '/opprett-journalpost');
    });

    it('skal kunne fylle ut skjema', () => {
        cy.findByLabelText('Søkers fødselsnummer').type('01234567891');
        cy.findByLabelText('Velg fagsak').select('5YC5Y');
    });
});
