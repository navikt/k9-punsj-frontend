import initialState from '../../state/EksisterendeSoknaderInitialState';

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
            cy.findByText(/Barnets fødselsnummer/i).should('exist');

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
        cy.findByRole('button', { name: /start ny registrering/i }).click();
    });

    //
});
