import { ApiPath } from 'app/apiConfig';
import { http, HttpResponse } from 'msw/http';
import fagsaker from '../fixtures/fagsaker.json';

const søkerId = '08438323288';
const tilgangsmelding = 'Du har ikke tilgang til å hente fagsaker for denne søkeren.';

const configureFagsakResponses = (...responses) => {
    let responseIndex = 0;

    cy.window().then((window) => {
        window.msw.worker.use(
            http.get(ApiPath.HENT_FAGSAK_PÅ_IDENT, () => {
                const response = responses[Math.min(responseIndex, responses.length - 1)];
                responseIndex += 1;
                return HttpResponse.json(response.data, { status: response.status });
            }),
        );
    });
};

const besøkOpprettJournalpost = (...responses) => {
    cy.visit('/opprett-journalpost');
    configureFagsakResponses(...responses);
    cy.findByLabelText('Søkers fødselsnummer').type(søkerId);
};

const besøkSendBrevIAvsluttetSak = (...responses) => {
    cy.visit('/brev-avsluttet-sak/');
    configureFagsakResponses(...responses);
    cy.findByLabelText('Søkers fødselsnummer').type(søkerId);
};

const feil403 = { status: 403, data: { reason: 'Teknisk årsak fra backend' } };
const feil500 = { status: 500, data: { reason: 'Teknisk årsak fra backend' } };
const tomListe = { status: 200, data: [] };
const vellykketOppslag = { status: 200, data: fagsaker };

describe('Fagsakoppslag i Opprett journalpost', () => {
    it('viser tilgangsmelding ved 403 uten å vise backend-årsaken', () => {
        besøkOpprettJournalpost(feil403);

        cy.findByText(tilgangsmelding).should('exist');
        cy.findByText('Teknisk årsak fra backend').should('not.exist');
        cy.findByRole('button', { name: /Hent fagsaker på nytt/i }).should('exist');
    });

    it('viser generell feilmelding ved 500', () => {
        besøkOpprettJournalpost(feil500);

        cy.findByText('Noe gikk galt ved henting av fagsaker. Prøv å hente fagsaker på nytt.').should('exist');
        cy.findByText(tilgangsmelding).should('not.exist');
    });

    it('viser eksisterende melding når svaret er en tom liste', () => {
        besøkOpprettJournalpost(tomListe);

        cy.findByText('Det finnes ingen fagsaker for denne søkeren. Du kan ikke opprette journalpost uten fagsak.').should(
            'exist',
        );
        cy.findByText(tilgangsmelding).should('not.exist');
    });

    it('fjerner feilmeldingen etter et vellykket nytt oppslag', () => {
        besøkOpprettJournalpost(feil403, vellykketOppslag);

        cy.findByText(tilgangsmelding).should('exist');
        cy.findByRole('button', { name: /Hent fagsaker på nytt/i }).click();

        cy.findByText(tilgangsmelding).should('not.exist');
        cy.findByTestId('opprettJournalpostFagsakSelect').find('option[value="1DMU93A"]').should('exist');
    });
});

describe('Fagsakoppslag i Send brev i avsluttet sak', () => {
    it('viser tilgangsmelding ved 403 uten å vise backend-årsaken', () => {
        besøkSendBrevIAvsluttetSak(feil403);

        cy.findByText(tilgangsmelding).should('exist');
        cy.findByText('Teknisk årsak fra backend').should('not.exist');
        cy.findByRole('button', { name: /Hent fagsaker på nytt/i }).should('exist');
    });

    it('fjerner tilgangsmelding og retry-knapp når fødselsnummeret endres', () => {
        besøkSendBrevIAvsluttetSak(feil403);

        cy.findByText(tilgangsmelding).should('exist');
        cy.findByRole('button', { name: /Hent fagsaker på nytt/i }).should('exist');

        cy.findByLabelText('Søkers fødselsnummer').type('{backspace}');

        cy.findByText(tilgangsmelding).should('not.exist');
        cy.findByRole('button', { name: /Hent fagsaker på nytt/i }).should('not.exist');
    });

    it('viser generell feilmelding ved 500', () => {
        besøkSendBrevIAvsluttetSak(feil500);

        cy.findByText('Noe gikk galt ved henting av fagsaker. Prøv å hente fagsaker på nytt.').should('exist');
        cy.findByText(tilgangsmelding).should('not.exist');
    });

    it('viser eksisterende melding når svaret er en tom liste', () => {
        besøkSendBrevIAvsluttetSak(tomListe);

        cy.findByText('Det finnes ingen fagsaker for denne søkeren. Du kan ikke sende brev uten fagsak.').should(
            'exist',
        );
        cy.findByText(tilgangsmelding).should('not.exist');
    });

    it('fjerner feilmeldingen etter et vellykket nytt oppslag', () => {
        besøkSendBrevIAvsluttetSak(feil403, vellykketOppslag);

        cy.findByText(tilgangsmelding).should('exist');
        cy.findByRole('button', { name: /Hent fagsaker på nytt/i }).click();

        cy.findByText(tilgangsmelding).should('not.exist');
        cy.findByLabelText('Velg fagsak').find('option[value="1DQBDDC"]').should('exist');
    });
});
