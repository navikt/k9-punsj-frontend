import omsorgspengerutbetalingHandlers from 'mocks/omsorgspengeutbetalingHandlers';

import { initialState } from '../../state/omsorgspenger-utbetaling/eksisterendeSoeknaderInitialState';

describe('Eksisterende søknader omsorgspengeutbetaling', () => {
    beforeEach(() => {
        cy.visit('/journalpost/200/omsorgspenger-utbetaling/soknader/', {
            onBeforeLoad: (window) => {
                window.__initialState__ = initialState;
            },
        });
        cy.window().then((window) => {
            const { worker } = window.msw;
            worker.use(omsorgspengerutbetalingHandlers.tomMappe);
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
            worker.use(omsorgspengerutbetalingHandlers.mappeMedSøknad);
        });
        cy.get('.punch_mappetabell').within(() => {
            cy.waitUntil(() => cy.contains(/Mottakelsesdato/i));
            cy.findByText(/JournalpostID/i).should('exist');
            cy.findByText(/03.10.2022/i).should('exist');
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
                'http://localhost:8080/journalpost/200/omsorgspenger-utbetaling/skjema/4e177e4d-922d-4205-a3e9-d3278da2abf7/',
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

    it('kan starte ny registrering av pleiepengeskjema', () => {
        cy.window().then((window) => {
            const { worker } = window.msw;
            worker.use(omsorgspengerutbetalingHandlers.nySoeknad);
        });
        cy.contains(
            'Det finnes ingen påbegynte registreringer knyttet til søkeren. Klikk på knappen under for å opprette en ny.',
        );
        cy.contains(/start ny registrering/i);
        cy.findByRole('button', { name: /start ny registrering/i }).click();

        cy.url().should(
            'eq',
            'http://localhost:8080/journalpost/200/omsorgspenger-utbetaling/skjema/bc12baac-0f0c-427e-a059-b9fbf9a3adff/',
        );
    });

    it('kan ikke start ny registrering når søknad allerede finnes for journalpost', () => {
        cy.window().then((window) => {
            const { worker, rest } = window.msw;
            worker.use(omsorgspengerutbetalingHandlers.mappeMedSøknad);
            worker.use(omsorgspengerutbetalingHandlers.nySoeknad);
        });
        cy.contains(/Mottakelsesdato/i);

        cy.findByRole('button', { name: /start ny registrering/i }).should('not.exist');
    });
    */
});
