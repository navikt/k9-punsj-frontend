import { http, HttpResponse } from 'msw';
import { ApiPath } from 'app/apiConfig';
import fagsaker from '../../fixtures/fagsaker.json';

const fnrTomtFagsaker = '17519112922';
const fnrWithError = '05508239132';
const journalpostId = '200';
const illegalChars = '^|~{}[]ñçßøå';

describe('Opprett journalpost', { testIsolation: false }, () => {
    it('Test skal navigere inn fra forsiden', () => {
        cy.visit('/');
        cy.findByTestId('opprett-journalpost-inngang').click();
        cy.url().should('contains', '/opprett-journalpost');
    });

    it('Test component logic and validation', () => {
        cy.findByRole('button', { name: /Opprett journalpost/i }).click();
        cy.findByText('Du må skrive inn søkers fødselsnummer.').should('exist');
        cy.findByText('Du må velge fagsak.').should('exist');
        cy.findByText('Du må skrive inn tittel.').should('exist');
        cy.findByText('Du må skrive inn notat.').should('exist');

        cy.findByLabelText('Søkers fødselsnummer').type('1');
        cy.findByText('Du må skrive inn søkers fødselsnummer.').should('not.exist');
        cy.findByText('Søkers fødselsnummer må være 11 siffer.').should('exist');
        cy.findByLabelText('Søkers fødselsnummer').type('1'.repeat(11));
        cy.findByText('Søkers fødselsnummer må være 11 siffer.').should('not.exist');
        cy.findByText('Søkers fødselsnummer er ugyldig.').should('exist');

        cy.findByLabelText('Søkers fødselsnummer').clear().type(fnrTomtFagsaker);
        cy.findByText('Søkers fødselsnummer er ugyldig.').should('not.exist');

        cy.findByText(
            'Det finnes ingen fagsaker for denne søkeren. Du kan ikke opprette journalpost uten fagsak.',
        ).should('exist');

        cy.findByLabelText('Søkers fødselsnummer').clear().type(fnrWithError);
        cy.findByText(
            'Det finnes ingen fagsaker for denne søkeren. Du kan ikke opprette journalpost uten fagsak.',
        ).should('not.exist');
        cy.findByText(
            'Noe gikk galt ved henting av fagsaker. Sjekk fødselsnummeret, eller prøv å hente fagsakene på nytt.',
        ).should('exist');

        cy.window().then((window) => {
            const { worker } = window.msw;
            worker.use(http.get(ApiPath.HENT_FAGSAK_PÅ_IDENT, () => HttpResponse.json(fagsaker, { status: 200 })));
        });

        cy.findByRole('button', { name: /Hent fagsaker på nytt/i }).click();

        cy.findByText(
            'Noe gikk galt ved henting av fagsaker. Sjekk fødselsnummeret, eller prøv å hente fagsakene på nytt.',
        ).should('not.exist');

        cy.findByLabelText('Velg fagsak').select(1);
        cy.findByText('Du må velge fagsak.').should('not.exist');

        cy.findByLabelText('Tittel').type('E');
        cy.findByText('Tittel må være minst 3 tegn.').should('exist');
        cy.findByLabelText('Tittel').type(illegalChars);
        cy.findByText(/Feltet inneholder ugyldige tegn:/i).should('exist');
        cy.findByLabelText('Tittel').clear().type('Eksempel på tittel');
        cy.findByText('Tittel må være minst 3 tegn.').should('not.exist');

        cy.findByLabelText('Notat').type('E');
        cy.findByText('Notat må være minst 3 tegn.').should('exist');
        cy.findByLabelText('Notat').type(illegalChars);
        cy.findByText(/Feltet inneholder ugyldige tegn:/i).should('exist');

        cy.findByLabelText('Notat').clear().type('Eksempel på notat');
        cy.findByText('Notat må være minst 3 tegn.').should('not.exist');
    });

    it('Test oppretting av journalpost logikk', () => {
        cy.window().then((window) => {
            const { worker } = window.msw;
            worker.use(http.post(ApiPath.OPPRETT_NOTAT, () => HttpResponse.json({}, { status: 500 })));
        });

        cy.findByRole('button', { name: /Opprett journalpost/i }).click();
        cy.findByText('Kunne ikke opprette journalpost').should('exist');

        cy.window().then((window) => {
            const { worker } = window.msw;
            worker.use(
                http.post(
                    ApiPath.OPPRETT_NOTAT,
                    () => new HttpResponse(JSON.stringify({ journalpostId: journalpostId }), { status: 201 }),
                ),
            );
        });
        cy.findByRole('button', { name: /Opprett journalpost/i }).click();

        cy.findByText(`Opprettet. Journalpost-ID: ${journalpostId}`).should('exist');

        cy.findByRole('button', { name: /Gå til journalpost/i }).click();
        cy.url().should('contains', `/journalpost/${journalpostId}`);
    });
});
