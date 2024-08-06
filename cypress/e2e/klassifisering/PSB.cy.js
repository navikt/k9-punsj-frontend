import { ApiPath } from 'app/apiConfig';

import { http, HttpResponse } from 'msw';
import { getFagsakNavnForSelect } from '../../utils/utils';
import journalpost from '../../fixtures/jpPSB300.json';
import fagsaker from '../../fixtures/fagsaker.json';

const dokumenttype = 'Pleiepenger sykt barn';
const annenSøkerFnr = '02918496664';

const klassifiserModalAlertFeilKlassifisering = 'Det oppstod en feil ved klassifisering.';
const klassifiserModalAlertFeilKopiering = 'Det oppstod en feil ved kopiering av journalpost.';
const klassifiserModalAlertFeilJfEtterKopiering =
    'Det oppsto en feil under journalføring av journalposten etter kopiering. Trykk Avbryt og prøv journalføre uten annen søker siden journalposten ble kopiert.';
const klassifiserModalAlertFeilSetPåVent = 'Det oppstod en feil når journalpost skulle settes på vent.';
const alertJournalført = 'Journalposten er journalført. Sakstype, søker og saksnummer er lagret til journalpost.';

describe('Test klassifisering PSB feilmeldingene i modal', { testIsolation: false }, () => {
    it('PSB Åpen journalpost 300 fra LOS', () => {
        cy.visit('/journalpost/300');
        Cypress.config('viewportWidth', 1280);
        Cypress.config('viewportHeight', 1450);
        cy.findByText(/Skjul/i).should('exist').click();
    });

    it('PSB Test klassifiser modal feilmelding ved klassifisering', () => {
        cy.findByText(/Ja/i).should('exist').click();

        cy.contains('Velg fagsak').should('exist');

        cy.findByLabelText('Velg fagsak')
            .select(getFagsakNavnForSelect(fagsaker[2].fagsakId, dokumenttype))
            .should('have.value', fagsaker[2].fagsakId);
        cy.get('[data-test-id="journalførOgFortsett"]').click();

        cy.window().then((window) => {
            const { worker } = window.msw;
            worker.use(
                http.post(ApiPath.JOURNALPOST_MOTTAK, () =>
                    HttpResponse.json({ detail: 'Det oppstod en feil ved klassifisering.' }, { status: 500 }),
                ),
            );
        });

        cy.get('[data-test-id="klassifiserModalJournalfør"]').click();

        cy.get('[data-test-id="klassifiserModalAlertBlokk"]')
            .should('exist')
            .within(() => {
                cy.findByText(klassifiserModalAlertFeilKlassifisering).should('exist');
            });
        cy.get('[data-test-id="klassifiserModalAvbryt"]').should('not.be.disabled').click();
        cy.get('[data-test-id="klassifiserModal"]').should('not.exist');
    });

    it('PSB Test klassifiser modal feilmelding ved kopiering med to søkere', () => {
        cy.findByLabelText('Det finnes informasjon om to søkere i journalposten (gjelder kun papirsøknad)').check();

        cy.findByLabelText('Fødselsnummer annen søker:').should('exist').type(annenSøkerFnr);
        cy.get('[data-test-id="journalførOgFortsett"]').click();

        cy.window().then((window) => {
            const { worker } = window.msw;
            worker.use(
                http.post(ApiPath.JOURNALPOST_KOPIERE.replace('{journalpostId}', journalpost.journalpostId), () =>
                    HttpResponse.json({ detail: 'Det oppstod en feil ved kopiering av journalpost.' }, { status: 500 }),
                ),
            );
        });

        cy.get('[data-test-id="klassifiserModalJournalfør"]').click();

        cy.get('[data-test-id="klassifiserModalAlertBlokk"]')
            .should('exist')
            .within(() => {
                cy.findByText(klassifiserModalAlertFeilKopiering).should('exist');
            });
        cy.get('[data-test-id="klassifiserModalAvbryt"]').should('not.be.disabled').click();
        cy.get('[data-test-id="klassifiserModal"]').should('not.exist');

        cy.get('[data-test-id="journalførOgFortsett"]').click();

        cy.window().then((window) => {
            const { worker } = window.msw;
            worker.use(
                http.post(ApiPath.JOURNALPOST_KOPIERE.replace('{journalpostId}', journalpost.journalpostId), () =>
                    HttpResponse.json({ detail: 'Kopiert' }, { status: 200 }),
                ),
            );
        });

        cy.get('[data-test-id="klassifiserModalJournalfør"]').click();

        cy.get('[data-test-id="klassifiserModalAlertBlokk"]').should('contain', 'Kopi av journalposten er opprettet.');
        cy.get('[data-test-id="klassifiserModalAlertBlokk"]').should('contain', annenSøkerFnr);
        cy.get('[data-test-id="klassifiserModalAlertBlokk"]').should(
            'contain',
            fagsaker[2].pleietrengende.identitetsnummer,
        );

        cy.window().then((window) => {
            const { worker } = window.msw;
            worker.use(
                http.get(ApiPath.JOURNALPOST_GET.replace('{journalpostId}', journalpost.journalpostId), () =>
                    HttpResponse.json({ detail: 'Det oppstod en feil ved sjekke av journalpost.' }, { status: 500 }),
                ),
            );
        });

        cy.get('[data-test-id="klassifiserModalAlertBlokk"]').should('contain', 'Journalpost journalføres');

        cy.wait(20);

        cy.get('[data-test-id="klassifiserModalAlertBlokk"]')
            .should('exist')
            .within(() => {
                cy.findByText(klassifiserModalAlertFeilJfEtterKopiering).should('exist');
            });
        cy.get('[data-test-id="klassifiserModalJournalfør"]').should('be.disabled');
    });

    it('PSB Test klassifiser modal feilmelding ved kopiering med to søkere og set på vent etterpå', () => {
        cy.get('[data-test-id="klassifiserModalAvbryt"]').click();
        cy.get('[data-test-id="journalførOgVent"]').click();
        cy.window().then((window) => {
            const { worker } = window.msw;
            worker.use(
                http.post(ApiPath.JOURNALPOST_KOPIERE.replace('{journalpostId}', journalpost.journalpostId), () =>
                    HttpResponse.json({ detail: 'Kopiert' }, { status: 200 }),
                ),
            );
        });

        cy.window().then((window) => {
            const { worker } = window.msw;
            worker.use(
                http.get(ApiPath.JOURNALPOST_GET.replace('{journalpostId}', journalpost.journalpostId), () =>
                    HttpResponse.json({ ...journalpost, erFerdigstilt: true }, { status: 200 }),
                ),
            );
        });

        cy.get('[data-test-id="klassifiserModalJournalfør"]').click();

        cy.get('[data-test-id="klassifiserModalAlertBlokk"]').should('contain', 'Journalpost journalføres');

        cy.wait(1000);

        cy.get('[data-test-id="klassifiserModalAlertBlokk"]')
            .should('exist')
            .within(() => {
                cy.findByText(klassifiserModalAlertFeilSetPåVent).should('exist');
            });
        cy.get('[data-test-id="klassifiserModalPrøvIgjen"]').should('exist');

        cy.window().then((window) => {
            const { worker } = window.msw;
            worker.use(
                http.post(ApiPath.JOURNALPOST_SETT_PAA_VENT.replace('{journalpostId}', journalpost.journalpostId), () =>
                    HttpResponse.json({ sattPåVent: true }, { status: 200 }),
                ),
            );
        });

        cy.get('[data-test-id="klassifiserModalPrøvIgjen"]').click();
        cy.get('[data-test-id="klassifiserModalPrøvIgjen"]').should('not.exist');

        cy.get('[data-test-id="klassifiserModalGåTilLos"]').should('exist').click();

        cy.get('[data-test-id="klassifiserModal"]').should('not.exist');
    });
});

describe('Test klassifisering PSB', { testIsolation: false }, () => {
    it('PSB Åpen journalpost 300 fra LOS', () => {
        cy.visit('/journalpost/300');
        Cypress.config('viewportWidth', 1280);
        Cypress.config('viewportHeight', 1450);
        cy.findByText(/Skjul/i).should('exist').click();
    });

    it('PSB journalfør journalposten', () => {
        cy.findByText(/Ja/i).should('exist').click();

        cy.contains('Velg fagsak').should('exist');

        cy.findByLabelText('Velg fagsak')
            .select(getFagsakNavnForSelect(fagsaker[2].fagsakId, dokumenttype))
            .should('have.value', fagsaker[2].fagsakId);
        cy.get('[data-test-id="journalførOgFortsett"]').click();
        cy.get('[data-test-id="klassifiserModalJournalfør"]').click();
    });

    it('PSB journalposten journalført', () => {
        cy.url().should('eq', 'http://localhost:8080/journalpost/300/pleiepenger-sykt-barn/');

        cy.get('.journalpostpanel').within(() => {
            cy.findByText(/Journalpostnummer/i).should('exist');
            cy.findByText(journalpost.journalpostId).should('exist');
            cy.findByText(/Søkers ID/i).should('exist');
            cy.findByText(journalpost.norskIdent).should('exist');
            cy.findByText(/Sakstype/i).should('exist');
            cy.findByText(dokumenttype).should('exist');
            cy.findByText(/Barnets ID/i).should('exist');
            cy.findByText(fagsaker[2].pleietrengende.identitetsnummer).should('exist');
            cy.findByText(/Saksnummer/i).should('exist');
            cy.findByText(fagsaker[2].fagsakId).should('exist');
        });

        cy.get('[data-test-id="alertJournalført"]')
            .should('exist')
            .within(() => {
                cy.findByText(alertJournalført).should('exist');
            });

        cy.findByText('Registrere opplysninger til K9').should('exist');
        cy.findByText('Send brev og lukk oppgave i LOS').should('exist');
        cy.get('[data-test-id="bekreftKnapp"]').should('exist').should('be.disabled');

        cy.findByText(/Registrere opplysninger til K9/i).click();

        cy.get('[data-test-id="bekreftKnapp"]').should('exist').should('not.be.disabled').click();

        cy.get('[data-test-id="PSBPunchForm"]').should('exist');
    });
});
