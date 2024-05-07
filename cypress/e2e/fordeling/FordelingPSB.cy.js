import { ApiPath } from 'app/apiConfig';
import { http, HttpResponse } from 'msw';
import journalpost300 from '../../fixtures/journalpost300.json';
import fagsaker from '../../fixtures/fagsaker.json';
import barnFraApi from '../../fixtures/barn.json';

const dokumenttypePSB = 'Pleiepenger sykt barn';
const fnrBarnIkkeFraList = '02021477330';
const fnrNySøker = '12448325820';
const annenSøkerFnr = '02918496664';

const klassifiserModalHeaderVent = 'Vil du lagre følgende informasjon til journalposten og sett på vent?';
const klassifiserModalHeaderFortsett = 'Vil du lagre følgende informasjon til journalposten?';

const klassifiserModalAlertInfoKanIkkeEndres = 'Informasjonen kan ikke endres etter journalposten er journalført.';

const getFagsakNavnForSelect = (fagsakId, reservert) => {
    if (reservert) {
        return `${fagsakId} (K9 Pleiepenger sykt barn) (reservert)`;
    }
    return `${fagsakId} (K9 Pleiepenger sykt barn)`;
};

const getBarnInfoForSelect = (barn) => {
    return `${barn.fornavn} ${barn.etternavn} - ${barn.identitetsnummer}`;
};

describe('Fordeling PSB', { testIsolation: false }, () => {
    it('PSB Åpen journalpost 300 fra LOS', () => {
        cy.visit('/journalpost/300');
        Cypress.config('viewportWidth', 1280);
        Cypress.config('viewportHeight', 1450);
    });

    it('Skjul dokument vindu', () => {
        cy.findByText(/Skjul/i).should('exist').click();
    });

    it('PSB Journalpost pannel med riktig data', () => {
        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Journalpostnummer/i).should('exist');
            cy.findByText(journalpost300.journalpostId).should('exist');
            cy.findByText(/Søkers ID/i).should('exist');
            cy.findByText(journalpost300.norskIdent).should('exist');
            cy.findByText(/Sakstype/i).should('exist');
            cy.findByText(dokumenttypePSB).should('exist');
        });
    });

    it('PSB Viser dokumentvalg', () => {
        cy.contains(/Dette gjelder:?/i).should('exist');
        cy.contains('Pleiepenger').should('exist');
        cy.contains('Omsorgspenger/omsorgsdager').should('exist');
        cy.contains('Pleiepenger i livets sluttfase').should('exist');
        cy.contains('Annet').should('exist');
    });

    it('PSB Test journalfør buttons disabled ved start', () => {
        cy.get('[data-test-id="journalførOgFortsett"]').should('be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('be.disabled');
    });

    it('PSB Test bekreft søker og velg fagsak uten barn', () => {
        cy.findByText(/Ja/i).should('exist').click();

        cy.findByLabelText('Velg fagsak')
            .should('exist')
            .select(getFagsakNavnForSelect(fagsaker[0].fagsakId))
            .should('have.value', fagsaker[0].fagsakId);
        cy.get('.fagsakSelectedInfo').within(() => {
            cy.findByText('Barn: ikke satt').should('exist');
            cy.findByText('Se fagsak i K9').should('exist');
            cy.get('a').invoke('attr', 'href').should('contain', fagsaker[0].fagsakId);
        });
        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Saksnummer/i).should('exist');
            cy.findByText(fagsaker[0].fagsakId).should('exist');
            cy.findByText(/Barnets ID/i).should('not.exist');
        });

        cy.get('[data-test-id="journalførOgFortsett"]').should('be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('not.be.disabled');
    });

    it('PSB Åpen klassifiser modal med fagsak uten barn - sett på vent', () => {
        cy.get('[data-test-id="journalførOgVent"]').click();

        cy.get('[data-test-id="klassifiserModalHeader"]').should('contain', klassifiserModalHeaderVent);
        cy.get('[data-test-id="klassifiseringInfo"]')
            .should('exist')
            .within(() => {
                cy.findByText(/Sakstype/i).should('exist');
                cy.findByText(dokumenttypePSB).should('exist');
                cy.findByText(/Søkers ID/i).should('exist');
                cy.findByText(journalpost300.norskIdent).should('exist');
                cy.findByText(/Saksnummer/i).should('exist');
                cy.findByText(fagsaker[0].fagsakId).should('exist');
                cy.findByText(/Periode/i).should('exist');
                cy.findByText(/Pleietrengendes ID/i).should('not.exist');
            });

        cy.get('[data-test-id="klassifiserModalAlertBlokk"]')
            .should('exist')
            .within(() => {
                cy.findByText(klassifiserModalAlertInfoKanIkkeEndres).should('exist');
            });

        cy.get('[data-test-id="klassifiserModalGåTilLos"]').should('not.exist');

        cy.get('[data-test-id="klassifiserModalJournalfør"]').should('not.be.disabled');
        cy.get('[data-test-id="klassifiserModalJournalfør"]').should('contain', 'Journalfør og sett på vent');
        cy.get('[data-test-id="klassifiserModalAvbryt"]').should('not.be.disabled').click();

        cy.get('[data-test-id="klassifiserModal"]').should('not.exist');
    });

    it('PSB Test velg fagsak med barn', () => {
        cy.contains('Velg fagsak').should('exist');

        cy.findByLabelText('Velg fagsak')
            .select(getFagsakNavnForSelect(fagsaker[2].fagsakId))
            .should('have.value', fagsaker[2].fagsakId);
        cy.get('.fagsakSelectedInfo').within(() => {
            cy.findByText(`Barn Id: ${fagsaker[2].pleietrengendeIdent}`).should('exist');
            cy.findByText('Se fagsak i K9').should('exist');
            cy.get('a').invoke('attr', 'href').should('contain', fagsaker[2].fagsakId);
        });
        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Saksnummer/i).should('exist');
            cy.findByText(fagsaker[2].fagsakId).should('exist');
            cy.findByText(/Barnets ID/i).should('exist');
            cy.findByText(fagsaker[2].pleietrengendeIdent).should('exist');
        });

        cy.get('[data-test-id="journalførOgFortsett"]').should('not.be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('not.be.disabled');
    });

    it('PSB Åpen klassifiser modal med fagsak og barn fortsett', () => {
        cy.get('[data-test-id="journalførOgFortsett"]').click();

        cy.get('[data-test-id="klassifiserModalHeader"]').should('contain', klassifiserModalHeaderFortsett);
        cy.get('[data-test-id="klassifiseringInfo"]')
            .should('exist')
            .within(() => {
                cy.findByText(/Sakstype/i).should('exist');
                cy.findByText(dokumenttypePSB).should('exist');
                cy.findByText(/Søkers ID/i).should('exist');
                cy.findByText(journalpost300.norskIdent).should('exist');
                cy.findByText(/Saksnummer/i).should('exist');
                cy.findByText(fagsaker[2].fagsakId).should('exist');
                cy.findByText(/Periode/i).should('exist');
                cy.findByText(/Pleietrengendes ID/i).should('exist');
                cy.findByText(fagsaker[2].pleietrengendeIdent).should('exist');
            });

        cy.get('[data-test-id="klassifiserModalAlertBlokk"]')
            .should('exist')
            .within(() => {
                cy.findByText(klassifiserModalAlertInfoKanIkkeEndres).should('exist');
            });

        cy.get('[data-test-id="klassifiserModalGåTilLos"]').should('not.exist');

        cy.get('[data-test-id="klassifiserModalJournalfør"]').should('not.be.disabled');
        cy.get('[data-test-id="klassifiserModalJournalfør"]').should('contain', 'Journalfør journalposten');
        cy.get('[data-test-id="klassifiserModalAvbryt"]').should('not.be.disabled').click();
        cy.get('[data-test-id="klassifiserModal"]').should('not.exist');
    });

    it('PSB Åpen klassifiser modal med fagsak og barn - sett på vent', () => {
        cy.get('[data-test-id="journalførOgVent"]').click();

        cy.get('[data-test-id="klassifiserModalHeader"]').should('contain', klassifiserModalHeaderVent);
        cy.get('[data-test-id="klassifiseringInfo"]')
            .should('exist')
            .within(() => {
                cy.findByText(/Sakstype/i).should('exist');
                cy.findByText(dokumenttypePSB).should('exist');
                cy.findByText(/Søkers ID/i).should('exist');
                cy.findByText(journalpost300.norskIdent).should('exist');
                cy.findByText(/Saksnummer/i).should('exist');
                cy.findByText(fagsaker[2].fagsakId).should('exist');
                cy.findByText(/Periode/i).should('exist');
                cy.findByText(/Pleietrengendes ID/i).should('exist');
                cy.findByText(fagsaker[2].pleietrengendeIdent).should('exist');
            });

        cy.get('[data-test-id="klassifiserModalAlertBlokk"]')
            .should('exist')
            .within(() => {
                cy.findByText(klassifiserModalAlertInfoKanIkkeEndres).should('exist');
            });

        cy.get('[data-test-id="klassifiserModalGåTilLos"]').should('not.exist');

        cy.get('[data-test-id="klassifiserModalJournalfør"]').should('not.be.disabled');
        cy.get('[data-test-id="klassifiserModalJournalfør"]').should('contain', 'Journalfør og sett på vent');
        cy.get('[data-test-id="klassifiserModalAvbryt"]').should('not.be.disabled').click();
        cy.get('[data-test-id="klassifiserModal"]').should('not.exist');
    });

    it('PSB Test velg reservert fagsak med barn', () => {
        cy.contains('Velg fagsak').should('exist');

        cy.findByLabelText('Velg fagsak')
            .select(getFagsakNavnForSelect(fagsaker[3].fagsakId, true))
            .should('have.value', fagsaker[3].fagsakId);
        cy.get('.fagsakSelectedInfo').within(() => {
            cy.findByText(`Barn Id: ${fagsaker[3].pleietrengendeIdent}`).should('exist');
            cy.findByText('Se fagsak i K9').should('not.exist');
        });
        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Saksnummer/i).should('exist');
            cy.findByText(fagsaker[3].fagsakId).should('exist');
            cy.findByText(/Barnets ID/i).should('exist');
            cy.findByText(fagsaker[3].pleietrengendeIdent).should('exist');
        });

        cy.get('[data-test-id="journalførOgFortsett"]').should('not.be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('not.be.disabled');
    });

    it('PSB Åpen klassifiser modal med reservert fagsak og barn fortsett', () => {
        cy.get('[data-test-id="journalførOgFortsett"]').click();

        cy.get('[data-test-id="klassifiserModalHeader"]').should('contain', klassifiserModalHeaderFortsett);
        cy.get('[data-test-id="klassifiseringInfo"]')
            .should('exist')
            .within(() => {
                cy.findByText(/Sakstype/i).should('exist');
                cy.findByText(dokumenttypePSB).should('exist');
                cy.findByText(/Søkers ID/i).should('exist');
                cy.findByText(journalpost300.norskIdent).should('exist');
                cy.findByText(/Saksnummer/i).should('exist');
                cy.findByText(fagsaker[3].fagsakId).should('exist');
                cy.findByText(/Periode/i).should('exist');
                cy.findByText(/Pleietrengendes ID/i).should('exist');
                cy.findByText(fagsaker[3].pleietrengendeIdent).should('exist');
            });

        cy.get('[data-test-id="klassifiserModalAlertBlokk"]')
            .should('exist')
            .within(() => {
                cy.findByText(klassifiserModalAlertInfoKanIkkeEndres).should('exist');
            });

        cy.get('[data-test-id="klassifiserModalGåTilLos"]').should('not.exist');

        cy.get('[data-test-id="klassifiserModalJournalfør"]').should('not.be.disabled');
        cy.get('[data-test-id="klassifiserModalJournalfør"]').should('contain', 'Journalfør journalposten');
        cy.get('[data-test-id="klassifiserModalAvbryt"]').should('not.be.disabled').click();
        cy.get('[data-test-id="klassifiserModal"]').should('not.exist');
    });

    it('PSB Åpen klassifiser modal med reservert fagsak og barn - sett på vent', () => {
        cy.get('[data-test-id="journalførOgVent"]').click();

        cy.get('[data-test-id="klassifiserModalHeader"]').should('contain', klassifiserModalHeaderVent);
        cy.get('[data-test-id="klassifiseringInfo"]')
            .should('exist')
            .within(() => {
                cy.findByText(/Sakstype/i).should('exist');
                cy.findByText(dokumenttypePSB).should('exist');
                cy.findByText(/Søkers ID/i).should('exist');
                cy.findByText(journalpost300.norskIdent).should('exist');
                cy.findByText(/Saksnummer/i).should('exist');
                cy.findByText(fagsaker[3].fagsakId).should('exist');
                cy.findByText(/Periode/i).should('exist');
                cy.findByText(/Pleietrengendes ID/i).should('exist');
                cy.findByText(fagsaker[3].pleietrengendeIdent).should('exist');
            });

        cy.get('[data-test-id="klassifiserModalAlertBlokk"]')
            .should('exist')
            .within(() => {
                cy.findByText(klassifiserModalAlertInfoKanIkkeEndres).should('exist');
            });

        cy.get('[data-test-id="klassifiserModalGåTilLos"]').should('not.exist');

        cy.get('[data-test-id="klassifiserModalJournalfør"]').should('not.be.disabled');
        cy.get('[data-test-id="klassifiserModalJournalfør"]').should('contain', 'Journalfør og sett på vent');
        cy.get('[data-test-id="klassifiserModalAvbryt"]').should('not.be.disabled').click();
        cy.get('[data-test-id="klassifiserModal"]').should('not.exist');
    });

    it('PSB Test velg reservert fagsak uten barn', () => {
        cy.contains('Velg fagsak').should('exist');

        cy.findByLabelText('Velg fagsak')
            .select(getFagsakNavnForSelect(fagsaker[4].fagsakId, true))
            .should('have.value', fagsaker[4].fagsakId);
        cy.get('.fagsakSelectedInfo').within(() => {
            cy.findByText('Barn: ikke satt').should('exist');
            cy.findByText('Se fagsak i K9').should('not.exist');
        });
        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Saksnummer/i).should('exist');
            cy.findByText(fagsaker[4].fagsakId).should('exist');
            cy.findByText(/Barnets ID/i).should('not.exist');
        });

        cy.get('[data-test-id="journalførOgFortsett"]').should('be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('not.be.disabled');
    });

    it('PSB Åpen klassifiser modal med reservert fagsak uten barn - sett på vent', () => {
        cy.get('[data-test-id="journalførOgVent"]').click();

        cy.get('[data-test-id="klassifiserModalHeader"]').should('contain', klassifiserModalHeaderVent);
        cy.get('[data-test-id="klassifiseringInfo"]')
            .should('exist')
            .within(() => {
                cy.findByText(/Sakstype/i).should('exist');
                cy.findByText(dokumenttypePSB).should('exist');
                cy.findByText(/Søkers ID/i).should('exist');
                cy.findByText(journalpost300.norskIdent).should('exist');
                cy.findByText(/Saksnummer/i).should('exist');
                cy.findByText(fagsaker[4].fagsakId).should('exist');
                cy.findByText(/Periode/i).should('exist');
                cy.findByText(/Pleietrengendes ID/i).should('not.exist');
            });

        cy.get('[data-test-id="klassifiserModalAlertBlokk"]')
            .should('exist')
            .within(() => {
                cy.findByText(klassifiserModalAlertInfoKanIkkeEndres).should('exist');
            });

        cy.get('[data-test-id="klassifiserModalGåTilLos"]').should('not.exist');

        cy.get('[data-test-id="klassifiserModalJournalfør"]').should('not.be.disabled');
        cy.get('[data-test-id="klassifiserModalJournalfør"]').should('contain', 'Journalfør og sett på vent');
        cy.get('[data-test-id="klassifiserModalAvbryt"]').should('not.be.disabled').click();
        cy.get('[data-test-id="klassifiserModal"]').should('not.exist');
    });

    it('PSB Test Reserver saksnummer til ny fagsak', () => {
        cy.findByLabelText('Reserver saksnummer til ny fagsak').check();

        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Saksnummer/i).should('not.exist');
            cy.findByText(fagsaker[0].fagsakId).should('not.exist');
        });

        cy.get('[data-test-id="journalførOgFortsett"]').should('be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('be.disabled');
    });

    it('PSB Test velg barn fra liste', () => {
        cy.findByLabelText('Velg hvilket barn det gjelder')
            .select(getBarnInfoForSelect(barnFraApi.barn[0]))
            .should('have.value', barnFraApi.barn[0].identitetsnummer);
        cy.get('[data-test-id="jornalførUtenFagsak"]').should('exist');

        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Barnets ID/i).should('exist');
            cy.findByText(barnFraApi.barn[0].identitetsnummer).should('exist');
        });

        cy.get('[data-test-id="journalførOgFortsett"]').should('not.be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('not.be.disabled');
    });

    it('PSB Åpen klassifiser modal fortsett med reserver fagsak og barn fra liste', () => {
        cy.get('[data-test-id="journalførOgFortsett"]').click();

        cy.get('[data-test-id="klassifiserModalHeader"]').should('contain', klassifiserModalHeaderFortsett);
        cy.get('[data-test-id="klassifiseringInfo"]')
            .should('exist')
            .within(() => {
                cy.findByText(/Sakstype/i).should('exist');
                cy.findByText(dokumenttypePSB).should('exist');
                cy.findByText(/Søkers ID/i).should('exist');
                cy.findByText(journalpost300.norskIdent).should('exist');
                cy.findByText(/Saksnummer/i).should('not.exist');
                cy.findByText(/Periode/i).should('not.exist');
                cy.findByText(/Pleietrengendes ID/i).should('exist');
                cy.findByText(barnFraApi.barn[0].identitetsnummer).should('exist');
            });

        cy.get('[data-test-id="klassifiserModalAlertBlokk"]')
            .should('exist')
            .within(() => {
                cy.findByText(klassifiserModalAlertInfoKanIkkeEndres).should('exist');
            });

        cy.get('[data-test-id="klassifiserModalGåTilLos"]').should('not.exist');

        cy.get('[data-test-id="klassifiserModalJournalfør"]').should('not.be.disabled');
        cy.get('[data-test-id="klassifiserModalJournalfør"]').should('contain', 'Journalfør journalposten');
        cy.get('[data-test-id="klassifiserModalAvbryt"]').should('not.be.disabled').click();
        cy.get('[data-test-id="klassifiserModal"]').should('not.exist');
    });

    it('PSB Åpen klassifiser modal sett på vent med reserver fagsak og barn fra liste', () => {
        cy.get('[data-test-id="journalførOgVent"]').click();

        cy.get('[data-test-id="klassifiserModalHeader"]').should('contain', klassifiserModalHeaderVent);
        cy.get('[data-test-id="klassifiseringInfo"]')
            .should('exist')
            .within(() => {
                cy.findByText(/Sakstype/i).should('exist');
                cy.findByText(dokumenttypePSB).should('exist');
                cy.findByText(/Søkers ID/i).should('exist');
                cy.findByText(journalpost300.norskIdent).should('exist');
                cy.findByText(/Saksnummer/i).should('not.exist');
                cy.findByText(/Periode/i).should('not.exist');
                cy.findByText(/Pleietrengendes ID/i).should('exist');
                cy.findByText(barnFraApi.barn[0].identitetsnummer).should('exist');
            });

        cy.get('[data-test-id="klassifiserModalAlertBlokk"]')
            .should('exist')
            .within(() => {
                cy.findByText(klassifiserModalAlertInfoKanIkkeEndres).should('exist');
            });

        cy.get('[data-test-id="klassifiserModalGåTilLos"]').should('not.exist');

        cy.get('[data-test-id="klassifiserModalJournalfør"]').should('not.be.disabled');
        cy.get('[data-test-id="klassifiserModalJournalfør"]').should('contain', 'Journalfør og sett på vent');
        cy.get('[data-test-id="klassifiserModalAvbryt"]').should('not.be.disabled').click();
        cy.get('[data-test-id="klassifiserModal"]').should('not.exist');
    });

    it('PSB Test Det gjelder et annet barn', () => {
        cy.findByLabelText('Det gjelder et annet barn').check();

        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Barnets ID/i).should('not.exist');
            cy.findByText(barnFraApi.barn[0].identitetsnummer).should('not.exist');
        });

        cy.get('[data-test-id="journalførOgFortsett"]').should('be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('be.disabled');

        cy.findByLabelText('Pleietrengendes fødselsnummer').should('exist').type(fnrBarnIkkeFraList);

        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Barnets ID/i).should('exist');
            cy.findByText(fnrBarnIkkeFraList).should('exist');
        });

        cy.get('[data-test-id="jornalførUtenFagsak"]').should('exist');

        cy.get('[data-test-id="journalførOgFortsett"]').should('not.be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('not.be.disabled');
    });

    it('PSB Åpen klassifiser modal fortsett med reserver fagsak og annet barn', () => {
        cy.get('[data-test-id="journalførOgFortsett"]').click();

        cy.get('[data-test-id="klassifiserModalHeader"]').should('contain', klassifiserModalHeaderFortsett);
        cy.get('[data-test-id="klassifiseringInfo"]')
            .should('exist')
            .within(() => {
                cy.findByText(/Sakstype/i).should('exist');
                cy.findByText(dokumenttypePSB).should('exist');
                cy.findByText(/Søkers ID/i).should('exist');
                cy.findByText(journalpost300.norskIdent).should('exist');
                cy.findByText(/Saksnummer/i).should('not.exist');
                cy.findByText(/Periode/i).should('not.exist');
                cy.findByText(/Pleietrengendes ID/i).should('exist');
                cy.findByText(fnrBarnIkkeFraList).should('exist');
            });

        cy.get('[data-test-id="klassifiserModalAlertBlokk"]')
            .should('exist')
            .within(() => {
                cy.findByText(klassifiserModalAlertInfoKanIkkeEndres).should('exist');
            });

        cy.get('[data-test-id="klassifiserModalGåTilLos"]').should('not.exist');

        cy.get('[data-test-id="klassifiserModalJournalfør"]').should('not.be.disabled');
        cy.get('[data-test-id="klassifiserModalJournalfør"]').should('contain', 'Journalfør journalposten');
        cy.get('[data-test-id="klassifiserModalAvbryt"]').should('not.be.disabled').click();
        cy.get('[data-test-id="klassifiserModal"]').should('not.exist');
    });

    it('PSB Åpen klassifiser modal sett på vent med reserver fagsak og og annet barn', () => {
        cy.get('[data-test-id="journalførOgVent"]').click();

        cy.get('[data-test-id="klassifiserModalHeader"]').should('contain', klassifiserModalHeaderVent);
        cy.get('[data-test-id="klassifiseringInfo"]')
            .should('exist')
            .within(() => {
                cy.findByText(/Sakstype/i).should('exist');
                cy.findByText(dokumenttypePSB).should('exist');
                cy.findByText(/Søkers ID/i).should('exist');
                cy.findByText(journalpost300.norskIdent).should('exist');
                cy.findByText(/Saksnummer/i).should('not.exist');
                cy.findByText(/Periode/i).should('not.exist');
                cy.findByText(/Pleietrengendes ID/i).should('exist');
                cy.findByText(fnrBarnIkkeFraList).should('exist');
            });

        cy.get('[data-test-id="klassifiserModalAlertBlokk"]')
            .should('exist')
            .within(() => {
                cy.findByText(klassifiserModalAlertInfoKanIkkeEndres).should('exist');
            });

        cy.get('[data-test-id="klassifiserModalGåTilLos"]').should('not.exist');

        cy.get('[data-test-id="klassifiserModalJournalfør"]').should('not.be.disabled');
        cy.get('[data-test-id="klassifiserModalJournalfør"]').should('contain', 'Journalfør og sett på vent');
        cy.get('[data-test-id="klassifiserModalAvbryt"]').should('not.be.disabled').click();
        cy.get('[data-test-id="klassifiserModal"]').should('not.exist');
    });

    it('PSB Test Pleietrengende har ikke fødselsnummer', () => {
        cy.findByLabelText('Pleietrengende har ikke fødselsnummer').check();

        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Barnets ID/i).should('not.exist');
            cy.findByText(fnrBarnIkkeFraList).should('not.exist');
        });

        cy.get('[data-test-id="pleietrengendeHarIkkeFnrInformasjon"]').should('exist');

        cy.get('[data-test-id="journalførOgFortsett"]').should('be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('not.be.disabled');
    });

    it('PSB Åpen klassifiser modal sett på vent med reserver fagsak og Pleietrengende har ikke fødselsnummer ', () => {
        cy.get('[data-test-id="journalførOgVent"]').click();

        cy.get('[data-test-id="klassifiserModalHeader"]').should('contain', klassifiserModalHeaderVent);
        cy.get('[data-test-id="klassifiseringInfo"]')
            .should('exist')
            .within(() => {
                cy.findByText(/Sakstype/i).should('exist');
                cy.findByText(dokumenttypePSB).should('exist');
                cy.findByText(/Søkers ID/i).should('exist');
                cy.findByText(journalpost300.norskIdent).should('exist');
                cy.findByText(/Saksnummer/i).should('not.exist');
                cy.findByText(/Periode/i).should('not.exist');
                cy.findByText(/Pleietrengendes ID/i).should('not.exist');
            });

        cy.get('[data-test-id="klassifiserModalAlertBlokk"]')
            .should('exist')
            .within(() => {
                cy.findByText(klassifiserModalAlertInfoKanIkkeEndres).should('exist');
            });

        cy.get('[data-test-id="klassifiserModalGåTilLos"]').should('not.exist');

        cy.get('[data-test-id="klassifiserModalJournalfør"]').should('not.be.disabled');
        cy.get('[data-test-id="klassifiserModalJournalfør"]').should('contain', 'Journalfør og sett på vent');
        cy.get('[data-test-id="klassifiserModalAvbryt"]').should('not.be.disabled').click();
        cy.get('[data-test-id="klassifiserModal"]').should('not.exist');
    });

    it('PSB Test at state fjernet etter avbekreft søker', () => {
        cy.findByText(/Nei/i).should('exist').click();
        cy.findByLabelText('Velg fagsak').should('not.exist');
        cy.findByLabelText('Reserver saksnummer til ny fagsak').should('not.exist');
        cy.findByLabelText('Pleietrengendes fødselsnummer').should('not.exist');
        cy.findByLabelText('Pleietrengende har ikke fødselsnummer').should('not.exist');
        cy.get('[data-test-id="pleietrengendeHarIkkeFnrInformasjon"]').should('not.exist');
        cy.get('[data-test-id="journalførOgFortsett"]').should('be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('be.disabled');
    });

    it('PSB Test ny søker og barn', () => {
        cy.findByLabelText('Søkers fødselsnummer eller D-nummer:').should('exist').type(fnrNySøker);
        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Søkers ID/i).should('exist');
            cy.findByText(fnrNySøker).should('exist');
        });
        cy.findByLabelText('Velg hvilket barn det gjelder')
            .select(getBarnInfoForSelect(barnFraApi.barn[0]))
            .should('have.value', barnFraApi.barn[0].identitetsnummer);

        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Barnets ID/i).should('exist');
            cy.findByText(barnFraApi.barn[0].identitetsnummer).should('exist');
        });

        cy.get('[data-test-id="jornalførUtenFagsak"]').should('exist');

        cy.get('[data-test-id="journalførOgFortsett"]').should('not.be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('not.be.disabled');
    });

    it('PSB Åpen klassifiser modal fortsett med ny søker, reserver fagsak og barn fra liste', () => {
        cy.get('[data-test-id="journalførOgFortsett"]').click();

        cy.get('[data-test-id="klassifiserModalHeader"]').should('contain', klassifiserModalHeaderFortsett);
        cy.get('[data-test-id="klassifiseringInfo"]')
            .should('exist')
            .within(() => {
                cy.findByText(/Sakstype/i).should('exist');
                cy.findByText(dokumenttypePSB).should('exist');
                cy.findByText(/Søkers ID/i).should('exist');
                cy.findByText(fnrNySøker).should('exist');
                cy.findByText(/Saksnummer/i).should('not.exist');
                cy.findByText(/Periode/i).should('not.exist');
                cy.findByText(/Pleietrengendes ID/i).should('exist');
                cy.findByText(barnFraApi.barn[0].identitetsnummer).should('exist');
            });

        cy.get('[data-test-id="klassifiserModalAlertBlokk"]')
            .should('exist')
            .within(() => {
                cy.findByText(klassifiserModalAlertInfoKanIkkeEndres).should('exist');
            });

        cy.get('[data-test-id="klassifiserModalGåTilLos"]').should('not.exist');

        cy.get('[data-test-id="klassifiserModalJournalfør"]').should('not.be.disabled');
        cy.get('[data-test-id="klassifiserModalJournalfør"]').should('contain', 'Journalfør journalposten');
        cy.get('[data-test-id="klassifiserModalAvbryt"]').should('not.be.disabled').click();
        cy.get('[data-test-id="klassifiserModal"]').should('not.exist');
    });

    it('PSB Åpen klassifiser modal sett på vent med ny søker, reserver fagsak og barn fra liste', () => {
        cy.get('[data-test-id="journalførOgVent"]').click();

        cy.get('[data-test-id="klassifiserModalHeader"]').should('contain', klassifiserModalHeaderVent);
        cy.get('[data-test-id="klassifiseringInfo"]')
            .should('exist')
            .within(() => {
                cy.findByText(/Sakstype/i).should('exist');
                cy.findByText(dokumenttypePSB).should('exist');
                cy.findByText(/Søkers ID/i).should('exist');
                cy.findByText(fnrNySøker).should('exist');
                cy.findByText(/Saksnummer/i).should('not.exist');
                cy.findByText(/Periode/i).should('not.exist');
                cy.findByText(/Pleietrengendes ID/i).should('exist');
                cy.findByText(barnFraApi.barn[0].identitetsnummer).should('exist');
            });

        cy.get('[data-test-id="klassifiserModalAlertBlokk"]')
            .should('exist')
            .within(() => {
                cy.findByText(klassifiserModalAlertInfoKanIkkeEndres).should('exist');
            });

        cy.get('[data-test-id="klassifiserModalGåTilLos"]').should('not.exist');

        cy.get('[data-test-id="klassifiserModalJournalfør"]').should('not.be.disabled');
        cy.get('[data-test-id="klassifiserModalJournalfør"]').should('contain', 'Journalfør og sett på vent');
        cy.get('[data-test-id="klassifiserModalAvbryt"]').should('not.be.disabled').click();
        cy.get('[data-test-id="klassifiserModal"]').should('not.exist');
    });

    it('PSB Test bekreft søker på nytt og pleietrengende fjernet fra state', () => {
        cy.findByText(/Ja/i).should('exist').click();

        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Søkers ID/i).should('exist');
            cy.findByText(fnrNySøker).should('not.exist');
        });

        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Barnets ID/i).should('not.exist');
            cy.findByText(barnFraApi.barn[0].identitetsnummer).should('not.exist');
        });

        cy.get('[data-test-id="journalførOgFortsett"]').should('be.disabled');
        // TODO: Må være disabled og fungerer ikke i test
        // cy.get('[data-test-id="journalførOgVent"]').should('be.disabled');
    });

    it('PSB Test to søkere i journalposten', () => {
        cy.findByLabelText('Det finnes informasjon om to søkere i journalposten (gjelder kun papirsøknad)')
            .should('exist')
            .check();

        cy.get('[data-test-id="infoOmRegisteringAvToSokere"]').should('exist');
        cy.get('[data-test-id="toSøkereIngenAndreSøker"]').should('exist');

        cy.findByLabelText('Fødselsnummer annen søker:').should('exist').type(annenSøkerFnr);

        cy.get('[data-test-id="toSøkereIngenAndreSøker"]').should('not.exist');
        cy.get('[data-test-id="toSøkereIngenPleietrengende"]').should('exist');

        cy.get('[data-test-id="journalførOgFortsett"]').should('be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('be.disabled');

        cy.findByLabelText('Velg hvilket barn det gjelder')
            .select(getBarnInfoForSelect(barnFraApi.barn[0]))
            .should('have.value', barnFraApi.barn[0].identitetsnummer);

        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Barnets ID/i).should('exist');
            cy.findByText(barnFraApi.barn[0].identitetsnummer).should('exist');
        });
        cy.get('[data-test-id="toSøkereIngenPleietrengende"]').should('not.exist');

        cy.get('[data-test-id="jornalførUtenFagsak"]').should('exist');

        cy.get('[data-test-id="journalførOgFortsett"]').should('not.be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('not.be.disabled');
    });

    it('PSB Åpen klassifiser modal fortsett med med 2 søkere, reserver fagsak og barn fra liste', () => {
        cy.get('[data-test-id="journalførOgFortsett"]').click();

        cy.get('[data-test-id="klassifiserModalHeader"]').should('contain', klassifiserModalHeaderFortsett);
        cy.get('[data-test-id="klassifiseringInfo"]')
            .should('exist')
            .within(() => {
                cy.findByText(/Sakstype/i).should('exist');
                cy.findByText(dokumenttypePSB).should('exist');
                cy.findByText(/Søkers ID/i).should('exist');
                cy.findByText(journalpost300.norskIdent).should('exist');
                cy.findByText(/Saksnummer/i).should('not.exist');
                cy.findByText(/Periode/i).should('not.exist');
                cy.findByText(/Pleietrengendes ID/i).should('exist');
                cy.findByText(barnFraApi.barn[0].identitetsnummer).should('exist');
            });

        cy.get('[data-test-id="klassifiserModalAlertBlokk"]')
            .should('exist')
            .within(() => {
                cy.findByText(klassifiserModalAlertInfoKanIkkeEndres).should('exist');
            });

        cy.get('[data-test-id="klassifiserModalGåTilLos"]').should('not.exist');

        cy.get('[data-test-id="klassifiserModalJournalfør"]').should('not.be.disabled');
        cy.get('[data-test-id="klassifiserModalJournalfør"]').should('contain', 'Journalfør journalposten');
        cy.get('[data-test-id="klassifiserModalAvbryt"]').should('not.be.disabled').click();
        cy.get('[data-test-id="klassifiserModal"]').should('not.exist');
    });

    it('PSB Åpen klassifiser modal sett på vent med 2 søkere, reserver fagsak og barn fra liste', () => {
        cy.get('[data-test-id="journalførOgVent"]').click();

        cy.get('[data-test-id="klassifiserModalHeader"]').should('contain', klassifiserModalHeaderVent);
        cy.get('[data-test-id="klassifiseringInfo"]')
            .should('exist')
            .within(() => {
                cy.findByText(/Sakstype/i).should('exist');
                cy.findByText(dokumenttypePSB).should('exist');
                cy.findByText(/Søkers ID/i).should('exist');
                cy.findByText(journalpost300.norskIdent).should('exist');
                cy.findByText(/Saksnummer/i).should('not.exist');
                cy.findByText(/Periode/i).should('not.exist');
                cy.findByText(/Pleietrengendes ID/i).should('exist');
                cy.findByText(barnFraApi.barn[0].identitetsnummer).should('exist');
            });

        cy.get('[data-test-id="klassifiserModalAlertBlokk"]')
            .should('exist')
            .within(() => {
                cy.findByText(klassifiserModalAlertInfoKanIkkeEndres).should('exist');
            });

        cy.get('[data-test-id="klassifiserModalGåTilLos"]').should('not.exist');

        cy.get('[data-test-id="klassifiserModalJournalfør"]').should('not.be.disabled');
        cy.get('[data-test-id="klassifiserModalJournalfør"]').should('contain', 'Journalfør og sett på vent');
        cy.get('[data-test-id="klassifiserModalAvbryt"]').should('not.be.disabled').click();
        cy.get('[data-test-id="klassifiserModal"]').should('not.exist');
    });
});
describe('Fordeling PSB søker uten fagsaker', { testIsolation: false }, () => {
    it('PSB intercept hent fagsaker', () => {
        cy.visit('/journalpost/300');
        Cypress.config('viewportWidth', 1280);
        Cypress.config('viewportHeight', 1450);

        cy.findByText(/Skjul/i).should('exist').click();

        cy.window().then((window) => {
            const { worker } = window.msw;
            worker.use(http.get(ApiPath.HENT_FAGSAK_PÅ_IDENT, () => HttpResponse.json([], { status: 200 })));
        });

        cy.findByText(/Ja/i).should('exist').click();

        cy.findByLabelText('Velg fagsak').should('not.exist');
    });

    it('PSB Test uten fagsaker med barn fra liste', () => {
        cy.findByLabelText('Velg hvilket barn det gjelder')
            .select(getBarnInfoForSelect(barnFraApi.barn[0]))
            .should('have.value', barnFraApi.barn[0].identitetsnummer);

        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Barnets ID/i).should('exist');
            cy.findByText(barnFraApi.barn[0].identitetsnummer).should('exist');
        });

        cy.get('[data-test-id="jornalførUtenFagsak"]').should('exist');

        cy.get('[data-test-id="journalførOgFortsett"]').should('not.be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('not.be.disabled');
    });

    it('PSB Test uten fagsaker med annet barn', () => {
        cy.findByLabelText('Det gjelder et annet barn').check();

        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Barnets ID/i).should('not.exist');
            cy.findByText(barnFraApi.barn[0].identitetsnummer).should('not.exist');
        });

        cy.get('[data-test-id="journalførOgFortsett"]').should('be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('be.disabled');

        cy.findByLabelText('Pleietrengendes fødselsnummer').should('exist').type(fnrBarnIkkeFraList);

        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Barnets ID/i).should('exist');
            cy.findByText(fnrBarnIkkeFraList).should('exist');
        });

        cy.get('[data-test-id="jornalførUtenFagsak"]').should('exist');

        cy.get('[data-test-id="journalførOgFortsett"]').should('not.be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('not.be.disabled');
    });

    it('PSB Test uten fagsaker og Pleietrengende har ikke fødselsnummer', () => {
        cy.findByLabelText('Pleietrengende har ikke fødselsnummer').check();

        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Barnets ID/i).should('not.exist');
            cy.findByText(fnrBarnIkkeFraList).should('not.exist');
        });

        cy.get('[data-test-id="pleietrengendeHarIkkeFnrInformasjon"]').should('exist');

        cy.get('[data-test-id="journalførOgFortsett"]').should('be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('not.be.disabled');
    });

    it('PSB intercept hent barn', () => {
        cy.window().then((window) => {
            const { worker } = window.msw;
            worker.use(http.get(ApiPath.BARN_GET, () => HttpResponse.json({ barn: [] }, { status: 200 })));
        });

        // Clear hent barn på nytt
        cy.findByText(/Nei/i).should('exist').click();
        cy.findByText(/Ja/i).should('exist').click();
    });

    it('PSB Test uten fagsaker, uten barn liste med annet barn', () => {
        cy.findByLabelText('Velg hvilket barn det gjelder').should('not.exist');
        cy.findByLabelText('Pleietrengendes fødselsnummer').should('exist').type(fnrBarnIkkeFraList);

        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Barnets ID/i).should('exist');
            cy.findByText(fnrBarnIkkeFraList).should('exist');
        });

        cy.get('[data-test-id="jornalførUtenFagsak"]').should('exist');

        cy.get('[data-test-id="journalførOgFortsett"]').should('not.be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('not.be.disabled');
    });

    it('PSB Test uten fagsaker, uten barn liste og Pleietrengende har ikke fødselsnummer', () => {
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

describe('Fordeling PSB søker uten liste med barn', { testIsolation: false }, () => {
    it('PSB intercept hent barn', () => {
        cy.visit('/journalpost/300');

        cy.findByText(/Skjul/i).should('exist').click();

        cy.window().then((window) => {
            const { worker } = window.msw;
            worker.use(http.get(ApiPath.BARN_GET, () => HttpResponse.json({ barn: [] }, { status: 200 })));
        });

        cy.findByText(/Ja/i).should('exist').click();

        cy.findByLabelText('Velg fagsak').should('exist');

        cy.findByLabelText('Reserver saksnummer til ny fagsak').check();

        cy.findByLabelText('Velg hvilket barn det gjelder').should('not.exist');
    });

    it('PSB Test søker uten barn liste med annet barn', () => {
        cy.findByLabelText('Pleietrengendes fødselsnummer').should('exist').type(fnrBarnIkkeFraList);

        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Barnets ID/i).should('exist');
            cy.findByText(fnrBarnIkkeFraList).should('exist');
        });

        cy.get('[data-test-id="journalførOgFortsett"]').should('not.be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('not.be.disabled');
    });

    it('PSB Test søker uten barn liste og Pleietrengende har ikke fødselsnummer', () => {
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
