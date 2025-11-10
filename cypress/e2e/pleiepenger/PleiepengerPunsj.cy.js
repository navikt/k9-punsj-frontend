import initialState from '../../state/PleiepengerPunsjInitialState';

describe('Pleiepenger punsj', () => {
    beforeEach(() => {
        cy.visit('/journalpost/200/pleiepenger-sykt-barn/skjema/0416e1a2-8d80-48b1-a56e-ab4f4b4821fe', {
            onBeforeLoad: (window) => {
                window.__initialState__ = initialState;
            },
        });
        Cypress.config('viewportWidth', 1280);
        Cypress.config('viewportHeight', 1450);
    });

    it('kan sende inn søknad om pleiepenger', () => {
        // cy.soknadperioderInput('08.11.2021', '11.11.2021');

        cy.sendInnSoknad();

        cy.findByText(
            'Opplysningene er sendt til behandling. Vær oppmerksom på at det kan ta litt tid før opplysningene er synlige på behandlingen i K9-sak.',
        ).should('exist');
        cy.findByText('Oppsummering').should('exist');
        cy.findByRole('button', { name: /tilbake til los/i }).should('exist');
    });

    it('kan fylle inn lengre perioder i arbeidstid', () => {
        cy.get('.soknadsperiodecontainer').within(() => {
            // Vent på at første periode (eq(0)) har fått initialverdiene
            cy.findAllByLabelText(/Fra og med/i)
                .eq(0)
                .should('have.value', '08.11.2021');

            cy.findAllByLabelText(/Til og med/i)
                .eq(0)
                .should('have.value', '11.11.2021');

            cy.findByRole('button', { name: /Legg til ny periode/i })
                .should('be.visible')
                .click();

            cy.findAllByLabelText(/Fra og med/i)
                .eq(1)
                .should('be.visible')
                .should('not.be.disabled');

            cy.findAllByLabelText(/Fra og med/i)
                .eq(1)
                .type('20.11.2021');

            cy.findAllByLabelText(/Til og med/i)
                .eq(1)
                .should('be.visible')
                .should('not.be.disabled');

            cy.findAllByLabelText(/Til og med/i)
                .eq(1)
                .type('25.11.2021');
        });

        cy.findByRole('button', { name: /Arbeidsforhold og arbeidstid i søknadsperioden/i }).click();
        cy.findByText(/Arbeidstaker/i).click();
        cy.findByRole('button', { name: /Registrer arbeidstid for en lengre periode/i }).click();

        cy.get('[data-test-id="arbeidstid-periode-liste"]').within(() => {
            cy.findByLabelText(/Fra og med/i)
                .should('be.visible')
                .type('08.11.2021');
            cy.findByLabelText(/Til og med/i)
                .should('be.visible')
                .type('11.11.2021');

            cy.findByRole('button', { name: /Legg til periode/i }).click();

            cy.findAllByLabelText(/Fra og med/i)
                .eq(1)
                .should('be.visible')
                .type('20.11.2021');
            cy.findAllByLabelText(/Til og med/i)
                .eq(1)
                .should('be.visible')
                .type('25.11.2021');
            cy.findAllByLabelText('Timer').eq(0).clear({ force: true }).type(7, { force: true });
            cy.findAllByLabelText('Timer').eq(1).clear({ force: true }).type(2, { force: true });
            cy.findAllByLabelText('Timer').eq(2).clear({ force: true }).type(7, { force: true });

            cy.findByRole('button', { name: /Lagre/i }).click();
        });

        // Vent på at lagring er ferdig og at "vis mer" knappen er klar
        cy.findByRole('button', { name: /vis mer/i })
            .should('be.visible')
            .should('not.be.disabled')
            .click();

        // Vent på at teksten "10 dager registrert" blir synlig (økt timeout for CI)
        cy.contains(/10 dager registrert/i, { timeout: 10000 }).should('be.visible');
    });

    it('kan bytte bytte mellom timer og minutter og desimaler i arbeidstid', () => {
        cy.findByRole('button', { name: /Arbeidsforhold og arbeidstid i søknadsperioden/i }).click();
        cy.findByText(/Arbeidstaker/i).click();
        cy.findByRole('button', { name: /Registrer arbeidstid for en lengre periode/i }).click();

        // cy.findByLabelText(/Velg hele søknadsperioden/i).click();

        cy.get('[data-test-id="arbeidstid-periode-liste"]').within(() => {
            cy.findByLabelText(/Fra og med/i).type('08.11.2021');
            cy.findByLabelText(/Til og med/i).type('11.11.2021');

            cy.findAllByLabelText('Timer').eq(0).clear({ force: true }).type(7, { force: true });
            cy.findAllByLabelText('Minutter').eq(0).clear({ force: true }).type(30, { force: true });
            cy.findAllByLabelText('Timer').eq(1).clear({ force: true }).type(2, { force: true });
            cy.findByRole('radio', { name: /Desimaltall/i }).click();
            cy.findByLabelText('Normal arbeidstid').should('have.value', '7.5');
            cy.findByLabelText('Faktisk arbeidstid').should('have.value', '2');
            cy.findByLabelText('Normal arbeidstid').clear({ force: true }).type(5.75, { force: true });
            cy.findByLabelText('Faktisk arbeidstid').clear({ force: true }).type(4, { force: true });
            cy.findByRole('radio', { name: /Timer og minutter/i }).click();
            cy.findAllByLabelText('Timer').eq(0).should('have.value', '5');
            cy.findAllByLabelText('Minutter').eq(0).should('have.value', '45');
            cy.findAllByLabelText('Timer').eq(1).should('have.value', '4');
            cy.findByRole('button', { name: /Lagre/i }).click();
        });
        cy.findByRole('button', { name: /vis mer/i }).click();
        cy.findByText(/4 dager registrert/i).should('exist');
    });
});
