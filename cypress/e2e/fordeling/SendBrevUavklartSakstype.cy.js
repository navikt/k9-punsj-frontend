import journalpost from '../../fixtures/jpUavklartSakstype315.json';

const journalpostId = journalpost.journalpostId;

describe('Send brev for handled journalpost med uavklart sakstype', () => {
    it('viser warning og krever valgt ytelsestype før brev kan sendes', () => {
        cy.visit(`/journalpost/${journalpostId}`);

        cy.findByText(/Ytelsestypen på journalposten er ikke avklart/i).should('exist');
        cy.get('[data-test-id="sendBrevLenkeBtn"]').should('be.disabled');

        cy.contains('Pleiepenger').click();

        cy.get('[data-test-id="sendBrevLenkeBtn"]').should('not.be.disabled').click();
        cy.location('pathname').should('include', '/brev-behandlet-journalpost/');
        cy.findByLabelText('Velg mal').should('exist');
    });

    it('viser guard på brev-route uten valgt ytelsestype', () => {
        cy.visit(`/journalpost/${journalpostId}/brev-behandlet-journalpost/`);

        cy.findByText(/Journalposten mangler avklart ytelsestype/i).should('exist');
        cy.findByLabelText('Velg mal').should('not.exist');
        cy.findByRole('button', { name: /Tilbake/i }).should('exist');
    });
});
