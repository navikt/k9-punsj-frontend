beforeEach(() => {
    cy.log('i ran');
    cy.intercept(
        {
            method: 'GET',
            url: '/me',
        },
        JSON.stringify({ name: 'Bobby Binders' })
    );
    cy.intercept(
        {
            method: 'GET',
            url: '/api/k9-punsj/journalpost/200',
        },
        { fixture: 'journalpost.json' }
    );

    cy.visit('/');

    const input = cy.findByLabelText(/journalpost-id/i).should('exist');
    input.type('200');
    cy.findByRole('button', { name: /søk/i }).click();
});
