import { getFagsakNavnForSelect } from '../../utils/utils';
import journalpost from '../../fixtures/jpOMPUT305.json';
import fagsaker from '../../fixtures/fagsaker.json';

const dokumenttype = 'Omsorgspenger';
const valgteDokumentType = 'Korrigering av inntektsmelding omsorgspenger AG';
const journalpostId = journalpost.journalpostId;
const norskIdent = journalpost.norskIdent;
const fagsak = fagsaker[1];
const fagsakReservert = fagsaker[9];

describe(`Fordeling ${dokumenttype}`, { testIsolation: false, viewportWidth: 1280, viewportHeight: 1450 }, () => {
    it(`Åpne journalpost ${journalpostId} fra LOS`, () => {
        cy.visit(`/journalpost/${journalpostId}`);
        cy.findByText(/Skjul/i).should('exist').click();
        cy.findByText(valgteDokumentType).should('exist').click();
    });

    it('Journalpost pannel med riktig data', () => {
        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Journalpostnummer/i).should('exist');
            cy.findByText(journalpostId).should('exist');
            cy.findByText(/Søkers ID/i).should('exist');
            cy.findByText(norskIdent).should('exist');
            cy.findByText(/Sakstype/i).should('exist');
            cy.findByText(dokumenttype).should('exist');
        });
    });

    it('Viser dokumentvalg', () => {
        cy.contains(/Dette gjelder:?/i).should('exist');
        cy.contains('Pleiepenger').should('exist');
        cy.contains('Omsorgspenger/omsorgsdager').should('exist');
        cy.contains('Pleiepenger i livets sluttfase').should('exist');
        cy.contains('Annet').should('exist');
    });

    it('Test ytelse har checkboks for 2 søkere', () => {
        cy.get('[data-test-id="toSokereCheckbox"]').should('exist');
    });

    it('Test journalfør buttons disabled ved start', () => {
        cy.get('[data-test-id="journalførOgFortsett"]').should('be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('be.disabled');
    });

    it('Test bekreft søker og velg fagsak', () => {
        cy.findByText(/Ja/i).should('exist').click();

        cy.findByLabelText('Velg fagsak')
            .should('exist')
            .select(
                getFagsakNavnForSelect(
                    fagsak.fagsakId,
                    dokumenttype,
                    fagsak.reservert,
                    fagsak.behandlingsår,
                    fagsak.historisk,
                ),
            )
            .should('have.value', fagsak.fagsakId);
        cy.get('.fagsakSelectedInfo').within(() => {
            cy.findByText(`Behandlings år: ${fagsak.behandlingsår}`).should('exist');
            cy.findByText('Se fagsak i K9').should('exist');
            cy.get('a').invoke('attr', 'href').should('contain', fagsak.fagsakId);
        });
        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Saksnummer/i).should('exist');
            cy.findByText(fagsak.fagsakId).should('exist');
        });

        cy.get('[data-test-id="journalførOgFortsett"]').should('not.be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('not.be.disabled');
    });

    it('Test velg reservert fagsak', () => {
        cy.findByLabelText('Velg fagsak')
            .should('exist')
            .select(
                getFagsakNavnForSelect(
                    fagsakReservert.fagsakId,
                    dokumenttype,
                    fagsakReservert.reservert,
                    fagsakReservert.behandlingsår,
                    fagsakReservert.historisk,
                ),
            )
            .should('have.value', fagsakReservert.fagsakId);
        cy.get('.fagsakSelectedInfo').within(() => {
            cy.findByText(`Behandlings år: ${fagsakReservert.behandlingsår}`).should('exist');
            cy.findByText('Se fagsak i K9').should('not.exist');
        });
        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Saksnummer/i).should('exist');
            cy.findByText(fagsakReservert.fagsakId).should('exist');
        });

        cy.get('[data-test-id="journalførOgFortsett"]').should('not.be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('not.be.disabled');
    });
});
