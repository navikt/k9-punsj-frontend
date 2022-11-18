import initialState from '../../state/EksisterendeSoknaderInitialState';
import { BACKEND_BASE_URL } from '../../../src/mocks/konstanter';
import pleiepengerSoknadSomKanSendesInn from '../../fixtures/pleiepengerSoknadSomKanSendesInn';

describe('Eksisterende søknader pleiepenger', () => {
    beforeEach(() => {
        cy.visit('/journalpost/200#/pleiepenger/hentsoknader', {
            onBeforeLoad: (window) => {
                window.__initialState__ = initialState;
            },
        });
    });
    it('viser informasjon om journalpost, søker og søkers barn', () => {
        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Journalpostnummer/i).should('exist');
            cy.findByText(/Søkers fødselsnummer/i).should('exist');
            cy.findByText(/Pleietrengendes fødselsnummer/i).should('exist');

            cy.findByText(/200/i).should('exist');
            cy.findByText(/29099000129/i).should('exist');
            cy.findByText(/16017725002/i).should('exist');
        });
    });

    it('viser infoboks når det ikke finnes søknader fra før av', () => {
        cy.contains(
            'Det finnes ingen påbegynte registreringer knyttet til søkeren. Klikk på knappen under for å opprette en ny.'
        );
    });

    it('kan gå tilbake til fordeling', () => {
        cy.findByRole('button', { name: /tilbake/i }).click();
        cy.url().should('eq', 'http://localhost:8080/journalpost/200#/');
    });

    it('kan starte ny registrering av pleiepengeskjema', () => {
        cy.contains(/start ny registrering/i)
            .should('be.visible')
            .click();
        cy.url().should(
            'eq',
            'http://localhost:8080/journalpost/200#/pleiepenger/skjema/0416e1a2-8d80-48b1-a56e-ab4f4b4821fe'
        );
    });

    it('kan fortsette på eksisterende sak', () => {
        cy.window().then((window) => {
            const { worker, rest } = window.msw;
            worker.use(
                rest.get(`${BACKEND_BASE_URL}/api/k9-punsj/pleiepenger-sykt-barn-soknad/mappe`, (req, res, ctx) =>
                    res(
                        ctx.json({
                            søker: '29099000129',
                            fagsakTypeKode: 'PSB',
                            søknader: [pleiepengerSoknadSomKanSendesInn],
                        })
                    )
                )
            );
        });

        cy.get('.punch_mappetabell').within(() => {
            cy.findByText('12.10.2020').should('exist');
            cy.findByText('16017725002').should('exist');
            cy.findByText('200').should('exist');
            cy.findByText('08.11.2021 - 11.11.2021').should('exist');
        });

        cy.findByRole('button', { name: /fortsett/i }).click({ force: true });
        cy.findByText(/Er du sikker på at du vil fortsette på denne søknaden?/i).should('exist');
        cy.findByRole('button', { name: /fortsett/i }).click();

        cy.url().should(
            'eq',
            'http://localhost:8080/journalpost/200#/pleiepenger/skjema/0416e1a2-8d80-48b1-a56e-ab4f4b4821fe'
        );
    });
});
