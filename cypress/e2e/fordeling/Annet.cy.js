import { http, HttpResponse } from 'msw';
import { ApiPath } from 'app/apiConfig';
import journalpost from '../../fixtures/jpOMPUT305.json';

const dokumenttype = 'Omsorgspenger';
const valgteDokumentType = 'Annet';

const journalpostId = journalpost.journalpostId;
const norskIdent = journalpost.norskIdent;

describe(`Fordeling ${dokumenttype}`, { testIsolation: false }, () => {
    it(`Åpne journalpost ${journalpostId} fra LOS`, () => {
        cy.visit(`/journalpost/${journalpostId}`);
        Cypress.config('viewportWidth', 1280);
        Cypress.config('viewportHeight', 1450);
        cy.findByText(/Skjul/i).should('exist').click();
        cy.findByText(valgteDokumentType).should('exist').click();
    });

    it('Journalpost pannel med riktig data', () => {
        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Journalpostnummer/i).should('exist');
            cy.findByText(journalpostId).should('exist');
            cy.findByText(/Søkers ID/i).should('exist');
            cy.findByText(norskIdent).should('exist');
            cy.findByText(/Sakstype/i).should('exist');
            cy.findByText(dokumenttype).should('exist');
        });
    });

    it('Test ytelse har checkboks for 2 søkere', () => {
        cy.get('[data-test-id="toSokereCheckbox"]').should('not.exist');
    });

    it('Viser dokumentvalg', () => {
        cy.contains(/Dette gjelder:?/i).should('exist');
        cy.contains('Pleiepenger').should('exist');
        cy.contains('Omsorgspenger/omsorgsdager').should('exist');
        cy.contains('Pleiepenger i livets sluttfase').should('exist');
        cy.contains('Annet').should('exist');
    });

    it('Test Opprett journalføringsoppgave i Gosys med feil svar fra serveren', () => {
        cy.findByText(valgteDokumentType).should('exist').click();

        cy.findByLabelText('Søkers fødselsnummer eller D-nummer:').should('exist').should('have.value', norskIdent);
        cy.get('[data-test-id="gosysKategoriSelect"]').should('exist').select('Omsorgspenger');

        cy.get('[data-test-id="oppretteGosysOppgaveBtn"]').should('exist').should('not.be.disabled').click();

        cy.get('[data-test-id="okGåTilLosModal"]').should('not.exist');

        cy.get('[data-test-id="opprettIGosysFeil"]').should('exist');
    });

    it('Test Opprett journalføringsoppgave i Gosys', () => {
        cy.window().then((window) => {
            const { worker } = window.msw;
            worker.use(http.post(ApiPath.OPPRETT_GOSYS_OPPGAVE, () => HttpResponse.json({ status: 200 })));
        });

        cy.get('[data-test-id="oppretteGosysOppgaveBtn"]').should('exist').should('not.be.disabled').click();

        cy.get('[data-test-id="opprettIGosysFeil"]').should('not.exist');

        cy.get('[data-test-id="okGåTilLosModal"]').should('exist');
        cy.get('[data-test-id="okGåTilLosModalInfo"]').should('exist');
        cy.get('[data-test-id="okGåTilLosModalOKBtn"]').should('exist').click();

        cy.get('[data-test-id="okGåTilLosModal"]').should('not.exist');
    });
});
