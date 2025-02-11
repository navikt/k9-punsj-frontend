import { http, HttpResponse } from 'msw';
import { ApiPath } from 'app/apiConfig';
import fagsaker from '../../fixtures/fagsaker.json';

// Constants
const TEST_DATA = {
    fnr: '08438323288',
    fnrTomtFagsaker: '17519112922',
    fnrWithError: '05508239132',
    journalpostId: '200',
    illegalChars: '^|~{}[]ñçßøå',
    validTitle: 'Eksempel på tittel',
    validNote: 'Eksempel på notat',
};

describe('Opprett journalpost', { testIsolation: false }, () => {
    describe('Navigation', () => {
        it('should navigate from homepage to opprett journalpost', () => {
            cy.visit('/');
            cy.findByTestId('opprett-journalpost-inngang').click();
            cy.url().should('contains', '/opprett-journalpost');
        });
    });

    describe('Form Validation', () => {
        it('should show validation errors for empty required fields', () => {
            cy.findByRole('button', { name: /Opprett journalpost/i }).click();

            cy.findByText('Du må skrive inn søkers fødselsnummer.').should('exist');
            cy.findByText('Du må velge fagsak.').should('exist');
            cy.findByText('Du må skrive inn tittel.').should('exist');
            cy.findByText('Du må skrive inn notat.').should('exist');
        });

        it('should validate fødselsnummer format and length', () => {
            const fnrInput = cy.findByLabelText('Søkers fødselsnummer');

            fnrInput.type('1');
            cy.findByText('Søkers fødselsnummer må være 11 siffer.').should('exist');

            fnrInput.type('1'.repeat(11));
            cy.findByText('Søkers fødselsnummer er ugyldig.').should('exist');

            fnrInput.clear().type(TEST_DATA.fnrTomtFagsaker);
            cy.findByText('Søkers fødselsnummer er ugyldig.').should('not.exist');
        });

        it('should validate title field', () => {
            const titleInput = cy.findByLabelText('Tittel');

            titleInput.type('E');
            cy.findByText('Tittel må være minst 3 tegn.').should('exist');

            titleInput.type(TEST_DATA.illegalChars);
            cy.findByText(/Feltet inneholder ugyldige tegn:/i).should('exist');

            titleInput.clear().type(TEST_DATA.validTitle);
            cy.findByText('Tittel må være minst 3 tegn.').should('not.exist');
        });

        it('should validate note field', () => {
            const noteInput = cy.findByLabelText('Notat');

            noteInput.type('E');
            cy.findByText('Notat må være minst 3 tegn.').should('exist');

            noteInput.type(TEST_DATA.illegalChars);
            cy.findByText(/Feltet inneholder ugyldige tegn:/i).should('exist');

            noteInput.clear().type(TEST_DATA.validNote);
            cy.findByText('Notat må være minst 3 tegn.').should('not.exist');
        });
    });

    describe('Fagsak Handling', () => {
        it('should handle empty fagsaker', () => {
            cy.findByLabelText('Søkers fødselsnummer').type(TEST_DATA.fnrTomtFagsaker);
            cy.findByText(
                'Det finnes ingen fagsaker for denne søkeren. Du kan ikke opprette journalpost uten fagsak.',
            ).should('exist');
        });

        it('should handle fagsak fetch error', () => {
            cy.findByLabelText('Søkers fødselsnummer').clear().type(TEST_DATA.fnrWithError);
            cy.findByText('Noe gikk galt ved henting av fagsaker. Prøv å hente fagsaker på nytt.').should('exist');
        });

        it('should handle successful fagsak retry', () => {
            cy.window().then((window) => {
                const { worker } = window.msw;
                worker.use(http.get(ApiPath.HENT_FAGSAK_PÅ_IDENT, () => HttpResponse.json(fagsaker, { status: 200 })));
            });

            cy.findByRole('button', { name: /Hent fagsaker på nytt/i }).click();
            cy.findByText('Noe gikk galt ved henting av fagsaker.').should('not.exist');
        });
    });

    describe('Journalpost Creation', () => {
        it('should handle failed journalpost creation', () => {
            cy.findByLabelText('Søkers fødselsnummer').type(TEST_DATA.fnr);
            cy.findByLabelText('Velg fagsak').select(1);
            cy.findByLabelText('Tittel').type(TEST_DATA.validTitle);
            cy.findByLabelText('Notat').type(TEST_DATA.validNote);

            cy.window().then((window) => {
                const { worker } = window.msw;
                worker.use(http.post(ApiPath.OPPRETT_NOTAT, () => HttpResponse.json({}, { status: 500 })));
            });

            cy.findByRole('button', { name: /Opprett journalpost/i }).click();
            cy.findByText('Kunne ikke opprette journalpost').should('exist');
        });

        it('should handle successful journalpost creation and navigation', () => {
            cy.window().then((window) => {
                const { worker } = window.msw;
                worker.use(
                    http.post(
                        ApiPath.OPPRETT_NOTAT,
                        () =>
                            new HttpResponse(JSON.stringify({ journalpostId: TEST_DATA.journalpostId }), {
                                status: 201,
                            }),
                    ),
                );
            });

            cy.findByRole('button', { name: /Opprett journalpost/i }).click();
            cy.findByText(`Opprettet. Journalpost-ID: ${TEST_DATA.journalpostId}`).should('exist');

            cy.findByRole('button', { name: /Gå til journalpost/i }).click();
            cy.url().should('contains', `/journalpost/${TEST_DATA.journalpostId}`);
        });
    });
});
