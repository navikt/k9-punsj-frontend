import initialState from '../../state/EksisterendeSoknaderInitialState';
// import pleiepengerSoknadSomKanSendesInn from 'fixtures/pleiepengerSoknadSomKanSendesInn';
// import { testHandlers } from 'mocks/testHandlers';
// import { ApiPath } from 'app/apiConfig';

describe('Eksisterende søknader pleiepenger', () => {
    beforeEach(() => {
        cy.visit('/journalpost/200/pleiepenger-sykt-barn/soknader', {
            onBeforeLoad: (window) => {
                window.__initialState__ = initialState;
            },
        });
    });
    it('viser informasjon om journalpost, søker og søkers barn', () => {
        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Journalpostnummer/i).should('exist');
            cy.findByText(/Søkers ID/i).should('exist');
            cy.findByText(/Barnets ID/i).should('exist');

            cy.findByText(/200/i).should('exist');
            cy.findByText(/29099000129/i).should('exist');
            cy.findByText(/16017725002/i).should('exist');
        });
    });

    /*
    it('viser infoboks når det ikke finnes søknader fra før av', () => {
        cy.contains(
            'Det finnes ingen påbegynte registreringer knyttet til søkeren. Klikk på knappen under for å opprette en ny.',
        );
    });
    
    it('kan gå tilbake til fordeling', () => {
        cy.contains(
            'Det finnes ingen påbegynte registreringer knyttet til søkeren. Klikk på knappen under for å opprette en ny.',
        );
        cy.findByRole('button', { name: /tilbake/i }).click();
        cy.url().should('eq', 'http://localhost:8080/journalpost/200');
    });

    it('kan starte ny registrering av pleiepengeskjema', () => {
        cy.window().then((window) => {
            const { worker } = window.msw;
            worker.use(testHandlers.opprettePleiepengesoknad);
        });
        cy.contains(
            'Det finnes ingen påbegynte registreringer knyttet til søkeren. Klikk på knappen under for å opprette en ny.',
        );
        cy.contains(/start ny registrering/i)
            .should('be.visible')
            .click();
        cy.url().should(
            'eq',
            'http://localhost:8080/journalpost/200/pleiepenger-sykt-barn/skjema/0416e1a2-8d80-48b1-a56e-ab4f4b4821fe/',
        );
    });

    it('kan fortsette på eksisterende sak', () => {
        cy.window().then((window) => {
            const { worker, http, HttpResponse } = window.msw;
            worker.use(
                http.get(ApiPath.PSB_EKSISTERENDE_SOKNADER_FIND, () =>
                    HttpResponse.json({
                        søker: '29099000129',
                        fagsakTypeKode: 'PSB',
                        søknader: [pleiepengerSoknadSomKanSendesInn],
                    }),
                ),
            );
        });

        cy.get('.punch_mappetabell').within(() => {
            cy.waitUntil(() => cy.contains(/Mottakelsesdato/i));
            cy.contains(/Mottakelsesdato/i);
            cy.findByText('12.10.2020').should('exist');
            cy.findByText('16017725002').should('exist');
            cy.findByText('200').should('exist');
            cy.findByText('08.11.2021 - 11.11.2021').should('exist');
            cy.findByRole('button', { name: /fortsett/i })
                .should('be.visible')
                .click();
        });

        cy.get('.modal_content').within(() => {
            cy.findByText(/Er du sikker på at du vil fortsette på denne søknaden?/i).should('exist');
            cy.findByRole('button', { name: /fortsett/i })
                .should('be.visible')
                .click();
            cy.url().should(
                'eq',
                'http://localhost:8080/journalpost/200/pleiepenger-sykt-barn/skjema/0416e1a2-8d80-48b1-a56e-ab4f4b4821fe/',
            );
        });
    });
    */
});
