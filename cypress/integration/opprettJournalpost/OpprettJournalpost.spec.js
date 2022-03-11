describe('Opprett journalpost', () => {
    it('skal navigere inn fra forsiden', () => {
        cy.visit('/');
        cy.findByTestId('opprett-journalpost-inngang').click();
        cy.url().should('contains', '/opprett-journalpost');
    });
});
