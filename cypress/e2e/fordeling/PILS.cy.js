import { ApiPath } from 'app/apiConfig';

import { http, HttpResponse } from 'msw';
import { getFagsakNavnForSelect } from '../../utils/utils';
import journalpost from '../../fixtures/jpPILS301.json';
import fagsaker from '../../fixtures/fagsaker.json';

const dokumenttype = 'Pleiepenger i livets sluttfase';
const valgteDokumentType = 'Pleiepenger i livets sluttfase';
const valgteDokumentTypeKode = 'PLEIEPENGER_I_LIVETS_SLUTTFASE';
const journalpostId = journalpost.journalpostId;
const norskIdent = journalpost.norskIdent;
const pleietrengende = '02021477330';
const fnrNySøker = '12448325820';
const annenSøkerFnr = '02918496664';
const fagsakMedPleietrengende = fagsaker[5];
const fagsakUtenPleietrengende = fagsaker[6];
const fagsakMedPleietrengendeReservert = fagsaker[7];
const fagsakUtenPleietrengendeReservert = fagsaker[8];

const klassifiserModalHeaderVent = 'Vil du lagre følgende informasjon til journalposten og sett på vent?';
const klassifiserModalHeaderFortsett = 'Vil du lagre følgende informasjon til journalposten?';

const klassifiserModalAlertInfoKanIkkeEndres = 'Informasjonen kan ikke endres etter journalposten er journalført.';

describe(`Fordeling ${dokumenttype}`, { testIsolation: false }, () => {
    it(`Åpen journalpost ${journalpostId} fra LOS`, () => {
        cy.visit(`/journalpost/${journalpostId}`);
        Cypress.config('viewportWidth', 1280);
        Cypress.config('viewportHeight', 1450);
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

    it('Test journalfør buttons disabled ved start', () => {
        cy.get('[data-test-id="journalførOgFortsett"]').should('be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('be.disabled');
    });

    it('Test bekreft søker og velg fagsak uten pleietrengende', () => {
        cy.findByText(/Ja/i).should('exist').click();

        cy.findByLabelText('Velg fagsak')
            .should('exist')
            .select(getFagsakNavnForSelect(fagsakUtenPleietrengende.fagsakId, dokumenttype))
            .should('have.value', fagsakUtenPleietrengende.fagsakId);
        cy.get('.fagsakSelectedInfo').within(() => {
            cy.findByText('Pleietrengende:').should('exist');
            cy.findByText('ikke satt').should('exist');
            cy.findByText('Se fagsak i K9').should('exist');
            cy.get('a').invoke('attr', 'href').should('contain', fagsakUtenPleietrengende.fagsakId);
        });
        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Saksnummer/i).should('exist');
            cy.findByText(fagsakUtenPleietrengende.fagsakId).should('exist');
            cy.findByText(/Pleietrengendes ID/i).should('not.exist');
        });

        cy.get('[data-test-id="journalførOgFortsett"]').should('be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('not.be.disabled');
    });

    it('Åpen klassifiser modal med fagsak uten pleietrengende - sett på vent', () => {
        cy.get('[data-test-id="journalførOgVent"]').click();

        cy.get('[data-test-id="klassifiserModalHeader"]').should('contain', klassifiserModalHeaderVent);
        cy.get('[data-test-id="klassifiseringInfo"]')
            .should('exist')
            .within(() => {
                cy.findByText(/Sakstype/i).should('exist');
                cy.findByText(dokumenttype).should('exist');
                cy.findByText(/Søkers ID/i).should('exist');
                cy.findByText(norskIdent).should('exist');
                cy.findByText(/Saksnummer/i).should('exist');
                cy.findByText(fagsakUtenPleietrengende.fagsakId).should('exist');
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

    it('Test velg fagsak med pleietrengende', () => {
        cy.contains('Velg fagsak').should('exist');

        cy.findByLabelText('Velg fagsak')
            .select(getFagsakNavnForSelect(fagsakMedPleietrengende.fagsakId, dokumenttype))
            .should('have.value', fagsakMedPleietrengende.fagsakId);
        cy.get('.fagsakSelectedInfo').within(() => {
            cy.findByText('Pleietrengende:').should('exist');
            cy.findByText(`Navn: ${fagsakMedPleietrengende.pleietrengende.navn}`).should('exist');
            cy.findByText(`Id: ${fagsakMedPleietrengende.pleietrengende.identitetsnummer}`).should('exist');
            cy.findByText('Se fagsak i K9').should('exist');
            cy.get('a').invoke('attr', 'href').should('contain', fagsakMedPleietrengende.fagsakId);
        });
        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Saksnummer/i).should('exist');
            cy.findByText(fagsakMedPleietrengende.fagsakId).should('exist');
            cy.findByText(/Pleietrengendes ID/i).should('exist');
            cy.findByText(fagsakMedPleietrengende.pleietrengende.identitetsnummer).should('exist');
        });

        cy.get('[data-test-id="journalførOgFortsett"]').should('not.be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('not.be.disabled');
    });

    it('Åpen klassifiser modal med fagsak og pleietrengende fortsett', () => {
        cy.get('[data-test-id="journalførOgFortsett"]').click();

        cy.get('[data-test-id="klassifiserModalHeader"]').should('contain', klassifiserModalHeaderFortsett);
        cy.get('[data-test-id="klassifiseringInfo"]')
            .should('exist')
            .within(() => {
                cy.findByText(/Sakstype/i).should('exist');
                cy.findByText(dokumenttype).should('exist');
                cy.findByText(/Søkers ID/i).should('exist');
                cy.findByText(norskIdent).should('exist');
                cy.findByText(/Saksnummer/i).should('exist');
                cy.findByText(fagsakMedPleietrengende.fagsakId).should('exist');
                cy.findByText(/Periode/i).should('exist');
                cy.findByText(/Pleietrengendes ID/i).should('exist');
                cy.findByText(fagsakMedPleietrengende.pleietrengende.identitetsnummer).should('exist');
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

    it('Åpen klassifiser modal med fagsak og pleietrengende - sett på vent', () => {
        cy.get('[data-test-id="journalførOgVent"]').click();

        cy.get('[data-test-id="klassifiserModalHeader"]').should('contain', klassifiserModalHeaderVent);
        cy.get('[data-test-id="klassifiseringInfo"]')
            .should('exist')
            .within(() => {
                cy.findByText(/Sakstype/i).should('exist');
                cy.findByText(dokumenttype).should('exist');
                cy.findByText(/Søkers ID/i).should('exist');
                cy.findByText(norskIdent).should('exist');
                cy.findByText(/Saksnummer/i).should('exist');
                cy.findByText(fagsakMedPleietrengende.fagsakId).should('exist');
                cy.findByText(/Periode/i).should('exist');
                cy.findByText(/Pleietrengendes ID/i).should('exist');
                cy.findByText(fagsakMedPleietrengende.pleietrengende.identitetsnummer).should('exist');
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

    it('Test velg reservert fagsak med pleietrengende', () => {
        cy.contains('Velg fagsak').should('exist');

        cy.findByLabelText('Velg fagsak')
            .select(getFagsakNavnForSelect(fagsakMedPleietrengendeReservert.fagsakId, dokumenttype, true))
            .should('have.value', fagsakMedPleietrengendeReservert.fagsakId);
        cy.get('.fagsakSelectedInfo').within(() => {
            cy.findByText('Pleietrengende:').should('exist');
            cy.findByText(`Navn: ${fagsakMedPleietrengendeReservert.pleietrengende.navn}`).should('exist');
            cy.findByText(`Id: ${fagsakMedPleietrengendeReservert.pleietrengende.identitetsnummer}`).should('exist');
            cy.findByText('Se fagsak i K9').should('not.exist');
        });
        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Saksnummer/i).should('exist');
            cy.findByText(fagsakMedPleietrengendeReservert.fagsakId).should('exist');
            cy.findByText(/Pleietrengendes ID/i).should('exist');
            cy.findByText(fagsakMedPleietrengendeReservert.pleietrengende.identitetsnummer).should('exist');
        });

        cy.get('[data-test-id="journalførOgFortsett"]').should('not.be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('not.be.disabled');
    });

    it('Åpen klassifiser modal med reservert fagsak og pleietrengende fortsett', () => {
        cy.get('[data-test-id="journalførOgFortsett"]').click();

        cy.get('[data-test-id="klassifiserModalHeader"]').should('contain', klassifiserModalHeaderFortsett);
        cy.get('[data-test-id="klassifiseringInfo"]')
            .should('exist')
            .within(() => {
                cy.findByText(/Sakstype/i).should('exist');
                cy.findByText(dokumenttype).should('exist');
                cy.findByText(/Søkers ID/i).should('exist');
                cy.findByText(norskIdent).should('exist');
                cy.findByText(/Saksnummer/i).should('exist');
                cy.findByText(fagsakMedPleietrengendeReservert.fagsakId).should('exist');
                cy.findByText(/Periode/i).should('exist');
                cy.findByText(/Pleietrengendes ID/i).should('exist');
                cy.findByText(fagsakMedPleietrengendeReservert.pleietrengende.identitetsnummer).should('exist');
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

    it('Åpen klassifiser modal med reservert fagsak og pleietrengende - sett på vent', () => {
        cy.get('[data-test-id="journalførOgVent"]').click();

        cy.get('[data-test-id="klassifiserModalHeader"]').should('contain', klassifiserModalHeaderVent);
        cy.get('[data-test-id="klassifiseringInfo"]')
            .should('exist')
            .within(() => {
                cy.findByText(/Sakstype/i).should('exist');
                cy.findByText(dokumenttype).should('exist');
                cy.findByText(/Søkers ID/i).should('exist');
                cy.findByText(norskIdent).should('exist');
                cy.findByText(/Saksnummer/i).should('exist');
                cy.findByText(fagsakMedPleietrengendeReservert.fagsakId).should('exist');
                cy.findByText(/Periode/i).should('exist');
                cy.findByText(/Pleietrengendes ID/i).should('exist');
                cy.findByText(fagsakMedPleietrengendeReservert.pleietrengende.identitetsnummer).should('exist');
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

    it('Test velg reservert fagsak uten pleietrengende', () => {
        cy.contains('Velg fagsak').should('exist');

        cy.findByLabelText('Velg fagsak')
            .select(getFagsakNavnForSelect(fagsakUtenPleietrengendeReservert.fagsakId, dokumenttype, true))
            .should('have.value', fagsakUtenPleietrengendeReservert.fagsakId);
        cy.get('.fagsakSelectedInfo').within(() => {
            cy.findByText('Pleietrengende:').should('exist');
            cy.findByText('ikke satt').should('exist');
            cy.findByText('Se fagsak i K9').should('not.exist');
        });
        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Saksnummer/i).should('exist');
            cy.findByText(fagsakUtenPleietrengendeReservert.fagsakId).should('exist');
            cy.findByText(/Pleietrengendes ID/i).should('not.exist');
        });

        cy.get('[data-test-id="journalførOgFortsett"]').should('be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('not.be.disabled');
    });

    it('PSB Åpen klassifiser modal med reservert fagsak uten pleietrengende - sett på vent', () => {
        cy.get('[data-test-id="journalførOgVent"]').click();

        cy.get('[data-test-id="klassifiserModalHeader"]').should('contain', klassifiserModalHeaderVent);
        cy.get('[data-test-id="klassifiseringInfo"]')
            .should('exist')
            .within(() => {
                cy.findByText(/Sakstype/i).should('exist');
                cy.findByText(dokumenttype).should('exist');
                cy.findByText(/Søkers ID/i).should('exist');
                cy.findByText(norskIdent).should('exist');
                cy.findByText(/Saksnummer/i).should('exist');
                cy.findByText(fagsakUtenPleietrengendeReservert.fagsakId).should('exist');
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

    it('Reserver saksnummer til ny fagsak', () => {
        cy.findByLabelText('Reserver saksnummer til ny fagsak').check();

        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Saksnummer/i).should('not.exist');
            cy.findByText(fagsakUtenPleietrengendeReservert.fagsakId).should('not.exist');
        });

        cy.get('[data-test-id="journalførOgFortsett"]').should('be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('be.disabled');
    });

    it('Test reserver fagsak med pleietrengende', () => {
        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Pleietrengendes ID/i).should('not.exist');
        });

        cy.get('[data-test-id="journalførOgFortsett"]').should('be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('be.disabled');

        cy.findByLabelText('Pleietrengendes fødselsnummer').should('exist').type(pleietrengende);

        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Pleietrengendes ID/i).should('exist');
            cy.findByText(pleietrengende).should('exist');
        });

        cy.get('[data-test-id="jornalførUtenFagsak"]').should('exist');

        cy.get('[data-test-id="journalførOgFortsett"]').should('not.be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('not.be.disabled');
    });

    it('Åpen klassifiser modal fortsett med reserver fagsak og pleietrengende', () => {
        cy.get('[data-test-id="journalførOgFortsett"]').click();

        cy.get('[data-test-id="klassifiserModalHeader"]').should('contain', klassifiserModalHeaderFortsett);
        cy.get('[data-test-id="klassifiseringInfo"]')
            .should('exist')
            .within(() => {
                cy.findByText(/Sakstype/i).should('exist');
                cy.findByText(dokumenttype).should('exist');
                cy.findByText(/Søkers ID/i).should('exist');
                cy.findByText(norskIdent).should('exist');
                cy.findByText(/Saksnummer/i).should('not.exist');
                cy.findByText(/Periode/i).should('not.exist');
                cy.findByText(/Pleietrengendes ID/i).should('exist');
                cy.findByText(pleietrengende).should('exist');
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

    it('Åpen klassifiser modal sett på vent med reserver fagsak og pleietrengende', () => {
        cy.get('[data-test-id="journalførOgVent"]').click();

        cy.get('[data-test-id="klassifiserModalHeader"]').should('contain', klassifiserModalHeaderVent);
        cy.get('[data-test-id="klassifiseringInfo"]')
            .should('exist')
            .within(() => {
                cy.findByText(/Sakstype/i).should('exist');
                cy.findByText(dokumenttype).should('exist');
                cy.findByText(/Søkers ID/i).should('exist');
                cy.findByText(norskIdent).should('exist');
                cy.findByText(/Saksnummer/i).should('not.exist');
                cy.findByText(/Periode/i).should('not.exist');
                cy.findByText(/Pleietrengendes ID/i).should('exist');
                cy.findByText(pleietrengende).should('exist');
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

    it('Test Pleietrengende har ikke fødselsnummer', () => {
        cy.findByLabelText('Pleietrengende har ikke fødselsnummer').check();

        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Pleietrengendes ID/i).should('not.exist');
            cy.findByText(pleietrengende).should('not.exist');
        });

        cy.get('[data-test-id="pleietrengendeHarIkkeFnrInformasjon"]').should('exist');

        cy.get('[data-test-id="journalførOgFortsett"]').should('be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('not.be.disabled');
    });

    it('Åpen klassifiser modal sett på vent med reserver fagsak og Pleietrengende har ikke fødselsnummer ', () => {
        cy.get('[data-test-id="journalførOgVent"]').click();

        cy.get('[data-test-id="klassifiserModalHeader"]').should('contain', klassifiserModalHeaderVent);
        cy.get('[data-test-id="klassifiseringInfo"]')
            .should('exist')
            .within(() => {
                cy.findByText(/Sakstype/i).should('exist');
                cy.findByText(dokumenttype).should('exist');
                cy.findByText(/Søkers ID/i).should('exist');
                cy.findByText(norskIdent).should('exist');
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

    it('Test at state fjernet etter avbekreft søker', () => {
        cy.findByText(/Nei/i).should('exist').click();
        cy.findByLabelText('Velg fagsak').should('not.exist');
        cy.findByLabelText('Reserver saksnummer til ny fagsak').should('not.exist');
        cy.findByLabelText('Pleietrengendes fødselsnummer').should('not.exist');
        cy.findByLabelText('Pleietrengende har ikke fødselsnummer').should('not.exist');
        cy.get('[data-test-id="pleietrengendeHarIkkeFnrInformasjon"]').should('not.exist');
        cy.get('[data-test-id="journalførOgFortsett"]').should('be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('be.disabled');
    });

    it('Test ny søker og fagsak med pleietrengende', () => {
        cy.findByLabelText('Søkers fødselsnummer eller D-nummer:').should('exist').type(fnrNySøker);
        cy.findByLabelText('Reserver saksnummer til ny fagsak').click();
        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Søkers ID/i).should('exist');
            cy.findByText(fnrNySøker).should('exist');
        });

        cy.findByLabelText('Velg fagsak')
            .select(getFagsakNavnForSelect(fagsakMedPleietrengende.fagsakId, dokumenttype))
            .should('have.value', fagsakMedPleietrengende.fagsakId);

        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Pleietrengendes ID/i).should('exist');
            cy.findByText(fagsakMedPleietrengende.pleietrengende.identitetsnummer).should('exist');
            cy.findByText(/Saksnummer/i).should('exist');
            cy.findByText(fagsakMedPleietrengende.fagsakId).should('exist');
        });

        cy.get('[data-test-id="journalførOgFortsett"]').should('not.be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('not.be.disabled');
    });
    it('Åpen klassifiser modal fortsett med ny søker fagsak med pleietrengende', () => {
        cy.get('[data-test-id="journalførOgFortsett"]').click();

        cy.get('[data-test-id="klassifiserModalHeader"]').should('contain', klassifiserModalHeaderFortsett);
        cy.get('[data-test-id="klassifiseringInfo"]')
            .should('exist')
            .within(() => {
                cy.findByText(/Sakstype/i).should('exist');
                cy.findByText(dokumenttype).should('exist');
                cy.findByText(/Søkers ID/i).should('exist');
                cy.findByText(fnrNySøker).should('exist');
                cy.findByText(/Saksnummer/i).should('exist');
                cy.findByText(fagsakMedPleietrengende.fagsakId).should('exist');
                cy.findByText(/Periode/i).should('exist');
                cy.findByText(/Pleietrengendes ID/i).should('exist');
                cy.findByText(fagsakMedPleietrengende.pleietrengende.identitetsnummer).should('exist');
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

    it('Åpen klassifiser modal sett på vent med ny søker og fagsak med pleietrengende', () => {
        cy.get('[data-test-id="journalførOgVent"]').click();

        cy.get('[data-test-id="klassifiserModalHeader"]').should('contain', klassifiserModalHeaderVent);
        cy.get('[data-test-id="klassifiseringInfo"]')
            .should('exist')
            .within(() => {
                cy.findByText(/Sakstype/i).should('exist');
                cy.findByText(dokumenttype).should('exist');
                cy.findByText(/Søkers ID/i).should('exist');
                cy.findByText(fnrNySøker).should('exist');
                cy.findByText(/Saksnummer/i).should('exist');
                cy.findByText(fagsakMedPleietrengende.fagsakId).should('exist');
                cy.findByText(/Periode/i).should('exist');
                cy.findByText(/Pleietrengendes ID/i).should('exist');
                cy.findByText(fagsakMedPleietrengende.pleietrengende.identitetsnummer).should('exist');
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

    it('Test bekreft søker på nytt og pleietrengende fjernet fra state', () => {
        cy.findByText(/Ja/i).should('exist').click();

        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Søkers ID/i).should('exist');
            cy.findByText(fnrNySøker).should('not.exist');
        });

        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Pleietrengendes ID/i).should('not.exist');
            cy.findByText(fagsakMedPleietrengende.pleietrengende.identitetsnummer).should('not.exist');
        });

        cy.wait(30);
        cy.get('[data-test-id="journalførOgFortsett"]').should('be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('be.disabled');
    });

    it('Test to søkere i journalposten', () => {
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

        cy.findByLabelText('Reserver saksnummer til ny fagsak').click();

        cy.findByLabelText('Pleietrengendes fødselsnummer').should('exist').type(pleietrengende);

        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Pleietrengendes ID/i).should('exist');
            cy.findByText(pleietrengende).should('exist');
        });

        cy.get('[data-test-id="toSøkereIngenPleietrengende"]').should('not.exist');

        cy.get('[data-test-id="jornalførUtenFagsak"]').should('exist');

        cy.get('[data-test-id="journalførOgFortsett"]').should('not.be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('not.be.disabled');
    });

    it('Åpen klassifiser modal fortsett med med 2 søkere, reserver fagsak og pleietrengende', () => {
        cy.get('[data-test-id="journalførOgFortsett"]').click();

        cy.get('[data-test-id="klassifiserModalHeader"]').should('contain', klassifiserModalHeaderFortsett);
        cy.get('[data-test-id="klassifiseringInfo"]')
            .should('exist')
            .within(() => {
                cy.findByText(/Sakstype/i).should('exist');
                cy.findByText(dokumenttype).should('exist');
                cy.findByText(/Søkers ID/i).should('exist');
                cy.findByText(norskIdent).should('exist');
                cy.findByText(/Saksnummer/i).should('not.exist');
                cy.findByText(/Periode/i).should('not.exist');
                cy.findByText(/Pleietrengendes ID/i).should('exist');
                cy.findByText(pleietrengende).should('exist');
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

    it('Åpen klassifiser modal sett på vent med 2 søkere, reserver fagsak og pleietrengende', () => {
        cy.get('[data-test-id="journalførOgVent"]').click();

        cy.get('[data-test-id="klassifiserModalHeader"]').should('contain', klassifiserModalHeaderVent);
        cy.get('[data-test-id="klassifiseringInfo"]')
            .should('exist')
            .within(() => {
                cy.findByText(/Sakstype/i).should('exist');
                cy.findByText(dokumenttype).should('exist');
                cy.findByText(/Søkers ID/i).should('exist');
                cy.findByText(norskIdent).should('exist');
                cy.findByText(/Saksnummer/i).should('not.exist');
                cy.findByText(/Periode/i).should('not.exist');
                cy.findByText(/Pleietrengendes ID/i).should('exist');
                cy.findByText(pleietrengende).should('exist');
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

describe(`Fordeling ${dokumenttype} søker uten fagsaker`, { testIsolation: false }, () => {
    it('PSB intercept hent fagsaker', () => {
        cy.visit(`/journalpost/${journalpostId}`);
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

    it('Test uten fagsaker med pleitrengende', () => {
        cy.findByLabelText('Pleietrengendes fødselsnummer').should('exist').type(pleietrengende);

        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Pleietrengendes ID/i).should('exist');
            cy.findByText(pleietrengende).should('exist');
        });

        cy.get('[data-test-id="jornalførUtenFagsak"]').should('exist');

        cy.get('[data-test-id="journalførOgFortsett"]').should('not.be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('not.be.disabled');
    });

    it('PSB Test uten fagsaker og Pleietrengende har ikke fødselsnummer', () => {
        cy.findByLabelText('Pleietrengende har ikke fødselsnummer').check();

        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Pleietrengendes ID/i).should('not.exist');
            cy.findByText(pleietrengende).should('not.exist');
        });

        cy.get('[data-test-id="pleietrengendeHarIkkeFnrInformasjon"]').should('exist');

        cy.get('[data-test-id="journalførOgFortsett"]').should('be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('not.be.disabled');
    });
});
