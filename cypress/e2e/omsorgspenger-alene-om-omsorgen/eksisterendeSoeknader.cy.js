import aleneOmOmsorgenHandlers from 'mocks/aleneOmOmsorgenHandlers';

import { initialState } from '../../state/omsorgspenger-alene-om-omsorgen/eksisterendeSoeknaderInitialState';

describe('Eksisterende søknader omsorgspengeutbetaling', () => {
    beforeEach(() => {
        cy.visit('/journalpost/200/omsorgspenger-alene-om-omsorgen/soknader/', {
            onBeforeLoad: (window) => {
                window.__initialState__ = initialState;
            },
        });
        cy.window().then((window) => {
            const { worker } = window.msw;
            worker.use(aleneOmOmsorgenHandlers.tomMappe);
        });
    });
    it('viser informasjon om journalpost og søker', () => {
        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Journalpostnummer/i).should('exist');
            cy.findByText(/Søkers ID/i).should('exist');

            cy.findByText(initialState.felles.journalpost.journalpostId).should('exist');
            cy.findByText(initialState.identState.søkerId).should('exist');
        });
    });
    /*
    it('viser infoboks når det ikke finnes søknader fra før av', () => {
        cy.contains(
            'Det finnes ingen påbegynte registreringer knyttet til søkeren. Klikk på knappen under for å opprette en ny.',
        );
    });

   
    it('kan fortsette på eksisterende soknader', () => {
        cy.window().then((window) => {
            const { worker } = window.msw;
            worker.use(aleneOmOmsorgenHandlers.mappeMedSøknad);
        });
        cy.get('.punch_mappetabell').within(() => {
            cy.waitUntil(() => cy.contains(/Mottakelsesdato/i));
            cy.findByText(/JournalpostID/i).should('exist');
            cy.findByText(/01.06.2023/i).should('exist');
            cy.findByText(/200/i).should('exist');
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
                'http://localhost:8080/journalpost/200/omsorgspenger-alene-om-omsorgen/skjema/9356c863-ab88-41eb-89ec-3ca8cd555537/',
            );
        });
    });

    it('kan gå tilbake til fordeling', () => {
        cy.contains(
            'Det finnes ingen påbegynte registreringer knyttet til søkeren. Klikk på knappen under for å opprette en ny.',
        );
        cy.findByRole('button', { name: /tilbake/i }).click();
        cy.url().should('eq', 'http://localhost:8080/journalpost/200');
    });

    it('kan starte ny registrering av omsorgen alene', () => {
        cy.window().then((window) => {
            const { worker } = window.msw;
            worker.use(aleneOmOmsorgenHandlers.nySoeknad);
        });
        cy.contains(
            'Det finnes ingen påbegynte registreringer knyttet til søkeren. Klikk på knappen under for å opprette en ny.',
        );
        cy.contains(/start ny registrering/i);
        cy.findByRole('button', { name: /start ny registrering/i }).click();

        cy.url().should(
            'eq',
            'http://localhost:8080/journalpost/200/omsorgspenger-alene-om-omsorgen/skjema/9356c863-ab88-41eb-89ec-3ca8cd555537/',
        );
    });

    it('kan ikke start ny registrering når søknad allerede finnes for journalpost', () => {
        cy.window().then((window) => {
            const { worker } = window.msw;
            worker.use(aleneOmOmsorgenHandlers.mappeMedSøknad);
            worker.use(aleneOmOmsorgenHandlers.nySoeknad);
        });
        cy.contains(/Mottakelsesdato/i);

        cy.findByRole('button', { name: /start ny registrering/i }).should('not.exist');
    });
    */
});
