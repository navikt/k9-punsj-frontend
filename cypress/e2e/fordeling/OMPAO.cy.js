import { getFagsakNavnForSelect } from '../../utils/utils';
import journalpost from '../../fixtures/jpOMPAO303.json';
import fagsaker from '../../fixtures/fagsaker.json';

const dokumenttype = 'Alene om omsorgen';
const valgteDokumentType = 'Ekstra omsorgsdager når du er alene om omsorgen';
const valgteDokumentTypeKode = 'OMSORGSPENGER_AO';
const journalpostId = journalpost.journalpostId;
const norskIdent = journalpost.norskIdent;
const fagsakUtenBarn = fagsaker[14];
const fagsakMedBarn = fagsaker[15];
const fagsakMedBarnReservert = fagsaker[16];
const fagsakUtenBarnReservert = fagsaker[17];

describe(`Fordeling ${dokumenttype}`, { testIsolation: false, viewportWidth: 1280, viewportHeight: 1450 }, () => {
    it(`Åpne journalpost ${journalpostId} fra LOS`, () => {
        cy.visit(`/journalpost/${journalpostId}`);
    });

    it('Skjul dokument vindu', () => {
        cy.findByText(/Skjul/i).should('exist').click();
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

    it('Test checked riktig dokumenttype', () => {
        cy.contains(valgteDokumentType).should('exist');
        cy.get(`input[value="${valgteDokumentTypeKode}"]`).should('exist').should('be.checked');
    });

    it('Test ytelse har checkboks for 2 søkere', () => {
        cy.get('[data-test-id="toSokereCheckbox"]').should('exist');
    });

    it('Test journalfør buttons disabled ved start', () => {
        cy.get('[data-test-id="journalførOgFortsett"]').should('be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('be.disabled');
    });

    it('Test bekreft søker og velg fagsak uten barn', () => {
        cy.findByText(/Ja/i).should('exist').click();

        cy.findByLabelText('Velg fagsak')
            .should('exist')
            .select(getFagsakNavnForSelect(fagsakUtenBarn.fagsakId, dokumenttype))
            .should('have.value', fagsakUtenBarn.fagsakId);
        cy.get('.fagsakSelectedInfo').within(() => {
            cy.findByText('Barn:').should('exist');
            cy.findByText('ikke satt').should('exist');
            cy.findByText('Se fagsak i K9').should('exist');
            cy.get('a').invoke('attr', 'href').should('contain', fagsakUtenBarn.fagsakId);
        });
        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Saksnummer/i).should('exist');
            cy.findByText(fagsakUtenBarn.fagsakId).should('exist');
            cy.findByText(/Barnets ID/i).should('not.exist');
        });

        cy.get('[data-test-id="journalførOgFortsett"]').should('be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('not.be.disabled');
    });

    it('Test velg fagsak med barn', () => {
        cy.contains('Velg fagsak').should('exist');

        cy.findByLabelText('Velg fagsak')
            .select(getFagsakNavnForSelect(fagsakMedBarn.fagsakId, dokumenttype))
            .should('have.value', fagsakMedBarn.fagsakId);
        cy.get('.fagsakSelectedInfo').within(() => {
            cy.findByText('Barn:').should('exist');
            cy.findByText(`Navn: ${fagsakMedBarn.pleietrengende.navn}`).should('exist');
            cy.findByText(`Id: ${fagsakMedBarn.pleietrengende.identitetsnummer}`).should('exist');
            cy.findByText('Se fagsak i K9').should('exist');
            cy.get('a').invoke('attr', 'href').should('contain', fagsakMedBarn.fagsakId);
        });
        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Saksnummer/i).should('exist');
            cy.findByText(fagsakMedBarn.fagsakId).should('exist');
            cy.findByText(/Barnets ID/i).should('exist');
            cy.findByText(fagsakMedBarn.pleietrengende.identitetsnummer).should('exist');
        });

        cy.get('[data-test-id="journalførOgFortsett"]').should('not.be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('not.be.disabled');
    });

    it('Test velg reservert fagsak med barn', () => {
        cy.contains('Velg fagsak').should('exist');

        cy.findByLabelText('Velg fagsak')
            .select(getFagsakNavnForSelect(fagsakMedBarnReservert.fagsakId, dokumenttype, true))
            .should('have.value', fagsakMedBarnReservert.fagsakId);
        cy.get('.fagsakSelectedInfo').within(() => {
            cy.findByText('Barn:').should('exist');
            cy.findByText(`Navn: ${fagsakMedBarn.pleietrengende.navn}`).should('exist');
            cy.findByText(`Id: ${fagsakMedBarnReservert.pleietrengende.identitetsnummer}`).should('exist');
            cy.findByText('Se fagsak i K9').should('not.exist');
        });
        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Saksnummer/i).should('exist');
            cy.findByText(fagsakMedBarnReservert.fagsakId).should('exist');
            cy.findByText(/Barnets ID/i).should('exist');
            cy.findByText(fagsakMedBarnReservert.pleietrengende.identitetsnummer).should('exist');
        });

        cy.get('[data-test-id="journalførOgFortsett"]').should('not.be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('not.be.disabled');
    });

    it('Test velg reservert fagsak uten barn', () => {
        cy.contains('Velg fagsak').should('exist');

        cy.findByLabelText('Velg fagsak')
            .select(getFagsakNavnForSelect(fagsakUtenBarnReservert.fagsakId, dokumenttype, true))
            .should('have.value', fagsakUtenBarnReservert.fagsakId);
        cy.get('.fagsakSelectedInfo').within(() => {
            cy.findByText('Barn:').should('exist');
            cy.findByText('ikke satt').should('exist');
            cy.findByText('Se fagsak i K9').should('not.exist');
        });
        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Saksnummer/i).should('exist');
            cy.findByText(fagsakUtenBarnReservert.fagsakId).should('exist');
            cy.findByText(/Barnets ID/i).should('not.exist');
        });

        cy.get('[data-test-id="journalførOgFortsett"]').should('be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('not.be.disabled');
    });

});
