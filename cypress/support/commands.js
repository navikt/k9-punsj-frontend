// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
import '@testing-library/cypress/add-commands';
import 'cypress-wait-until';

Cypress.Commands.add('soekPaaJournalpost', (journalpostId = '200') => {
    const input = cy.findByLabelText(/journalpost-id/i).should('exist');
    input.type(journalpostId);
    cy.findByRole('button', { name: /søk/i }).click();
});

Cypress.Commands.add('soknadperioderInput', () => {
    cy.get('.soknadsperiodecontainer').within(() => {
        cy.findByLabelText(/Fra og med/i)
            .should('exist')
            .type('08.11.2021');
        cy.findByLabelText(/Til og med/i)
            .should('exist')
            .type('11.11.2021');
    });
});

Cypress.Commands.add('sendInnSoknad', () => {
    cy.findByRole('button', { name: /send inn/i })
        .should('exist')
        .click();

    cy.findByRole('button', { name: /videre/i })
        .should('exist')
        .click();

    cy.get('.navds-modal').within(() => {
        cy.findByRole('button', { name: /send inn/i })
            .should('exist')
            .click();
    });
});
