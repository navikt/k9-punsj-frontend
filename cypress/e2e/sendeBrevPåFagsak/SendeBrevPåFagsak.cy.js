describe('Send brev på fagsak', () => {
    beforeEach(() => {
        cy.visit('/journalpost/200');
    });

    it('skal navigere til visning', () => {
        cy.contains('Pleiepenger sykt barn').should('exist').click();
        cy.findByText(/ja/i).click();
        cy.findByLabelText(/Velg fagsak/i).select('1DMU93M (K9 Pleiepenger sykt barn)');
        /*
        cy.findByRole('button', { name: /Videre/i }).click();
        cy.findByText(/Send brev og lukk oppgave i LOS/i).click();
        cy.findByRole('button', { name: /bekreft/i }).click();
        cy.url().should('eq', 'http://localhost:8080/journalpost/200/send-brev-fagsak/');
        */
    });
});
