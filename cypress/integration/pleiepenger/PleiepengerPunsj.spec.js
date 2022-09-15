import initialState from '../../state/PleiepengerPunsjInitialState';

describe('Pleiepenger punsj', () => {
    beforeEach(() => {
        cy.visit('/journalpost/200#/pleiepenger/skjema/0416e1a2-8d80-48b1-a56e-ab4f4b4821fe', {
            onBeforeLoad: (window) => {
                window.__initialState__ = initialState;
            },
        });
    });
    it('kan sende inn søknad om pleiepenger', () => {
        cy.soknadperioderInput('08.11.2021', '11.11.2021');

        cy.sendInnSoknad();

        cy.findByText(
            'Opplysningene er sendt til behandling. Vær oppmerksom på at det kan ta litt tid før opplysningene er synlige på behandlingen i K9-sak.'
        ).should('exist');
        cy.findByText('Oppsummering').should('exist');
        cy.findByRole('button', { name: /tilbake til los/i }).should('exist');
    });

    it.skip('kan fylle inn lengre periode i arbeidstid', () => {
        cy.soknadperioderInput('08.11.2021', '11.11.2021');

        cy.findByRole('button', { name: /Arbeidsforhold og arbeidstid i søknadsperioden/i }).click();
        cy.findByText(/Arbeidstaker/i).click();
        cy.findByRole('button', { name: /Registrer arbeidstid for en lengre periode/i }).click();
        cy.findByRole('button', { name: /Legg til periode/i }).click();

        cy.get('.ReactModalPortal').within(() => {
            cy.findByLabelText(/Fra og med/i)
                .should('exist')
                .type('08.11.2021');
            cy.findByLabelText(/Til og med/i)
                .should('exist')
                .type('11.11.2021');
            cy.findAllByLabelText('minutter')[0].type('30');
        });
    });

    // sjekke at journalpostnummer fra flere saker vises
    // sjekk av validering og feilmeldinger på alle felter
    // sjekk at man ikke får sende inn dersom man har valideringsfeil
    // sjekk at alle input-felter fungerer og oppdaterer state?
    // sjekke at eksisterende søknadsperioder vises?
});
