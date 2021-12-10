import initialState from '../../state/PleiepengerPunsjInitialState';

describe('Håndtering av inntektsmelding uten krav', () => {
    it('skal vise radioknapper basert på innsendingstype', () => {
        cy.visit('/journalpost/001115578', {
            onBeforeLoad: (window) => {
                window.__initialState__ = initialState;
            },
        });
        cy.findByText('Feilregistrer journalpost').should('exist');
        cy.findByText('Opprett journalføringsoppgave i Gosys').should('exist');
        cy.findByText('Sett på vent').should('exist');
    });
});
