import { ApiPath } from 'app/apiConfig';
import { http, HttpResponse } from 'msw';
import journalpost from '../../fixtures/jpOMPUT305.json';

const dokumenttype = 'Omsorgspenger';
const valgteDokumentType = 'Annet';

const journalpostId = journalpost.journalpostId;
const norskIdent = journalpost.norskIdent;

const klassifiserModalHeaderVent = 'Vil du lagre følgende informasjon til journalposten og sett på vent?';
const klassifiserModalHeaderFortsett = 'Vil du lagre følgende informasjon til journalposten?';

const klassifiserModalAlertInfoKanIkkeEndres = 'Informasjonen kan ikke endres etter journalposten er journalført.';

describe(`Fordeling ${dokumenttype}`, { testIsolation: false }, () => {
    it(`Åpen journalpost ${journalpostId} fra LOS`, () => {
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

        cy.get('[data-test-id="opprettIGosysOkModal"]').should('not.exist');

        cy.get('[data-test-id="opprettIGosysFeil"]').should('exist');
    });

    it('Test Opprett journalføringsoppgave i Gosys', () => {
        cy.window().then((window) => {
            const { worker } = window.msw;
            worker.use(http.post(ApiPath.OPPRETT_GOSYS_OPPGAVE, () => HttpResponse.json({ status: 200 })));
        });

        cy.get('[data-test-id="oppretteGosysOppgaveBtn"]').should('exist').should('not.be.disabled').click();

        cy.get('[data-test-id="opprettIGosysFeil"]').should('not.exist');

        cy.get('[data-test-id="opprettIGosysOkModal"]').should('exist');
        cy.get('[data-test-id="opprettIGosysOkModalInfo"]').should('exist');
        cy.get('[data-test-id="opprettIGosysOkModalOKBtn"]').should('exist').click();

        cy.get('[data-test-id="opprettIGosysOkModal"]').should('not.exist');
    });
});
