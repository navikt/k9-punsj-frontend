describe('Fordeling', () => {
    beforeEach(() => {
        cy.visit('/journalpost/200');
    });

    it('viser dokumentvalg', () => {
        cy.contains(/Dette gjelder:?/i).should('exist');
        cy.contains('Pleiepenger').should('exist');
        cy.contains('Omsorgspenger/omsorgsdager').should('exist');
        cy.contains('Pleiepenger i livets sluttfase').should('exist');
        cy.contains('Annet').should('exist');
    });

    it('viser subdokumentvalg omsorgspenger', () => {
        cy.contains('Ekstra omsorgsdager ved kronisk sykt eller funksjonshemmet barn').should('not.exist');
        cy.contains('Korrigering av inntektsmelding omsorgspenger AG').should('not.exist');

        cy.contains('Omsorgspenger/omsorgsdager').should('exist').click();
        cy.contains('Ekstra omsorgsdager ved kronisk sykt eller funksjonshemmet barn').should('exist');
        cy.contains('Korrigering av inntektsmelding omsorgspenger AG').should('exist').click()
    });

    it('kan opprette journalføringsoppgave i Gosys', () => {
        cy.intercept(
            {
                method: 'GET',
                url: '/api/k9-punsj/gosys/gjelder',
            },
            { fixture: 'gosysKategorier.json' }
        ).as('gosysKategorier');
        cy.contains('Annet').click();
        cy.wait('@gosysKategorier');
        const identifikatorInput = cy.findByLabelText(/Søkers fødselsnummer eller D-nummer/i).should('exist');
        identifikatorInput.clear().type('13337');
    });
});
