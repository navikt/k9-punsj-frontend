import { ApiPath } from 'app/apiConfig';
import { http, HttpResponse } from 'msw/http';
import journalpost from '../../fixtures/jpPSB300.json';

const tilgangsmelding = 'Du har ikke tilgang til å hente fagsaker for denne søkeren.';
const feilmelding = 'Henting av fagsak feilet';

const besøkFordelingMedFagsakssvar = (status, data) => {
    cy.visit(`/journalpost/${journalpost.journalpostId}`);
    cy.window().then((window) => {
        window.msw.worker.use(
            http.get(ApiPath.HENT_FAGSAK_PÅ_IDENT, () => HttpResponse.json(data, { status })),
        );
    });
    cy.findByText(/^Ja$/i).click();
};

describe('Feilmeldinger ved fagsakoppslag i Fordeling', { viewportWidth: 1280, viewportHeight: 1450 }, () => {
    it('viser tilgangsmelding når fagsakoppslaget svarer med 403', () => {
        besøkFordelingMedFagsakssvar(403, { reason: 'Teknisk årsak fra backend' });

        cy.findByText(tilgangsmelding).should('exist');
        cy.findByText(feilmelding).should('not.exist');
        cy.findByText('Teknisk årsak fra backend').should('not.exist');
    });

    it('viser generell feilmelding når fagsakoppslaget svarer med 500', () => {
        besøkFordelingMedFagsakssvar(500, { reason: 'Teknisk årsak fra backend' });

        cy.findByText(feilmelding).should('exist');
        cy.findByText(tilgangsmelding).should('not.exist');
    });

    it('viser ingen feilmelding når fagsakoppslaget svarer med en tom liste', () => {
        besøkFordelingMedFagsakssvar(200, []);

        cy.findByText(feilmelding).should('not.exist');
        cy.findByText(tilgangsmelding).should('not.exist');
    });
});
