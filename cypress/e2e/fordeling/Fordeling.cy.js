import { ApiPath } from 'app/apiConfig';
import { BACKEND_BASE_URL } from '../../../src/mocks/konstanter';

describe('Fordeling', () => {
    beforeEach(() => {
        cy.visit('/journalpost/200');
    });

    it('viser dokumentvalg', () => {
        cy.contains(/Dette gjelder:?/i).should('exist');
        cy.contains('Pleiepenger').should('exist');
        cy.contains('Omsorgspenger/omsorgsdager').should('exist');
        cy.contains('Pleiepenger i livets sluttfase').should('exist');
        cy.contains('Annet').should('exist');
    });

    it('viser subdokumentvalg omsorgspenger', () => {
        cy.contains('Ekstra omsorgsdager ved kronisk sykt eller funksjonshemmet barn').should('not.exist');
        cy.contains('Korrigering av inntektsmelding omsorgspenger AG').should('not.exist');
        cy.contains('Ekstra omsorgsdager når du er midlertidig alene om omsorgen').should('not.exist');

        cy.contains('Omsorgspenger/omsorgsdager').should('exist').click();
        cy.contains('Ekstra omsorgsdager ved kronisk sykt eller funksjonshemmet barn').should('exist');
        cy.contains('Ekstra omsorgsdager når du er midlertidig alene om omsorgen').should('exist');
        cy.contains('Korrigering av inntektsmelding omsorgspenger AG').should('exist').click();
    });

    it('kan opprette journalføringsoppgave i Gosys', () => {
        cy.contains('Annet').click();
        cy.findByLabelText(/Søkers fødselsnummer eller D-nummer/i).should('exist');
        cy.findByLabelText(/Velg hva journalposten gjelder/i).should('exist');
    });
    it('kan korrigere inntektsmelding uten at sjekkSkalTilK9 kjøres', () => {
        cy.window().then((window) => {
            const { worker, rest } = window.msw;
            worker.use(
                rest.post(`${BACKEND_BASE_URL}/api/k9-punsj${ApiPath.SJEKK_OM_SKAL_TIL_K9SAK}`, (req, res, ctx) =>
                    res.once(
                        ctx.json({
                            k9sak: false,
                        })
                    )
                )
            );
        });

        cy.contains('Omsorgspenger/omsorgsdager').should('exist').click();
        cy.findByText(/Korrigering av inntektsmelding omsorgspenger AG/i).click();
        cy.findByText('Ja').click();
        cy.findByLabelText(/Velg fagsak/i).select('1DMUDF6 (K9 Omsorgspenger)');
        cy.findByRole('button', { name: /Videre/i }).click();
        cy.findByText('Korrigere/trekke refusjonskrav omsorgspenger').click();
        cy.findByRole('button', { name: /bekreft/i }).click();
        cy.url().should('eq', 'http://localhost:8080/journalpost/200#/korrigering-av-inntektsmelding');
    });

    it('Midlertidig alene - kan navigere til eksisterende søknader', () => {
        cy.contains('Omsorgspenger/omsorgsdager').should('exist').click();
        cy.findByText(/Ekstra omsorgsdager når du er midlertidig alene om omsorgen/i).click();
        cy.findByText(/Ja/i).click();
        cy.findByLabelText(/Fødselsnummer annen part/i).type(29099000129);
        cy.findByRole('button', { name: /Videre/i }).click();
        cy.findByText(/Registrer søknad - ekstra omsorgsdager/i).click();
        cy.findByRole('button', { name: /bekreft/i }).click();
        cy.url().should('eq', 'http://localhost:8080/journalpost/200#/omsorgspenger-midlertidig-alene/hentsoknader');
    });

    it('Omsorgspenger - kan navigere til eksisterende søknader', () => {
        cy.contains('Omsorgspenger/omsorgsdager').should('exist').click();
        cy.findByText(/Omsorgspenger: direkte utbetaling av omsorgspenger/i).click();
        cy.findByText(/Ja/i).click();
        cy.findByRole('button', { name: /Videre/i }).click();
        cy.findByText(/Registrer søknad - direkte utbetaling omsorgspenger/i).click();
        cy.findByRole('button', { name: /bekreft/i }).click();
        cy.url().should('eq', 'http://localhost:8080/journalpost/200#/omsorgspenger-utbetaling/soeknader');
    });

    it('validering av fødselsnummer virker', () => {
        cy.contains('Pleiepenger').click();
        cy.contains('Nei').click();

        const identifikatorInput = cy.findByLabelText(/Søkers fødselsnummer eller D-nummer:/i).should('exist');

        identifikatorInput.clear().type('28887298663');

        cy.findByText(/Dette er ikke et gyldig fødsels- eller D-nummer./i).should('not.exist');
    });

    it('validering av fødselsnummer IKKE virker', () => {
        cy.contains('Pleiepenger').click();
        cy.contains('Nei').click();

        const identifikatorInput = cy.findByLabelText(/Søkers fødselsnummer eller D-nummer:/i).should('exist');

        identifikatorInput.clear().type('2888729866').blur();

        cy.findByText(/Dette er ikke et gyldig fødsels- eller D-nummer./i).should('exist');
    });
});
