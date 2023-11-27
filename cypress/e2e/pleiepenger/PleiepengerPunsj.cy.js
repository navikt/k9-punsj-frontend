import initialState from '../../state/PleiepengerPunsjInitialState';

describe('Pleiepenger punsj', () => {
    beforeEach(() => {
        cy.visit('/journalpost/200/pleiepenger-sykt-barn/skjema/0416e1a2-8d80-48b1-a56e-ab4f4b4821fe', {
            onBeforeLoad: (window) => {
                window.__initialState__ = initialState;
            },
        });
    });
    it('kan sende inn søknad om pleiepenger', () => {
        cy.soknadperioderInput('08.11.2021', '11.11.2021');

        cy.sendInnSoknad();

        cy.findByText(
            'Opplysningene er sendt til behandling. Vær oppmerksom på at det kan ta litt tid før opplysningene er synlige på behandlingen i K9-sak.',
        ).should('exist');
        cy.findByText('Oppsummering').should('exist');
        cy.findByRole('button', { name: /tilbake til los/i }).should('exist');
    });

    it('kan fylle inn lengre perioder i arbeidstid', () => {
        cy.get('.soknadsperiodecontainer').within(() => {
            cy.findByLabelText(/Fra og med/i)
                .should('exist')
                .type('08.11.2021');
            cy.findByLabelText(/Til og med/i)
                .should('exist')
                .type('11.11.2021');
            cy.findByRole('button', { name: /Legg til ny periode/i }).click();
            cy.findAllByLabelText(/Fra og med/i)
                .eq(1)
                .should('exist')
                .type('20.11.2021');
            cy.findAllByLabelText(/Til og med/i)
                .eq(1)
                .should('exist')
                .type('25.11.2021');
        });

        cy.findByRole('button', { name: /Arbeidsforhold og arbeidstid i søknadsperioden/i }).click();
        cy.findByText(/Arbeidstaker/i).click();
        cy.findByRole('button', { name: /Registrer arbeidstid for en lengre periode/i }).click();

        cy.get('.navds-modal').within(() => {
            cy.findAllByLabelText('Timer').eq(0).clear({ force: true }).type(7, { force: true });
            cy.findAllByLabelText('Timer').eq(1).clear({ force: true }).type(2, { force: true });
            cy.findAllByLabelText('Timer').eq(3).clear({ force: true }).type(7, { force: true });
            cy.findByRole('button', { name: /Lagre/i }).click();
        });
        cy.findByRole('button', { name: /vis mer/i }).click();
        cy.findByText(/10 dager registrert/i).should('exist');
    });

    // sjekke at journalpostnummer fra flere saker vises
    // sjekk av validering og feilmeldinger på alle felter
    // sjekk at man ikke får sende inn dersom man har valideringsfeil
    // sjekk at alle input-felter fungerer og oppdaterer state?
    // sjekke at eksisterende søknadsperioder vises?
});
