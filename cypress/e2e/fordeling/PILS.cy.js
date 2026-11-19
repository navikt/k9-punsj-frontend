import { ApiPath } from 'app/apiConfig';
import { http, HttpResponse } from 'msw/http';
import journalpost from '../../fixtures/jpPILS301.json';

const dokumenttype = 'Pleiepenger i livets sluttfase';
const valgteDokumentType = 'Pleiepenger i livets sluttfase';
const valgteDokumentTypeKode = 'PLEIEPENGER_I_LIVETS_SLUTTFASE';
const journalpostId = journalpost.journalpostId;
const norskIdent = journalpost.norskIdent;
const pleietrengende = '24420167209';

describe(`Fordeling ${dokumenttype}`, { testIsolation: false, viewportWidth: 1280, viewportHeight: 1450 }, () => {
    it(`Åpne journalpost ${journalpostId} fra LOS`, () => {
        cy.visit(`/journalpost/${journalpostId}`);
    });

    it('Skjul dokument vindu', () => {
        cy.findByText(/Skjul/i).should('exist').click();
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

    it('Test checked riktig dokumenttype', () => {
        cy.contains(valgteDokumentType).should('exist');
        cy.get(`input[value="${valgteDokumentTypeKode}"]`).should('exist').should('be.checked');
    });

    it('Test ytelse har checkboks for 2 søkere', () => {
        cy.get('[data-test-id="toSokereCheckbox"]').should('exist');
    });

    it('Test journalfør buttons disabled ved start', () => {
        cy.get('[data-test-id="journalførOgFortsett"]').should('be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('be.disabled');
    });

});

describe(`Fordeling ${dokumenttype} søker uten fagsaker`, { testIsolation: false, viewportWidth: 1280, viewportHeight: 1450 }, () => {
    it('PSB intercept hent fagsaker', () => {
        cy.visit(`/journalpost/${journalpostId}`);

        cy.findByText(/Skjul/i).should('exist').click();

        cy.window().then((window) => {
            const { worker } = window.msw;
            worker.use(http.get(ApiPath.HENT_FAGSAK_PÅ_IDENT, () => HttpResponse.json([], { status: 200 })));
        });

        cy.findByText(/Ja/i).should('exist').click();

        cy.findByLabelText('Velg fagsak').should('not.exist');
    });

    it('Test uten fagsaker med pleitrengende', () => {
        cy.findByLabelText('Pleietrengendes fødselsnummer:').should('exist').type(pleietrengende);

        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Pleietrengendes ID/i).should('exist');
            cy.findByText(pleietrengende).should('exist');
        });

        cy.get('[data-test-id="jornalførUtenFagsak"]').should('exist');

        cy.get('[data-test-id="journalførOgFortsett"]').should('not.be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('not.be.disabled');
    });

    it('PSB Test uten fagsaker og Pleietrengende har ikke fødselsnummer', () => {
        cy.findByLabelText('Pleietrengende har ikke fødselsnummer').check();

        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Pleietrengendes ID/i).should('not.exist');
            cy.findByText(pleietrengende).should('not.exist');
        });

        cy.get('[data-test-id="pleietrengendeHarIkkeFnrInformasjon"]').should('exist');

        cy.get('[data-test-id="journalførOgFortsett"]').should('be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('not.be.disabled');
    });
});
