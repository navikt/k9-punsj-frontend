import { ApiPath } from 'app/apiConfig';
// eslint-disable-next-line import/no-extraneous-dependencies
import { http, HttpResponse } from 'msw';
import { getFagsakNavnForSelect } from '../../utils/utils';
import journalpost from '../../fixtures/jpOMPUT305.json';
import fagsaker from '../../fixtures/fagsaker.json';

const dokumenttype = 'Omsorgspenger';
const valgteDokumentType = 'Omsorgspenger: direkte utbetaling av omsorgspenger';
const journalpostId = journalpost.journalpostId;
const annenSøkerFnr = '02918496664';
const fosterBarnFnr = '09418531220';

describe(`Journalføring ${dokumenttype} med fosterbarn`, { testIsolation: false }, () => {
    Cypress.config('viewportWidth', 1280);
    Cypress.config('viewportHeight', 1450);
    beforeEach(() => {
        cy.visit(`/journalpost/${journalpostId}`);

        cy.findByText(/Skjul/i).should('exist').click();
        cy.findByText(valgteDokumentType).should('exist').click();
        cy.findByText(/Ja/i).should('exist').click();
        cy.findByLabelText('Reserver saksnummer til ny fagsak').check();
        cy.findByText(/Hvilket år gjelder dokumentet?/i).should('exist');
        cy.get('[data-test-id="valgAvbehandlingsÅr"]').select('2023').should('have.value', '2023');
    });

    it('Test journalfør med fosterbarn uten tilgangsfeil', () => {
        cy.get('[data-test-id="leggTillFosterbarnBtn"]').should('exist').click();

        cy.findByLabelText('Barnets fødselsnummer:').should('exist').type(fosterBarnFnr);

        cy.get('[data-test-id="journalførOgVent"]').should('not.be.disabled');
        cy.get('[data-test-id="journalførOgFortsett"]').should('not.be.disabled').click();

        cy.get('[data-test-id="klassifiseringInfo"]')
            .should('exist')
            .within(() => {
                cy.findByText(/Fosterbarn ID:/i).should('exist');
                cy.findByText(fosterBarnFnr).should('exist');
            });

        cy.get('[data-test-id="klassifiserModalJournalfør"]').click();
        cy.findByText(/Journalposten er journalført. Sakstype, søker er lagret til journalpost./i).should('exist');
        cy.findByText(/Sjekker journalposten for tilgangsrettigheter ..../i).should('exist');

        cy.findByText(/Registrer søknad - direkte utbetaling omsorgspenger/i).should('exist');
    });

    it('Test journalfør med fosterbarn med tilgangsfeil', () => {
        cy.get('[data-test-id="leggTillFosterbarnBtn"]').should('exist').click();

        cy.findByLabelText('Barnets fødselsnummer:').should('exist').type(fosterBarnFnr);

        cy.get('[data-test-id="journalførOgVent"]').should('not.be.disabled');
        cy.get('[data-test-id="journalførOgFortsett"]').should('not.be.disabled').click();

        cy.get('[data-test-id="klassifiseringInfo"]')
            .should('exist')
            .within(() => {
                cy.findByText(/Fosterbarn ID:/i).should('exist');
                cy.findByText(fosterBarnFnr).should('exist');
            });

        cy.window().then((window) => {
            const { worker } = window.msw;
            worker.use(
                http.get(ApiPath.JOURNALPOST_GET.replace('{journalpostId}', journalpost.journalpostId), () =>
                    HttpResponse.json({ message: 'Error' }, { status: 403 }),
                ),
            );
        });

        cy.get('[data-test-id="klassifiserModalJournalfør"]').click();
        cy.findByText(/Journalposten er journalført. Sakstype, søker er lagret til journalpost./i).should('exist');
        cy.findByText(/Sjekker journalposten for tilgangsrettigheter ..../i).should('exist');

        cy.findByText(/Du har ikke tilgang til å jobbe videre med journalposten./i).should('exist');
        cy.findByText(/Registrer søknad - direkte utbetaling omsorgspenger/i).should('not.exist');
        cy.get('[data-test-id="klassifiserModalGåTilLos"]').should('exist');
    });

    it('Test journalfør med 2 søkere (+kopiering) og fosterbarn uten tilgangsfeil', () => {
        cy.get('[data-test-id="toSokereCheckbox"]').should('exist').check();
        cy.findByText(/Du skal registrere informasjon for en søker av gangen i Punsj./i).should('exist');
        cy.findByLabelText('Fødselsnummer annen søker:').should('exist').type(annenSøkerFnr);

        cy.get('[data-test-id="leggTillFosterbarnBtn"]').should('exist').click();

        cy.findByLabelText('Barnets fødselsnummer:').should('exist').type(fosterBarnFnr);

        cy.get('[data-test-id="journalførOgVent"]').should('not.be.disabled');
        cy.get('[data-test-id="journalførOgFortsett"]').should('not.be.disabled').click();

        cy.window().then((window) => {
            const { worker } = window.msw;
            worker.use(
                http.post(ApiPath.JOURNALPOST_KOPIERE.replace('{journalpostId}', journalpost.journalpostId), () =>
                    HttpResponse.json(
                        {
                            saksnummer: '1DQAW94',
                        },
                        { status: 200 },
                    ),
                ),
            );
        });

        cy.get('[data-test-id="klassifiseringInfo"]')
            .should('exist')
            .within(() => {
                cy.findByText(/Fosterbarn ID:/i).should('exist');
                cy.findByText(fosterBarnFnr).should('exist');
            });

        cy.get('[data-test-id="klassifiserModalJournalfør"]').click();
        cy.findByText(/Journalposten er journalført. Sakstype, søker er lagret til journalpost./i).should('exist');
        cy.findByText(/Kopi av journalposten er opprettet. Journalposten er kopiert til annen søker:/i).should('exist');

        cy.findByText(/Sjekker journalposten for tilgangsrettigheter ..../i).should('exist');

        cy.get('[data-test-id="klassifiserModalGåVidereEtterKopiering"]').should('exist').click();

        cy.findByText(/Registrer søknad - direkte utbetaling omsorgspenger/i).should('exist');
    });

    it('Test journalfør med 2 søkere (+kopiering) og fosterbarn med tilgangsfeil', () => {
        cy.get('[data-test-id="toSokereCheckbox"]').should('exist').check();
        cy.findByText(/Du skal registrere informasjon for en søker av gangen i Punsj./i).should('exist');
        cy.findByLabelText('Fødselsnummer annen søker:').should('exist').type(annenSøkerFnr);

        cy.get('[data-test-id="leggTillFosterbarnBtn"]').should('exist').click();

        cy.findByLabelText('Barnets fødselsnummer:').should('exist').type(fosterBarnFnr);

        cy.get('[data-test-id="journalførOgVent"]').should('not.be.disabled');
        cy.get('[data-test-id="journalførOgFortsett"]').should('not.be.disabled').click();

        cy.window().then((window) => {
            const { worker } = window.msw;
            worker.use(
                http.post(ApiPath.JOURNALPOST_KOPIERE.replace('{journalpostId}', journalpost.journalpostId), () =>
                    HttpResponse.json(
                        {
                            saksnummer: '1DQAW94',
                        },
                        { status: 200 },
                    ),
                ),
                http.get(ApiPath.JOURNALPOST_GET.replace('{journalpostId}', journalpost.journalpostId), () =>
                    HttpResponse.json({ message: 'Error' }, { status: 403 }),
                ),
            );
        });

        cy.get('[data-test-id="klassifiseringInfo"]')
            .should('exist')
            .within(() => {
                cy.findByText(/Fosterbarn ID:/i).should('exist');
                cy.findByText(fosterBarnFnr).should('exist');
            });

        cy.get('[data-test-id="klassifiserModalJournalfør"]').click();
        cy.findByText(/Journalposten er journalført. Sakstype, søker er lagret til journalpost./i).should('exist');
        cy.findByText(/Kopi av journalposten er opprettet. Journalposten er kopiert til annen søker:/i).should('exist');

        cy.findByText(/Sjekker journalposten for tilgangsrettigheter ..../i).should('exist');

        cy.findByText(/Du har ikke tilgang til å jobbe videre med journalposten./i).should('exist');

        cy.get('[data-test-id="klassifiserModalGåTilLos"]').should('exist').should('not.be.disabled');
    });

    it('Test journalfør med 2 søkere (+kopiering) uten fosterbarn', () => {
        cy.get('[data-test-id="toSokereCheckbox"]').should('exist').check();
        cy.findByText(/Du skal registrere informasjon for en søker av gangen i Punsj./i).should('exist');
        cy.findByLabelText('Fødselsnummer annen søker:').should('exist').type(annenSøkerFnr);

        cy.get('[data-test-id="leggTillFosterbarnBtn"]').should('exist');

        cy.get('[data-test-id="journalførOgVent"]').should('not.be.disabled');
        cy.get('[data-test-id="journalførOgFortsett"]').should('not.be.disabled').click();

        cy.window().then((window) => {
            const { worker } = window.msw;
            worker.use(
                http.post(ApiPath.JOURNALPOST_KOPIERE.replace('{journalpostId}', journalpost.journalpostId), () =>
                    HttpResponse.json(
                        {
                            saksnummer: '1DQAW94',
                        },
                        { status: 200 },
                    ),
                ),
                http.get(ApiPath.JOURNALPOST_GET.replace('{journalpostId}', journalpost.journalpostId), () =>
                    HttpResponse.json({ message: 'Error' }, { status: 403 }),
                ),
            );
        });

        cy.get('[data-test-id="klassifiseringInfo"]')
            .should('exist')
            .within(() => {
                cy.findByText(/Fosterbarn ID:/i).should('not.exist');
            });

        cy.get('[data-test-id="klassifiserModalJournalfør"]').click();

        cy.findByText(/Journalposten er journalført. Sakstype, søker og saksnummer er lagret til journalpost./i).should(
            'exist',
        );
        cy.findByText(/Kopi av journalposten er opprettet. Journalposten er kopiert til annen søker:/i).should('exist');

        cy.findByText(/Sjekker journalposten for tilgangsrettigheter ..../i).should('not.exist');

        cy.get('[data-test-id="klassifiserModalGåVidereEtterKopiering"]').should('exist').click();
        cy.findByText(/Registrer søknad - direkte utbetaling omsorgspenger/i).should('exist');
    });

    it('Test journalfør uten fosterbarn', () => {
        cy.get('[data-test-id="leggTillFosterbarnBtn"]').should('exist');

        cy.get('[data-test-id="journalførOgVent"]').should('not.be.disabled');
        cy.get('[data-test-id="journalførOgFortsett"]').should('not.be.disabled').click();

        cy.window().then((window) => {
            const { worker } = window.msw;
            worker.use(
                http.post(ApiPath.JOURNALPOST_KOPIERE.replace('{journalpostId}', journalpost.journalpostId), () =>
                    HttpResponse.json(
                        {
                            saksnummer: '1DQAW94',
                        },
                        { status: 200 },
                    ),
                ),
                http.get(ApiPath.JOURNALPOST_GET.replace('{journalpostId}', journalpost.journalpostId), () =>
                    HttpResponse.json({ message: 'Error' }, { status: 403 }),
                ),
            );
        });

        cy.get('[data-test-id="klassifiseringInfo"]')
            .should('exist')
            .within(() => {
                cy.findByText(/Fosterbarn ID:/i).should('not.exist');
            });

        cy.get('[data-test-id="klassifiserModalJournalfør"]').click();

        cy.findByText(/Registrer søknad - direkte utbetaling omsorgspenger/i).should('exist');
    });

    it('Test legg til fosterbarn knapp exist i andre ytelser som krever det ', () => {
        cy.findByText('Ekstra omsorgsdager når du er midlertidig alene om omsorgen').should('exist').click();
        cy.findByText(/Ja/i).should('exist').click();
        cy.findByLabelText('Reserver saksnummer til ny fagsak').check();
        cy.get('[data-test-id="leggTillFosterbarnBtn"]').should('exist');

        cy.findByText('Korrigering av inntektsmelding omsorgspenger AG').should('exist').click();
        cy.findByText(/Ja/i).should('exist').click();
        cy.findByLabelText('Reserver saksnummer til ny fagsak').check();
        cy.get('[data-test-id="leggTillFosterbarnBtn"]').should('exist');
    });
});
