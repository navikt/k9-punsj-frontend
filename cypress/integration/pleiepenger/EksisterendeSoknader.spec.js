import { setIdentFellesAction } from 'app/state/actions/IdentActions';
import initialState from './initialState';

describe('Eksisterende søknader pleiepenger', () => {
    beforeEach(() => {
        cy.intercept(
            {
                method: 'GET',
                url: '/api/k9-punsj/journalpost/200',
            },
            { fixture: 'journalpost.json' }
        );

        cy.intercept(
            {
                method: 'POST',
                url: '/api/k9-punsj/journalpost/hent',
            },
            JSON.stringify({ poster: [] })
        );
        cy.intercept(
            {
                method: 'GET',
                url: '/api/k9-punsj/pleiepenger-sykt-barn-soknad/mappe',
            },
            JSON.stringify({
                søker: '29099000129',
                fagsakTypeKode: 'PSB',
                søknader: [],
            })
        );
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
            cy.findByText(/Barnets fødselsnummer/i).should('exist');

            cy.findByText(/200/i).should('exist');
            cy.findByText(/29099000129/i).should('exist');
            cy.findByText(/13079438906/i).should('exist');
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
        cy.intercept(
            {
                method: 'POST',
                url: '/api/k9-punsj/pleiepenger-sykt-barn-soknad',
            },
            { statusCode: 201, fixture: 'pleiepengerSoknad.json' }
        );
        cy.intercept(
            {
                method: 'POST',
                url: '/api/k9-punsj/pleiepenger-sykt-barn-soknad/k9sak/info',
            },
            { statusCode: 200, body: [] }
        );
        cy.intercept(
            {
                method: 'GET',
                url: '/api/k9-punsj/pleiepenger-sykt-barn-soknad/mappe/0416e1a2-8d80-48b1-a56e-ab4f4b4821fe',
            },
            { statusCode: 200, fixture: 'pleiepengerSoknad.json' }
        );

        cy.findByRole('button', { name: /start ny registrering/i }).click();
    });
});
