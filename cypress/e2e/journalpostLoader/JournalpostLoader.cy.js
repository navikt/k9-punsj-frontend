import { ApiPath } from 'app/apiConfig';
import { http, HttpResponse } from 'msw';
import journalpost from '../../fixtures/jpPSB300.json';

const journalpostId = journalpost.journalpostId;
const ikkeStøttetText =
    'Journalposten har blitt feilregistrert, avbrutt, utgått eller har endret tema via Gosys/annet system. Lukk oppgaven i Punsj og søk opp journalposten i Gosys for å vurdere eventuell videre håndtering derfra.';

const setupError = (status, response) => {
    cy.window().then((window) => {
        const { worker } = window.msw;
        worker.use(
            http.get(ApiPath.JOURNALPOST_GET.replace('{journalpostId}', journalpostId), () =>
                HttpResponse.json(response, { status }),
            ),
        );
    });
};

describe(`Journalpost loader`, () => {
    Cypress.config('viewportWidth', 1280);
    Cypress.config('viewportHeight', 1450);

    beforeEach(() => {
        cy.visit(`/journalpost/${journalpostId}`);
        // cy.get('[data-testid="spinner"]').should('be.visible');
    });

    it('Viser innhold', () => {
        cy.findByText(/Skjul/i).should('exist').click();
        cy.findByText(/Journalpostnummer/i).should('exist');
        cy.findByText(journalpostId).should('exist');
    });

    it('Viser feilmelding når journalposten ikke har tilhørende dokumenter', () => {
        setupError(200, { ...journalpost, dokumenter: [] });

        cy.findByText(/Journalpostnummer/i).should('not.exist');
        cy.findByText(journalpostId).should('not.exist');
        cy.findByText('Journalposten har ingen tilhørende dokumenter').should('exist');
    });

    it('Viser Not Found error', () => {
        setupError(404, { message: 'journalpost Not Found Error' });
        cy.get('[data-testid="journalpostNotFound"]').should('be.visible');
    });

    it('Viser Forbidden error (sb har ikke tilgang)', () => {
        setupError(403, { message: 'test forbidden error' });
        cy.get('[data-testid="journalpostForbidden"]').should('be.visible');
    });

    it('Viser Conflict error text for ikke støttet journalpost', () => {
        setupError(409, { type: 'punsj://ikke-støttet-journalpost' });
        cy.get('[data-testid="conflict-error-alert"]')
            .should('be.visible')
            .within(() => {
                cy.findByText(ikkeStøttetText).should('exist');
                cy.get('[data-testid="conflict-error-btn"]').contains('Lukk oppgaven i punsj');
            });
    });

    const setupLukkJournalpostError = (status, errorMessage) => {
        setupError(409, { type: 'punsj://ikke-støttet-journalpost' });
        cy.window().then((window) => {
            const { worker } = window.msw;
            worker.use(
                http.get(ApiPath.JOURNALPOST_LUKK_DEBUGG.replace('{journalpostId}', journalpostId), () =>
                    HttpResponse.json({ error: errorMessage }, { status }),
                ),
            );
        });
    };

    it('Viser error nor journalpost eksisterer ikke in Punsj', () => {
        setupLukkJournalpostError(404, 'Journalpost does not exist');
        cy.get('[data-testid="conflict-error-alert"]').within(() => {
            cy.findByText(ikkeStøttetText).should('exist');
            cy.get('[data-testid="conflict-error-btn"]').contains('Lukk oppgaven i punsj').click();
            cy.findByText(`Journalposten ${journalpostId} eksisterer ikke i punsj.`).should('exist');
            cy.get('[data-testid="conflict-error-btn"]').contains('Gå til LOS').should('not.be.disabled');
        });
    });

    it('Viser error når journalpost allerede blitt lukket', () => {
        setupLukkJournalpostError(400, 'Already closed');
        cy.get('[data-testid="conflict-error-alert"]').within(() => {
            cy.findByText(ikkeStøttetText).should('exist');
            cy.get('[data-testid="conflict-error-btn"]').contains('Lukk oppgaven i punsj').click();
            cy.findByText(`Journalposten ${journalpostId} har allerede blitt lukket.`).should('exist');
            cy.get('[data-testid="conflict-error-btn"]').contains('Gå til LOS').should('not.be.disabled');
        });
    });

    it('Viser ukjent error med status code', () => {
        setupLukkJournalpostError(500, 'Unknown error');
        cy.get('[data-testid="conflict-error-alert"]').within(() => {
            cy.findByText(ikkeStøttetText).should('exist');
            cy.get('[data-testid="conflict-error-btn"]').contains('Lukk oppgaven i punsj').click();
            cy.findByText(`Noe gikk galt. Status code: 500.`).should('exist');
            cy.get('[data-testid="conflict-error-btn"]').contains('Gå til LOS').should('not.be.disabled');
        });
    });

    it('Lukkes journalpost successfully og navigerer to LOS', () => {
        setupError(409, { type: 'punsj://ikke-støttet-journalpost' });
        cy.window().then((window) => {
            const { worker } = window.msw;
            worker.use(
                http.get(ApiPath.JOURNALPOST_LUKK_DEBUGG.replace('{journalpostId}', journalpostId), () =>
                    HttpResponse.json({ message: 'test' }, { status: 200 }),
                ),
            );
        });

        cy.get('[data-testid="conflict-error-alert"]').within(() => {
            cy.findByText(ikkeStøttetText).should('exist');
            cy.get('[data-testid="conflict-error-btn"]').contains('Lukk oppgaven i punsj').click();
            cy.findByText(`Journalposten ${journalpostId} har blitt lukket.`).should('exist');
            cy.get('[data-testid="conflict-error-btn"]').contains('Gå til LOS').should('not.be.disabled').click();
        });
        cy.get('[data-testid="conflict-error-alert"]').should('not.exist');
    });
});
