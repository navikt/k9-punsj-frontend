describe('Fordeling', () => {
    beforeEach(() => {
        cy.visit('/journalpost/200');
    });
    it('viser dokumentvalg', () => {
        cy.contains(/Dette gjelder:?/i).should('exist');
        cy.contains('Pleiepenger').should('exist');
        cy.contains('Korrigering av inntektsmelding omsorgspenger AG').should('exist');
        cy.contains('Annet').should('exist');
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

    it('validering av fødselsnummer virker', () => {
        cy.contains('Pleiepenger').click();
        cy.contains('Nei').click();

        const identifikatorInput = cy.findByLabelText(/Søkers fødselsnummer eller D-nummer:/i)
          .should('exist');

        identifikatorInput.clear()
          .type('28887298663');

        cy.findByText(/Dette er ikke et gyldig fødsels- eller D-nummer./i).should("not.exist");
    })

    it('validering av fødselsnummer IKKE virker', () => {
        cy.contains('Pleiepenger').click();
        cy.contains('Nei').click();

        const identifikatorInput = cy.findByLabelText(/Søkers fødselsnummer eller D-nummer:/i)
          .should('exist');

        identifikatorInput.clear()
          .type('2888729866')
          .blur();

        cy.findByText(/Dette er ikke et gyldig fødsels- eller D-nummer./i).should("exist");
    })
});
