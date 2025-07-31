import aleneOmOmsorgenHandlers from 'mocks/mockHandlersOMPAO';

describe('Alene om omsorgen - ny søknad', () => {
    beforeEach(() => {
        cy.visit(
            'http://localhost:8080/journalpost/200/omsorgspenger-alene-om-omsorgen/skjema/9356c863-ab88-41eb-89ec-3ca8cd555537/',
        );
        cy.window().then((window) => {
            const { worker } = window.msw;
            worker.use(aleneOmOmsorgenHandlers.soknad);
            worker.use(aleneOmOmsorgenHandlers.oppdater);
            worker.use(aleneOmOmsorgenHandlers.valider);
            worker.use(aleneOmOmsorgenHandlers.sendInn);
        });
    });
    it('Kan sende inn søknad', () => {
        cy.findByText('Ikke relevant').click();
        cy.findByLabelText('Søker er alene om omsorgen fra og med').type('01.10.2022').blur()
        cy.findByRole('button', { name: 'Send inn' }).click();
        cy.findByRole('button', { name: 'Videre' }).click();
        cy.get('.navds-modal').within(() => {
            cy.findByRole('button', { name: 'Send inn' }).click();
        });
        cy.contains('Tilbake til LOS').scrollIntoView().should('be.visible');
    });

    it('Innsending stoppes av validering', () => {
        cy.findByRole('button', { name: 'Send inn' }).click();
        cy.findByText(/Du må fikse disse feilene før du kan sende inn punsjemeldingen./i)
            .scrollIntoView()
            .should('be.visible');
        cy.findByRole('button', { name: 'Videre' }).should('not.exist');
    });

    it('Innsending stoppes av validering fra backend', () => {
        cy.window().then((window) => {
            const { worker } = window.msw;
            worker.use(aleneOmOmsorgenHandlers.validerFeil);
        });
        cy.findByLabelText('Søker er alene om omsorgen fra og med').type('01.10.2022');
        cy.findByText('Ikke relevant').click();
        cy.findByRole('button', { name: 'Send inn' }).click();
        cy.findByText(/feil: Hei, det har oppstått en helt generisk feil. Med vennlig hilsen backend/i)
            .scrollIntoView()
            .should('be.visible');
    });

    // sjekke at journalpostnummer fra flere saker vises
    // sjekk av validering og feilmeldinger på alle felter
    // sjekk at man ikke får sende inn dersom man har valideringsfeil
    // sjekk at alle input-felter fungerer og oppdaterer state?
    // sjekke at eksisterende søknadsperioder vises?
});
