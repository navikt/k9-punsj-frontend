/* import initialState from '../../state/PleiepengerPunsjInitialState';

describe('Korrigering av inntektsmelding punsj', () => {
    beforeEach(() => {
        cy.visit('/journalpost/200/korrigering-av-inntektsmelding', {
            onBeforeLoad: (window) => {
                window.__initialState__ = initialState;
            },
        });
    });
    it('kan sende inn korrigering av inntektsmelding', () => {
        cy.findByLabelText(/Dato/i).should('exist').type('08.11.2021');
        cy.findByLabelText(/Tidspunkt/i)
            .should('exist')
            .type('15:00');
        cy.findByLabelText(/Årstallet korrigeringen gjelder for/i)
            .should('exist')
            .type('2021');
        cy.findByLabelText(/Velg virksomhet/i)
            .should('exist')
            .select('979312059');
        const trekkDagerEllerPerioder = cy.findByText(/Trekk dager eller perioder med fravær/i).parent();
        trekkDagerEllerPerioder.should('exist').click({ force: true });
        cy.findByLabelText(/Fra og med/i)
            .should('exist')
            .type('01112021');
        cy.findByLabelText(/Til og med/i)
            .should('exist')
            .type('02112021')
            .blur();

        cy.sendInnSoknad();

        cy.findByText(
            'Opplysningene er sendt til behandling. Vær oppmerksom på at det kan ta litt tid før opplysningene er synlige på behandlingen i K9-sak.',
        ).should('exist');
        cy.findByText('Oppsummering').should('exist');
        cy.findByRole('button', { name: /tilbake til los/i }).should('exist');
    });

    it('skal vise feilmelding dersom du sender inn uten å ha lagt inn trekk eller krav', () => {
        cy.findByLabelText(/Dato/i).should('exist').type('08.11.2021');
        cy.findByLabelText(/Tidspunkt/i)
            .should('exist')
            .type('15:00');
        cy.findByLabelText(/Årstallet korrigeringen gjelder for/i)
            .should('exist')
            .type('2021');
        cy.findByLabelText(/Velg virksomhet/i)
            .should('exist')
            .select('979312059');
        cy.findByRole('button', { name: /send inn/i })
            .should('exist')
            .click({ force: true });
        cy.findByText('Må ha fravær fra enten søker eller fra fraværskorrigering av inntektsmelding').should('exist');
    });
});
*/
