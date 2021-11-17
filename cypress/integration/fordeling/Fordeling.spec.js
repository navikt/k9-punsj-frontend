describe('Fordeling', () => {
    beforeEach(() => {
        cy.visit('/journalpost/200');
    });
    it('viser dokumentvalg', () => {
        cy.contains(/Gjelder dokumentet Pleiepenger sykt barn?/i).should('exist');
        cy.contains('Ja').should('exist');
        cy.contains('Nei').should('exist');
    });

    it('kan opprette journalføringsoppgave i Gosys', () => {
        cy.intercept(
            {
                method: 'GET',
                url: '/api/k9-punsj/gosys/gjelder',
            },
            { fixture: 'gosysKategorier.json' }
        ).as('gosysKategorier');
        cy.contains('Nei').click();
        cy.wait('@gosysKategorier');
        const identifikatorInput = cy.findByLabelText(/Søkers fødselsnummer eller D-nummer/i).should('exist');
        identifikatorInput.clear().type('13337');
    });
});
