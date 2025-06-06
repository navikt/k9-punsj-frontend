import { ApiPath } from 'app/apiConfig';
import { http, HttpResponse } from 'msw';
import { getFagsakNavnForSelect } from '../../utils/utils';
import journalpost from '../../fixtures/jpOMPMA304.json';
import fagsaker from '../../fixtures/fagsaker.json';

const dokumenttype = 'Ekstra omsorgsdager midlertidig alene';
const valgteDokumentType = 'Ekstra omsorgsdager når du er midlertidig alene om omsorgen';
const valgteDokumentTypeKode = 'OMSORGSPENGER_MA';
const journalpostId = journalpost.journalpostId;
const norskIdent = journalpost.norskIdent;
const fnrAnnenPart = '02021477330';
const fnrNySøker = '12448325820';
const annenSøkerFnr = '02918496664';
const fagsak = fagsaker[18];
const fagsakReservert = fagsaker[19];

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

    it('Test bekreft søker og velg fagsak', () => {
        cy.findByText(/Ja/i).should('exist').click();
        cy.contains('Velg fagsak').should('exist');

        cy.findByLabelText('Velg fagsak')
            .select(getFagsakNavnForSelect(fagsak.fagsakId, dokumenttype))
            .should('have.value', fagsak.fagsakId);
        cy.get('.fagsakSelectedInfo').within(() => {
            cy.findByText('Annen part:').should('exist');
            cy.findByText(`Navn: ${fagsak.relatertPerson.navn}`).should('exist');
            cy.findByText(`Id: ${fagsak.relatertPerson.identitetsnummer}`).should('exist');
            cy.findByText('Se fagsak i K9').should('exist');
            cy.get('a').invoke('attr', 'href').should('contain', fagsak.fagsakId);
        });
        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Saksnummer/i).should('exist');
            cy.findByText(fagsak.fagsakId).should('exist');
            cy.findByText(/Annen part ID:/i).should('exist');
            cy.findByText(fagsak.relatertPerson.identitetsnummer).should('exist');
        });

        cy.findByLabelText('Fødselsnummer annen part:').should('not.exist');

        cy.get('[data-test-id="journalførOgFortsett"]').should('not.be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('not.be.disabled');
    });

    it('Åpne klassifiser modal med fagsak fortsett', () => {
        cy.get('[data-test-id="journalførOgFortsett"]').click();

        cy.get('[data-test-id="klassifiserModalHeader"]').should('contain', klassifiserModalHeaderFortsett);
        cy.get('[data-test-id="klassifiseringInfo"]')
            .should('exist')
            .within(() => {
                cy.findByText(/Sakstype/i).should('exist');
                cy.findByText(dokumenttype).should('exist');
                cy.findByText(/Søkers ID/i).should('exist');
                cy.findByText(norskIdent).should('exist');
                cy.findByText(/Annen part ID:/i).should('exist');
                cy.findByText(fagsak.relatertPerson.identitetsnummer).should('exist');
                cy.findByText(/Saksnummer/i).should('exist');
                cy.findByText(fagsak.fagsakId).should('exist');
                cy.findByText(/Periode/i).should('exist');
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

    it('Åpne klassifiser modal med fagsak - sett på vent', () => {
        cy.get('[data-test-id="journalførOgVent"]').click();

        cy.get('[data-test-id="klassifiserModalHeader"]').should('contain', klassifiserModalHeaderVent);
        cy.get('[data-test-id="klassifiseringInfo"]')
            .should('exist')
            .within(() => {
                cy.findByText(/Sakstype/i).should('exist');
                cy.findByText(dokumenttype).should('exist');
                cy.findByText(/Søkers ID/i).should('exist');
                cy.findByText(norskIdent).should('exist');
                cy.findByText(/Annen part ID:/i).should('exist');
                cy.findByText(fagsak.relatertPerson.identitetsnummer).should('exist');
                cy.findByText(/Saksnummer/i).should('exist');
                cy.findByText(fagsak.fagsakId).should('exist');
                cy.findByText(/Periode/i).should('exist');
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

    it('Test velg reservert fagsak', () => {
        cy.contains('Velg fagsak').should('exist');

        cy.findByLabelText('Velg fagsak')
            .select(getFagsakNavnForSelect(fagsakReservert.fagsakId, dokumenttype, true))
            .should('have.value', fagsakReservert.fagsakId);
        cy.get('.fagsakSelectedInfo').within(() => {
            cy.findByText('Annen part:').should('exist');
            cy.findByText(`Navn: ${fagsakReservert.relatertPerson.navn}`).should('exist');
            cy.findByText(`Id: ${fagsakReservert.relatertPerson.identitetsnummer}`).should('exist');
            cy.findByText('Se fagsak i K9').should('not.exist');
        });
        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Saksnummer/i).should('exist');
            cy.findByText(fagsakReservert.fagsakId).should('exist');
            cy.findByText(/Annen part ID:/i).should('exist');
            cy.findByText(fagsakReservert.relatertPerson.identitetsnummer).should('exist');
        });

        cy.get('[data-test-id="journalførOgFortsett"]').should('not.be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('not.be.disabled');
    });

    it('Åpne klassifiser modal med reservert fagsak - fortsett', () => {
        cy.get('[data-test-id="journalførOgFortsett"]').click();

        cy.get('[data-test-id="klassifiserModalHeader"]').should('contain', klassifiserModalHeaderFortsett);
        cy.get('[data-test-id="klassifiseringInfo"]')
            .should('exist')
            .within(() => {
                cy.findByText(/Sakstype/i).should('exist');
                cy.findByText(dokumenttype).should('exist');
                cy.findByText(/Søkers ID/i).should('exist');
                cy.findByText(norskIdent).should('exist');
                cy.findByText(/Annen part ID:/i).should('exist');
                cy.findByText(fagsakReservert.relatertPerson.identitetsnummer).should('exist');
                cy.findByText(/Saksnummer/i).should('exist');
                cy.findByText(fagsakReservert.fagsakId).should('exist');
                cy.findByText(/Periode/i).should('exist');
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

    it('Åpne klassifiser modal med reservert fagsak - sett på vent', () => {
        cy.get('[data-test-id="journalførOgVent"]').click();

        cy.get('[data-test-id="klassifiserModalHeader"]').should('contain', klassifiserModalHeaderVent);
        cy.get('[data-test-id="klassifiseringInfo"]')
            .should('exist')
            .within(() => {
                cy.findByText(/Sakstype/i).should('exist');
                cy.findByText(dokumenttype).should('exist');
                cy.findByText(/Søkers ID/i).should('exist');
                cy.findByText(norskIdent).should('exist');
                cy.findByText(/Annen part ID:/i).should('exist');
                cy.findByText(fagsakReservert.relatertPerson.identitetsnummer).should('exist');
                cy.findByText(/Saksnummer/i).should('exist');
                cy.findByText(fagsakReservert.fagsakId).should('exist');
                cy.findByText(/Periode/i).should('exist');
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
            cy.findByText(fagsakReservert.fagsakId).should('not.exist');
            cy.findByText(/Annen part ID:/i).should('not.exist');
        });
        cy.findByLabelText('Fødselsnummer annen part:').should('exist');

        cy.get('[data-test-id="journalførOgFortsett"]').should('be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('be.disabled');
    });

    it('Test fyll ut annen part', () => {
        cy.findByLabelText('Fødselsnummer annen part:').type(fnrAnnenPart);

        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Annen part ID:/i).should('exist');
            cy.findByText(fnrAnnenPart).should('exist');
        });

        cy.get('[data-test-id="journalførOgFortsett"]').should('not.be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('not.be.disabled');

        cy.get('[data-test-id="jornalførUtenFagsak"]').should('exist');

        cy.get('[data-test-id="journalførOgFortsett"]').should('not.be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('not.be.disabled');
    });

    it('Åpne klassifiser modal fortsett med reserver fagsak og ny annen part', () => {
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
                cy.findByText(/Annen part ID:/i).should('exist');
                cy.findByText(fnrAnnenPart).should('exist');
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
                cy.findByText(/Annen part ID:/i).should('exist');
                cy.findByText(fnrAnnenPart).should('exist');
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
        cy.findByLabelText('Fødselsnummer annen part:').should('exist');

        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Annen part ID:/i).should('exist');
            cy.findByText(fnrAnnenPart).should('exist');
        });

        cy.get('[data-test-id="journalførOgFortsett"]').should('be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('be.disabled');
    });

    it('Test ny søker', () => {
        cy.findByLabelText('Søkers fødselsnummer eller D-nummer:').should('exist').type(fnrNySøker);
        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Søkers ID/i).should('exist');
            cy.findByText(fnrNySøker).should('exist');
        });

        cy.get('[data-test-id="jornalførUtenFagsak"]').should('exist');

        cy.get('[data-test-id="journalførOgFortsett"]').should('not.be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('not.be.disabled');
    });

    it('Åpne klassifiser modal fortsett med ny søker, reserver fagsak', () => {
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
                cy.findByText(/Annen part ID:/i).should('exist');
                cy.findByText(fnrAnnenPart).should('exist');
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

    it('Åpne klassifiser modal sett på vent med ny søker, reserver fagsak', () => {
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
                cy.findByText(/Annen part ID:/i).should('exist');
                cy.findByText(fnrAnnenPart).should('exist');
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

    it('Test uten fagsaker', () => {
        cy.findByLabelText('Fødselsnummer annen part:').type(fnrAnnenPart);

        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Annen part ID:/i).should('exist');
            cy.findByText(fnrAnnenPart).should('exist');
        });

        cy.get('[data-test-id="jornalførUtenFagsak"]').should('exist');

        cy.get('[data-test-id="journalførOgFortsett"]').should('not.be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('not.be.disabled');
    });
});

describe(`Fordeling ${dokumenttype} 2 søkere i journalpost`, { testIsolation: false }, () => {
    it('Åpne journalpost', () => {
        cy.visit(`/journalpost/${journalpostId}`);
        Cypress.config('viewportWidth', 1280);
        Cypress.config('viewportHeight', 1450);

        cy.findByText(valgteDokumentType).should('exist').click();
        cy.findByText(/Skjul/i).should('exist').click();
    });

    it('Test to søkere i journalposten', () => {
        cy.findByText(/Ja/i).should('exist').click();

        cy.findByLabelText('Det finnes informasjon om to søkere i journalposten (gjelder kun papirsøknad)')
            .should('exist')
            .check();

        cy.get('[data-test-id="infoOmRegisteringAvToSokere"]').should('exist');
        cy.get('[data-test-id="toSøkereIngenAnnenSøker"]').should('exist');
        cy.get('[data-test-id="toSøkereIngenAnnenPartMA"]').should('not.exist');

        cy.findByLabelText('Fødselsnummer annen søker:').should('exist').type(annenSøkerFnr);

        cy.get('[data-test-id="toSøkereIngenAnnenSøker"]').should('not.exist');
        cy.get('[data-test-id="toSøkereIngenAnnenPartMA"]').should('exist');

        cy.get('[data-test-id="journalførOgFortsett"]').should('be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('be.disabled');

        cy.findByLabelText('Reserver saksnummer til ny fagsak').check();

        cy.findByLabelText('Fødselsnummer annen part:').type(fnrAnnenPart);

        cy.get('[data-test-id="jornalførUtenFagsak"]').should('exist');

        cy.get('[data-test-id="journalførOgFortsett"]').should('not.be.disabled');
        cy.get('[data-test-id="journalførOgVent"]').should('not.be.disabled');
    });

    it('Åpne klassifiser modal fortsett med med 2 søkere, reserver saksnummer til ny fagsak', () => {
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
