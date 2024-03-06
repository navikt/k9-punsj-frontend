/* import handlers from 'mocks/omsorgspengerMidlertidigAleneHandlers';

import { initialState } from '../../state/omsorgspenger-midlertidig-alene/eksisterendeSoeknaderInitialState';

describe('Eksisterende søknader midlertidig alene', () => {
    beforeEach(() => {
        cy.visit('/journalpost/205/omsorgspenger-midlertidig-alene/soknader/', {
            onBeforeLoad: (window) => {
                window.__initialState__ = initialState;
            },
        });
        cy.window().then((window) => {
            const { worker } = window.msw;
            worker.use(handlers.tomMappe);
        });
    });
    it('viser informasjon om journalpost og søker', () => {
        cy.window().then((window) => {
            const { worker } = window.msw;
        });

        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Søkers ID/i).should('exist');
            cy.findByText(/Pleietrengendes ID/i).should('not.exist');

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
            worker.use(handlers.mappeMedSøknad);
            worker.use(handlers.soknad);
        });
        cy.get('.punch_mappetabell').within(() => {
            cy.waitUntil(() => cy.contains(/Mottakelsesdato/i));
            cy.findByText(/JournalpostID/i).should('exist');
            cy.findByText(/12.10.2020/i).should('exist');
            cy.findByText(/205/i).should('exist');
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
                'http://localhost:8080/journalpost/205/omsorgspenger-midlertidig-alene/skjema/db054295-f1bd-45d2-b0fe-0d032ce25295/',
            );
        });
    });

    it('kan gå tilbake til fordeling', () => {
        cy.contains(
            'Det finnes ingen påbegynte registreringer knyttet til søkeren. Klikk på knappen under for å opprette en ny.',
        );
        cy.findByRole('button', { name: /tilbake/i }).click();
        cy.url().should('eq', 'http://localhost:8080/journalpost/205');
    });

    it('kan starte ny registrering av midlertidig alene skjema', () => {
        cy.window().then((window) => {
            const { worker } = window.msw;
            worker.use(handlers.nySoeknad);
            worker.use(handlers.soknad);
        });
        cy.contains(
            'Det finnes ingen påbegynte registreringer knyttet til søkeren. Klikk på knappen under for å opprette en ny.',
        );
        cy.contains(/start ny registrering/i);
        cy.findByRole('button', { name: /start ny registrering/i }).click();

        cy.url().should(
            'eq',
            'http://localhost:8080/journalpost/205/omsorgspenger-midlertidig-alene/skjema/db054295-f1bd-45d2-b0fe-0d032ce25295/',
        );
    });

    it('kan sende inn ny registrering av midlertidig alene skjema', () => {
        cy.window().then((window) => {
            const { worker } = window.msw;
            worker.use(handlers.nySoeknad);
            worker.use(handlers.soknad);
            worker.use(handlers.oppdater);
            worker.use(handlers.valider);
            worker.use(handlers.sendInn);
        });
        cy.contains(
            'Det finnes ingen påbegynte registreringer knyttet til søkeren. Klikk på knappen under for å opprette en ny.',
        );
        cy.contains(/start ny registrering/i);
        cy.findByRole('button', { name: /start ny registrering/i }).click();

        cy.findByText('Ikke relevant').click();
        cy.findByText('Dokumentet inneholder medisinske opplysninger').click();
        cy.findByRole('button', { name: 'Send inn' }).click();
        cy.contains('Situasjonstype er et påkrevd felt.');
        cy.contains('Situasjonsbeskrivelse er et påkrevd felt.');
        cy.contains('Fra og med er et påkrevd felt.');
        cy.contains('Til og med er et påkrevd felt.');

        cy.findByLabelText('Hva er situasjonen til den andre forelderen?').select('Fengsel');

        cy.findByLabelText('Beskrivelse av situasjonen').type('Dette er en beskrivelse av situasjonen');

        cy.findByLabelText('Fra og med').type('01.01.2020');
        cy.findByLabelText('Til og med').type('10.10.2020');

        cy.findByRole('button', { name: 'Send inn' }).click();
        cy.findByRole('button', { name: 'Videre' }).click();
        cy.get('.navds-modal').within(() => {
            cy.findByRole('button', { name: 'Send inn' }).click();
        });

        cy.contains('Tilbake til LOS').scrollIntoView().should('be.visible');
    });

    it('kan ikke start ny registrering når søknad allerede finnes for journalpost', () => {
        cy.window().then((window) => {
            const { worker, rest } = window.msw;
            worker.use(handlers.mappeMedSøknad);
            worker.use(handlers.nySoeknad);
        });
        cy.contains(/Mottakelsesdato/i);

        cy.findByRole('button', { name: /start ny registrering/i }).should('not.exist');
    });
    */
// });
