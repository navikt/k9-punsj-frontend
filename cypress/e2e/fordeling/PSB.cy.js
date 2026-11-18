import { getFagsakNavnForSelect, getBarnInfoForSelect } from '../../utils/utils';
import journalpost from '../../fixtures/jpPSB300.json';
import fagsaker from '../../fixtures/fagsaker.json';
import barnFraApi from '../../fixtures/barn.json';

const dokumenttype = 'Pleiepenger sykt barn';
const journalpostId = journalpost.journalpostId;
const barn1FraApi = barnFraApi.barn[0];
const barn3FraApi = barnFraApi.barn[2];
const fnrBarnIkkeFraList = '53488838241';
const fagsakUtenBarn = fagsaker[0];
const fagsakMedBarn = fagsaker[2];
const fagsakMedBarnReservert = fagsaker[3];
const fagsakUtenBarnReservert = fagsaker[4];

describe(`Fordeling ${dokumenttype}`, { testIsolation: false, viewportWidth: 1280, viewportHeight: 1450 }, () => {
    it(`Åpne journalpost ${journalpostId} fra LOS`, () => {
        cy.visit(`/journalpost/${journalpostId}`);
    });

    it('Skjul dokument vindu', () => {
        cy.findByText(/Skjul/i).should('exist').click();
    });

    it('Viser dokumentvalg', () => {
        cy.contains(/Dette gjelder:?/i).should('exist');
        cy.contains('Pleiepenger').should('exist');
        cy.contains('Omsorgspenger/omsorgsdager').should('exist');
        cy.contains('Pleiepenger i livets sluttfase').should('exist');
        cy.contains('Annet').should('exist');
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
            cy.findByText(`Barn:`).should('exist');
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
            cy.findByText(`Navn: ${fagsakMedBarnReservert.pleietrengende.navn}`).should('exist');
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

    it('Test Reserver saksnummer til ny fagsak', () => {
        cy.findByLabelText('Reserver saksnummer til ny fagsak').check();

        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Saksnummer/i).should('not.exist');
            cy.findByText(fagsakUtenBarn.fagsakId).should('not.exist');
        });

        cy.get('[data-test-id="journalførOgFortsett"]').should('be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('be.disabled');
    });

    it('Test velg barn fra liste som finnes i en fagsak - PSB_TILLAT_BARN_MED_FAGSAK_VIDERE = true', () => {
        cy.window().then((window) => {
            window.appSettings = {
                ...window.appSettings,
                PSB_TILLAT_BARN_MED_FAGSAK_VIDERE: 'true'
            };
        });
        
        cy.findByLabelText('Velg hvilket barn det gjelder')
            .select(getBarnInfoForSelect(barn3FraApi))
            .should('have.value', barn3FraApi.identitetsnummer);

        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Barnets ID/i).should('exist');
            cy.findByText(barn3FraApi.identitetsnummer).should('exist');
        });
        cy.get('[data-test-id="pleietrengendeHarFagsak"]')
            .should('exist')
            .should('contain', fagsakMedBarn.fagsakId)
            .should('contain', barn3FraApi.identitetsnummer);

        cy.get('[data-test-id="journalførOgFortsett"]').should('not.be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('not.be.disabled');
    });

    it('Test velg barn fra liste som finnes i en fagsak', () => {
        cy.window().then((window) => {
            window.appSettings = {
                ...window.appSettings,
                PSB_TILLAT_BARN_MED_FAGSAK_VIDERE: 'false'
            };
        });
        
        cy.findByLabelText('Velg hvilket barn det gjelder')
            .select(getBarnInfoForSelect(barn1FraApi))
            .should('have.value', barn1FraApi.identitetsnummer);

        cy.findByLabelText('Velg hvilket barn det gjelder')
            .select(getBarnInfoForSelect(barn3FraApi))
            .should('have.value', barn3FraApi.identitetsnummer);

        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Barnets ID/i).should('exist');
            cy.findByText(barn3FraApi.identitetsnummer).should('exist');
        });
        cy.get('[data-test-id="pleietrengendeHarFagsak"]')
            .should('exist')
            .should('contain', fagsakMedBarn.fagsakId)
            .should('contain', barn3FraApi.identitetsnummer);

        cy.get('[data-test-id="journalførOgFortsett"]').should('be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('be.disabled');
    });

    it('Test velg barn fra liste', () => {
        cy.findByLabelText('Velg hvilket barn det gjelder')
            .select(getBarnInfoForSelect(barn1FraApi))
            .should('have.value', barn1FraApi.identitetsnummer);
        cy.get('[data-test-id="jornalførUtenFagsak"]').should('exist');

        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Barnets ID/i).should('exist');
            cy.findByText(barn1FraApi.identitetsnummer).should('exist');
        });

        cy.get('[data-test-id="journalførOgFortsett"]').should('not.be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('not.be.disabled');
    });

    it('Test Det gjelder et annet barn', () => {
        cy.findByLabelText('Det gjelder et annet barn').check();

        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Barnets ID/i).should('not.exist');
            cy.findByText(barn1FraApi.identitetsnummer).should('not.exist');
        });

        cy.get('[data-test-id="journalførOgFortsett"]').should('be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('be.disabled');

        cy.findByLabelText('Pleietrengendes fødselsnummer:').should('exist').type(fnrBarnIkkeFraList);

        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Barnets ID/i).should('exist');
            cy.findByText(fnrBarnIkkeFraList).should('exist');
        });

        cy.get('[data-test-id="jornalførUtenFagsak"]').should('exist');

        cy.get('[data-test-id="journalførOgFortsett"]').should('not.be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('not.be.disabled');
    });

    it('Test Pleietrengende har ikke fødselsnummer', () => {
        cy.findByLabelText('Pleietrengende har ikke fødselsnummer').check();

        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Barnets ID/i).should('not.exist');
            cy.findByText(fnrBarnIkkeFraList).should('not.exist');
        });

        cy.get('[data-test-id="pleietrengendeHarIkkeFnrInformasjon"]').should('exist');

        cy.get('[data-test-id="journalførOgFortsett"]').should('be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('not.be.disabled');
    });

});
