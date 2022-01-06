import initialState from '../../state/PleiepengerPunsjInitialState';

describe('Håndtering av inntektsmelding uten krav', () => {
    it('skal vise radioknapper basert på innsendingstype', () => {
        cy.visit('/journalpost/202', {
            onBeforeLoad: (window) => {
                window.__initialState__ = initialState;
            },
        });
        cy.findByText('Stemmer det at søkers fødselsnummer er 29099000129?').should('exist');
        cy.findByText('Ja').should('exist').click();
        cy.findByText('Ferdigstill journalpost').should('exist');
        cy.findByText('Opprett journalføringsoppgave i Gosys').should('exist');
        cy.findByText('Sett på vent').should('exist');
    });

    it('skal vise mulighet for å sende brev', () => {
        cy.findByText('Send brev til arbeidsgiver eller søker').should('exist').click();
        cy.findByLabelText('Mal').should('exist').select('Innhent dokumentasjon');
        cy.findByLabelText('Mottaker').should('exist');
        cy.findByLabelText('Fritekst').should('exist');
        cy.findByLabelText('Tittel').should('not.exist');
        cy.findByLabelText('Mal').should('exist').select('Fritekst generelt brev');
        cy.findByLabelText('Tittel').should('exist');
    });

    it('skal vise infoboks dersom brev er fylt ut men ikke sendt', () => {
        cy.findByLabelText('Fritekst').type('test');
        cy.findByText('Sett på vent').click();
        cy.findByRole('button', { name: /Sett på vent/i })
            .should('exist')
            .click();
        cy.findByText(
            'Det er et påbegynt brev som ikke er sendt. Hvis du fortsetter, vil brevet bli slettet. Avbryt for å gå tilbake å sende brevet.'
        ).should('exist');
    });
});
