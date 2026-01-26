import { ApiPath } from 'app/apiConfig';
import { http, HttpResponse } from 'msw';
import { getFagsakNavnForSelect, getBarnInfoForSelect } from '../../utils/utils';
import journalpost from '../../fixtures/jpPSB300.json';
import fagsaker from '../../fixtures/fagsaker.json';
import barnFraApi from '../../fixtures/barn.json';
import ferdistiltJournalpostUtenBarn from '../../fixtures/jpPSB312.json';

const dokumenttype = 'Pleiepenger sykt barn';
const valgteDokumentType = 'Pleiepenger sykt barn';
const valgteDokumentTypeKode = 'PLEIEPENGER';
const journalpostId = journalpost.journalpostId;
const norskIdent = journalpost.norskIdent;
const barn1FraApi = barnFraApi.barn[0];
const barn3FraApi = barnFraApi.barn[2];
const fnrBarnIkkeFraList = '02021477330';
const fnrNySøker = '12448325820';
const annenSøkerFnr = '02918496664';
const fagsakUtenBarn = fagsaker[0];
const fagsakMedBarn = fagsaker[2];
const fagsakMedBarnReservert = fagsaker[3];
const fagsakUtenBarnReservert = fagsaker[4];

const klassifiserModalHeaderVent = 'Vil du lagre følgende informasjon til journalposten og sett på vent?';
const klassifiserModalHeaderFortsett = 'Vil du lagre følgende informasjon til journalposten?';

const klassifiserModalAlertInfoKanIkkeEndres = 'Informasjonen kan ikke endres etter journalposten er journalført.';

describe(`Fordeling ${dokumenttype}`, { testIsolation: false }, () => {
    it(`Åpne journalpost ${journalpostId} fra LOS`, () => {
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

    it('Åpne klassifiser modal med fagsak uten barn - sett på vent', () => {
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
                cy.findByText(fagsakUtenBarn.fagsakId).should('exist');
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

    it('Åpne klassifiser modal med fagsak og barn fortsett', () => {
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
                cy.findByText(fagsakMedBarn.fagsakId).should('exist');
                cy.findByText(/Periode/i).should('exist');
                cy.findByText(/Pleietrengendes ID/i).should('exist');
                cy.findByText(fagsakMedBarn.pleietrengende.identitetsnummer).should('exist');
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

    it('Åpne klassifiser modal med fagsak og barn - sett på vent', () => {
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
                cy.findByText(fagsakMedBarn.fagsakId).should('exist');
                cy.findByText(/Periode/i).should('exist');
                cy.findByText(/Pleietrengendes ID/i).should('exist');
                cy.findByText(fagsakMedBarn.pleietrengende.identitetsnummer).should('exist');
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

    it('Åpne klassifiser modal med reservert fagsak og barn fortsett', () => {
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
                cy.findByText(fagsakMedBarnReservert.fagsakId).should('exist');
                cy.findByText(/Periode/i).should('exist');
                cy.findByText(/Pleietrengendes ID/i).should('exist');
                cy.findByText(fagsakMedBarnReservert.pleietrengende.identitetsnummer).should('exist');
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

    it('Åpne klassifiser modal med reservert fagsak og barn - sett på vent', () => {
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
                cy.findByText(fagsakMedBarnReservert.fagsakId).should('exist');
                cy.findByText(/Periode/i).should('exist');
                cy.findByText(/Pleietrengendes ID/i).should('exist');
                cy.findByText(fagsakMedBarnReservert.pleietrengende.identitetsnummer).should('exist');
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

    it('Åpne klassifiser modal med reservert fagsak uten barn - sett på vent', () => {
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
                cy.findByText(fagsakUtenBarnReservert.fagsakId).should('exist');
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

    it('Åpne klassifiser modal fortsett med reserver fagsak og barn fra liste', () => {
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
                cy.findByText(barn1FraApi.identitetsnummer).should('exist');
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

    it('Åpne klassifiser modal sett på vent med reserver fagsak og barn fra liste', () => {
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
                cy.findByText(barn1FraApi.identitetsnummer).should('exist');
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

    it('Åpne klassifiser modal fortsett med reserver fagsak og annet barn', () => {
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

    it('Åpne klassifiser modal sett på vent med reserver fagsak og og annet barn', () => {
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

    it('Åpne klassifiser modal sett på vent med reserver fagsak og Pleietrengende har ikke fødselsnummer ', () => {
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
        cy.findByLabelText('Pleietrengendes fødselsnummer:').should('not.exist');
        cy.findByLabelText('Pleietrengende har ikke fødselsnummer').should('not.exist');
        cy.get('[data-test-id="pleietrengendeHarIkkeFnrInformasjon"]').should('not.exist');
        cy.get('[data-test-id="journalførOgFortsett"]').should('be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('be.disabled');
    });

    it('Test ny søker og barn', () => {
        cy.findByLabelText('Søkers fødselsnummer eller D-nummer:').should('exist').type(fnrNySøker);
        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Søkers ID/i).should('exist');
            cy.findByText(fnrNySøker).should('exist');
        });
        cy.findByLabelText('Velg hvilket barn det gjelder')
            .select(getBarnInfoForSelect(barn1FraApi))
            .should('have.value', barn1FraApi.identitetsnummer);

        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Barnets ID/i).should('exist');
            cy.findByText(barn1FraApi.identitetsnummer).should('exist');
        });

        cy.get('[data-test-id="jornalførUtenFagsak"]').should('exist');

        cy.get('[data-test-id="journalførOgFortsett"]').should('not.be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('not.be.disabled');
    });

    it('Åpne klassifiser modal fortsett med ny søker, reserver fagsak og barn fra liste', () => {
        cy.get('[data-test-id="journalførOgFortsett"]').click();

        cy.get('[data-test-id="klassifiserModalHeader"]').should('contain', klassifiserModalHeaderFortsett);
        cy.get('[data-test-id="klassifiseringInfo"]')
            .should('exist')
            .within(() => {
                cy.findByText(/Sakstype/i).should('exist');
                cy.findByText(dokumenttype).should('exist');
                cy.findByText(/Søkers ID/i).should('exist');
                cy.findByText(fnrNySøker).should('exist');
                cy.findByText(/Saksnummer/i).should('not.exist');
                cy.findByText(/Periode/i).should('not.exist');
                cy.findByText(/Pleietrengendes ID/i).should('exist');
                cy.findByText(barn1FraApi.identitetsnummer).should('exist');
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

    it('Åpne klassifiser modal sett på vent med ny søker, reserver fagsak og barn fra liste', () => {
        cy.get('[data-test-id="journalførOgVent"]').click();

        cy.get('[data-test-id="klassifiserModalHeader"]').should('contain', klassifiserModalHeaderVent);
        cy.get('[data-test-id="klassifiseringInfo"]')
            .should('exist')
            .within(() => {
                cy.findByText(/Sakstype/i).should('exist');
                cy.findByText(dokumenttype).should('exist');
                cy.findByText(/Søkers ID/i).should('exist');
                cy.findByText(fnrNySøker).should('exist');
                cy.findByText(/Saksnummer/i).should('not.exist');
                cy.findByText(/Periode/i).should('not.exist');
                cy.findByText(/Pleietrengendes ID/i).should('exist');
                cy.findByText(barn1FraApi.identitetsnummer).should('exist');
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
            cy.findByText(/Barnets ID/i).should('not.exist');
            cy.findByText(barn1FraApi.identitetsnummer).should('not.exist');
        });

        cy.get('[data-test-id="journalførOgFortsett"]').should('be.disabled');
        // TODO: Må være disabled og fungerer ikke i test
        // cy.get('[data-test-id="journalførOgVent"]').should('be.disabled');
    });

    it('Test to søkere i journalposten', () => {
        cy.findByLabelText('Det finnes informasjon om to søkere i journalposten (gjelder kun papirsøknad)')
            .should('exist')
            .check();

        cy.get('[data-test-id="infoOmRegisteringAvToSokere"]').should('exist');
        cy.get('[data-test-id="toSøkereIngenAnnenSøker"]').should('exist');

        cy.findByLabelText('Fødselsnummer annen søker:').should('exist').type(annenSøkerFnr);

        cy.get('[data-test-id="toSøkereIngenAnnenSøker"]').should('not.exist');
        cy.get('[data-test-id="toSøkereIngenPleietrengende"]').should('exist');

        cy.get('[data-test-id="journalførOgFortsett"]').should('be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('be.disabled');

        cy.findByLabelText('Velg hvilket barn det gjelder')
            .select(getBarnInfoForSelect(barn1FraApi))
            .should('have.value', barn1FraApi.identitetsnummer);

        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Barnets ID/i).should('exist');
            cy.findByText(barn1FraApi.identitetsnummer).should('exist');
        });
        cy.get('[data-test-id="toSøkereIngenPleietrengende"]').should('not.exist');

        cy.get('[data-test-id="jornalførUtenFagsak"]').should('exist');

        cy.get('[data-test-id="journalførOgFortsett"]').should('not.be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('not.be.disabled');
    });

    it('Åpne klassifiser modal fortsett med med 2 søkere, reserver fagsak og barn fra liste', () => {
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
                cy.findByText(barn1FraApi.identitetsnummer).should('exist');
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

    it('Åpne klassifiser modal sett på vent med 2 søkere, reserver fagsak og barn fra liste', () => {
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
                cy.findByText(barn1FraApi.identitetsnummer).should('exist');
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
    it('Intercept hent fagsaker', () => {
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

    it('Test uten fagsaker med barn fra liste', () => {
        cy.findByLabelText('Velg hvilket barn det gjelder')
            .select(getBarnInfoForSelect(barn1FraApi))
            .should('have.value', barn1FraApi.identitetsnummer);

        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Barnets ID/i).should('exist');
            cy.findByText(barn1FraApi.identitetsnummer).should('exist');
        });

        cy.get('[data-test-id="jornalførUtenFagsak"]').should('exist');

        cy.get('[data-test-id="journalførOgFortsett"]').should('not.be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('not.be.disabled');
    });

    it('Test uten fagsaker med annet barn', () => {
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

    it('Test uten fagsaker og Pleietrengende har ikke fødselsnummer', () => {
        cy.findByLabelText('Pleietrengende har ikke fødselsnummer').check();

        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Barnets ID/i).should('not.exist');
            cy.findByText(fnrBarnIkkeFraList).should('not.exist');
        });

        cy.get('[data-test-id="pleietrengendeHarIkkeFnrInformasjon"]').should('exist');

        cy.get('[data-test-id="journalførOgFortsett"]').should('be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('not.be.disabled');
    });

    it('Intercept hent barn', () => {
        cy.window().then((window) => {
            const { worker } = window.msw;
            worker.use(http.get(ApiPath.BARN_GET, () => HttpResponse.json({ barn: [] }, { status: 200 })));
        });

        // Clear hent barn på nytt
        cy.findByText(/Nei/i).should('exist').click();
        cy.findByText(/Ja/i).should('exist').click();
    });

    it('Test uten fagsaker, uten barn liste med annet barn', () => {
        cy.findByLabelText('Velg hvilket barn det gjelder').should('not.exist');
        cy.findByLabelText('Pleietrengendes fødselsnummer:').should('exist').type(fnrBarnIkkeFraList);

        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Barnets ID/i).should('exist');
            cy.findByText(fnrBarnIkkeFraList).should('exist');
        });

        cy.get('[data-test-id="jornalførUtenFagsak"]').should('exist');

        cy.get('[data-test-id="journalførOgFortsett"]').should('not.be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('not.be.disabled');
    });

    it('Test uten fagsaker, uten barn liste og Pleietrengende har ikke fødselsnummer', () => {
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

describe(`Fordeling ${dokumenttype} søker uten liste med barn`, { testIsolation: false }, () => {
    it('Intercept hent barn', () => {
        cy.visit(`/journalpost/${journalpostId}`);

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

    it('Test søker uten barn liste med annet barn', () => {
        cy.findByLabelText('Pleietrengendes fødselsnummer:').should('exist').type(fnrBarnIkkeFraList);

        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Barnets ID/i).should('exist');
            cy.findByText(fnrBarnIkkeFraList).should('exist');
        });

        cy.get('[data-test-id="journalførOgFortsett"]').should('not.be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('not.be.disabled');
    });

    it('Test søker uten barn liste og Pleietrengende har ikke fødselsnummer', () => {
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

describe(`Fordeling ${dokumenttype} - ferdistilt jp uten pleietrengende`, { testIsolation: false }, () => {
    it(`Åpne journalpost ${ferdistiltJournalpostUtenBarn.journalpostId} fra LOS`, () => {
        cy.visit(`/journalpost/${ferdistiltJournalpostUtenBarn.journalpostId}`);
        Cypress.config('viewportWidth', 1280);
        Cypress.config('viewportHeight', 1450);
    });

    it('Skjul dokument vindu', () => {
        cy.findByText(/Skjul/i).should('exist').click();
    });

    it('Test vises info om at journalpost ferdistilt uten pleietrengende', () => {
        cy.findByText(/Journalposten er journalført, men mangler opplysninger om pleietrengende./i).should('exist');
    });

    it('Test at det valgte riktig dokumenttype', () => {
        cy.get('[data-test-id="dokumenttypeRadioPanelPleiepenger"]').should('not.be.disabled').should('be.checked');
    });

    it('Test at andre dokumenttyper er disabled', () => {
        cy.get('[data-test-id="dokumenttypeRadioPanelOmsorgspenger"]').should('be.disabled');
        cy.get('[data-test-id="dokumenttypeRadioPanelPleiepengerILivetsSluttfase"]').should('be.disabled');
        cy.get('[data-test-id="dokumenttypeRadioPanelAnnet"]').should('be.disabled');
        // cy.get('[data-test-id="dokumenttypeRadioPanelOpplæringspenger"]').should('be.disabled');
    });

    it('Test at søker bekrefted', () => {
        cy.get('[data-test-id="bekreftSøker-ja"]').should('not.be.disabled').should('be.checked');
        cy.get('[data-test-id="bekreftSøker-nei"]').should('be.disabled').should('not.be.checked');
    });

    it('Test at det vises ikke knapper jornalfør', () => {
        cy.get('[data-test-id="journalførOgFortsett"]').should('not.exist');
        cy.get('[data-test-id="journalførOgVent"]').should('not.exist');
    });

    it('Test at det ikke er mulig å gå videre uten pleietrengende', () => {
        cy.get('[data-test-id="ferdistiltJpReservertSaksnummerVidereBtn"]').should('exist').should('be.disabled');
        cy.get('[data-test-id="ferdistiltJpReservertSaksnummeråpneVentLukkBrevModalBtn"]')
            .should('exist')
            .should('not.be.disabled');
    });

    it('Test at det er mulig å gå videre med pleietrengende', () => {
        cy.findByLabelText('Velg hvilket barn det gjelder')
            .select(getBarnInfoForSelect(barn1FraApi))
            .should('have.value', barn1FraApi.identitetsnummer);
        cy.get('[data-test-id="ferdistiltJpReservertSaksnummerVidereBtn"]').should('exist').should('not.be.disabled');
        cy.get('[data-test-id="ferdistiltJpReservertSaksnummeråpneVentLukkBrevModalBtn"]')
            .should('exist')
            .should('not.be.disabled');
    });

    it('Test at det er ikke mulig å gå videre med pleietrengende som er i eksisterende fagsak', () => {
        cy.findByLabelText('Velg hvilket barn det gjelder')
            .select(getBarnInfoForSelect(barn3FraApi))
            .should('have.value', barn3FraApi.identitetsnummer);
        cy.get('[data-test-id="ferdistiltJpReservertSaksnummerVidereBtn"]').should('not.exist');
        cy.get('[data-test-id="ferdistiltJpReservertSaksnummeråpneVentLukkBrevModalBtn"]').should('not.exist');
    });

    it('Test at det vises alert ved valg av pleietrengende som er i eksisterende fagsak', () => {
        cy.get('[data-test-id="pleietrengendeHarFagsakFerdistiltJpWarning"]').should('exist');
    });

    it('Test at det vises kopier/lukk knapp ved valg av pleietrengende som er i eksisterende fagsak', () => {
        cy.get('[data-test-id="kopierOgLukkJournalpostBtn"]').should('exist').should('not.be.disabled').click();
    });

    it('Test kopier/lukk jp med kopier feil', () => {
        cy.findByText(/Vil du kopiere og lukke journalposten?/i).should('exist');
        cy.findByText(/Den nye Journalposten vil bli kopiert og journalført mot eksisterende fagsak/i).should('exist');
        cy.findByText(barn3FraApi.identitetsnummer).should('exist');
        cy.get('[data-test-id="kopierModalAvbrytBtn"]').should('exist').should('not.be.disabled');
        cy.get('[data-test-id="kopierModalKopierBtn"]').should('exist').should('not.be.disabled').click();

        cy.get('[data-test-id="kopierJournalpostError"]').should('exist');
    });

    it('Test kopier/lukk jp uten kopier feil med lukk feil', () => {
        cy.window().then((window) => {
            const { worker } = window.msw;
            worker.use(
                http.post(
                    ApiPath.JOURNALPOST_KOPIERE.replace('{journalpostId}', ferdistiltJournalpostUtenBarn.journalpostId),
                    () =>
                        HttpResponse.json(
                            {
                                saksnummer: '1DQAW94',
                            },
                            { status: 202 },
                        ),
                ),
            );
        });

        cy.get('[data-test-id="kopierModalKopierBtn"]').should('exist').should('not.be.disabled').click();

        cy.get('[data-test-id="kopierJournalpostError"]').should('not.exist');

        cy.get('[data-test-id="kopiAvJournalpostOpprettet"]').should('exist');
        cy.get('[data-test-id="kopierModalLukkError"]').should('exist');

        cy.get('[data-test-id="kopierLukkBtn"]').should('exist').should('not.be.disabled');
        cy.get('[data-test-id="kopierTilbakeTilLosBtn"]').should('exist').should('not.be.disabled');
    });

    it('Test kopier/lukk jp', () => {
        cy.window().then((window) => {
            const { worker } = window.msw;
            worker.use(
                http.post(
                    ApiPath.JOURNALPOST_LUKK_OPPGAVE.replace(
                        '{journalpostId}',
                        ferdistiltJournalpostUtenBarn.journalpostId,
                    ),
                    () =>
                        HttpResponse.json(
                            {
                                saksnummer: '1DQAW94',
                            },
                            { status: 200 },
                        ),
                ),
            );
        });
        cy.get('[data-test-id="kopierLukkBtn"]').click();

        cy.get('[data-test-id="kopierModalLukkError"]').should('not.exist');
        cy.get('[data-test-id="kopierLukkBtn"]').should('not.exist');
        cy.get('[data-test-id="kopierModalLukkSuccess"]').should('exist');

        cy.get('[data-test-id="kopierTilbakeTilLosBtn"]').should('exist').should('not.be.disabled').click();

        cy.findByText(/Vil du kopiere og lukke journalposten?/i).should('not.exist');
    });
});
