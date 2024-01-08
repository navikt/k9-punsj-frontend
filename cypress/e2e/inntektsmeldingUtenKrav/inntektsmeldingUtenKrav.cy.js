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
        cy.findByText('Send brev til arbeidsgiver eller søker').should('exist').click();
        cy.findByLabelText('Velg mal').should('exist').select('Innhent dokumentasjon');
        cy.findByLabelText('Velg mottaker').should('exist');
        cy.findByLabelText('Innhold i brev').should('exist');
        cy.findByLabelText('Tittel').should('not.exist');
        cy.findByLabelText('Velg mal').should('exist').select('Fritekst generelt brev');
        cy.findByLabelText('Tittel').should('exist');
    });

    it('skal vise modal etter knappen send er trykk på', () => {
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
        cy.findByText('Send brev til arbeidsgiver eller søker').should('exist').click();
        cy.findByLabelText('Velg mal').should('exist').select('Innhent dokumentasjon');
        cy.findByLabelText('Velg mottaker').should('exist');
        cy.findByLabelText('Send til tredjepart').should('exist');
        cy.findByLabelText('Innhold i brev').should('exist');
        cy.findByLabelText('Tittel').should('not.exist');
        cy.findByLabelText('Velg mal').should('exist').select('Fritekst generelt brev');
        cy.findByLabelText('Tittel').should('exist');
        cy.findByLabelText('Velg mottaker').should('exist').select('TUNGSINDIG KAKE - 18128103429');
        cy.findByLabelText('Send til tredjepart').should('exist');
        cy.findByLabelText('Tittel').should('exist').type('Tittel');
        cy.findByLabelText('Innhold i brev').should('exist').type('Fritekst her');

        cy.findByText('Send brev').should('exist').click();
        cy.findByText('Er du sikker på at du vil sende brevet?').should('exist');

        cy.findByText('Avbryt').should('exist').click();
    });

    it('skal vise infoboks dersom brev er fylt ut men ikke sendt', () => {
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
        cy.findByText('Send brev til arbeidsgiver eller søker').should('exist').click();
        cy.findByLabelText('Velg mal').should('exist').select('Innhent dokumentasjon');
        cy.findByLabelText('Velg mottaker').should('exist');
        cy.findByLabelText('Send til tredjepart').should('exist');
        cy.findByLabelText('Innhold i brev').should('exist');
        cy.findByLabelText('Tittel').should('not.exist');
        cy.findByLabelText('Velg mal').should('exist').select('Fritekst generelt brev');
        cy.findByLabelText('Tittel').should('exist');
        cy.findByLabelText('Velg mottaker').should('exist').select('TUNGSINDIG KAKE - 18128103429');
        cy.findByLabelText('Tittel').should('exist').type('Tittel');
        cy.findByLabelText('Innhold i brev').should('exist').type('Fritekst her');
        cy.findByText('Send brev').should('exist').click();
        cy.findByText('Er du sikker på at du vil sende brevet?').should('exist');

        cy.findByText('Avbryt').should('exist').click();
        cy.findByLabelText('Innhold i brev').type('test');
        cy.findByText('Sett på vent').click();
        cy.findByRole('button', { name: /Sett på vent/i })
            .should('exist')
            .click();
        cy.findByText(
            'Det er et påbegynt brev som ikke er sendt. Hvis du fortsetter, vil brevet bli slettet. Avbryt for å gå tilbake og sende brevet.',
        ).should('exist');
    });
});
