describe('Fordeling', () => {
    it('viser dokumentvalg', async () => {
        cy.contains(/Gjelder dokumentet Pleiepenger sykt barn?/i).should('exist')
        cy.contains('Ja').should('exist')
        cy.contains('Nei').should('exist')
    });
});
