import handlers from 'mocks/omsorgspengerMidlertidigAleneHandlers';

describe('Omsorgspengeutbetaling - ny søknad', () => {
    beforeEach(() => {
        cy.visit(
            'http://localhost:8080/journalpost/205#/omsorgspenger-midlertidig-alene/skjema/db054295-f1bd-45d2-b0fe-0d032ce25295',
        );
        cy.window().then((window) => {
            const { worker } = window.msw;
            worker.use(handlers.soknad);
            worker.use(handlers.oppdater);
            worker.use(handlers.valider);
            worker.use(handlers.sendInn);
        });
    });
    it('Kan sende inn søknad', () => {
        cy.findByText('Ikke relevant').click();
        cy.findAllByText('Ikke opplyst').eq(0).click();
        cy.findAllByText('Ikke opplyst').eq(1).click();
        cy.findByRole('button', { name: 'Send inn' }).click();
        cy.findByRole('button', { name: 'Videre' }).click();
        cy.findByRole('button', { name: 'Send inn' }).click();

        cy.url().should(
            'eq',
            'http://localhost:8080/journalpost/205#/omsorgspenger-midlertidig-alene/fullfort/db054295-f1bd-45d2-b0fe-0d032ce25295',
        );
        cy.contains('Tilbake til LOS').scrollIntoView().should('be.visible');
    });
    it('Kan sende inn søknad for frilanser', () => {
        cy.findByText('Ikke relevant').click();
        cy.findAllByText('Ikke opplyst').eq(0).click();
        cy.findAllByText('Ikke opplyst').eq(1).click();
        cy.findByRole('button', { name: 'Send inn' }).click();
        cy.findByRole('button', { name: 'Videre' }).click();
        cy.findByRole('button', { name: 'Send inn' }).click();

        cy.url().should(
            'eq',
            'http://localhost:8080/journalpost/205#/omsorgspenger-midlertidig-alene/fullfort/db054295-f1bd-45d2-b0fe-0d032ce25295',
        );
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
            worker.use(handlers.validerFeil);
        });
        cy.findByText('Ikke relevant').click();
        cy.findAllByText('Ikke opplyst').eq(0).click();
        cy.findAllByText('Ikke opplyst').eq(1).click();
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
