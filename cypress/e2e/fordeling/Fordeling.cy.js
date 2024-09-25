import { ApiPath } from 'app/apiConfig';
// eslint-disable-next-line import/no-extraneous-dependencies
import { http, HttpResponse } from 'msw';

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

    /*
    it('kan velge å lukke journalposten', () => {
        cy.findByText(/Pleiepenger sykt barn/i).click();
        cy.findByText(/Ja/i).click();
        cy.findByText(/Har ikke tilhørende fagsak/i).click();
        cy.findByLabelText(/Velg hvilket barn det gjelder/i)
            .should('exist')
            .select('Hallo Hansen - 03091477490');
        cy.findByRole('button', { name: /Videre/i }).click();
        cy.findByText(/Lukk oppgave i LOS/i).click();
        cy.findByRole('button', { name: /bekreft/i }).click();
    });
    */

    it('viser subdokumentvalg omsorgspenger', () => {
        cy.contains('Ekstra omsorgsdager ved kronisk sykt eller funksjonshemmet barn').should('not.exist');
        cy.contains('Korrigering av inntektsmelding omsorgspenger AG').should('not.exist');
        cy.contains('Ekstra omsorgsdager når du er midlertidig alene om omsorgen').should('not.exist');

        cy.contains('Omsorgspenger/omsorgsdager').should('exist').click();
        cy.contains('Ekstra omsorgsdager ved kronisk sykt eller funksjonshemmet barn').should('exist');
        cy.contains('Ekstra omsorgsdager når du er midlertidig alene om omsorgen').should('exist');
        cy.contains('Korrigering av inntektsmelding omsorgspenger AG').should('exist').click();
    });

    /*
    it('kan opprette journalføringsoppgave i Gosys', () => {
        cy.contains('Annet').click();
        cy.findByLabelText(/Søkers fødselsnummer eller D-nummer/i).should('exist');
        cy.findByLabelText(/Velg hva journalposten gjelder/i).should('exist');
    });
    */
    /*
    it('må sette behandlingsår for omsorgspenger', () => {
        cy.contains('Omsorgspenger/omsorgsdager').should('exist').click();
        cy.findByText(/Korrigering av inntektsmelding omsorgspenger AG/i).click();
        cy.findByText('Ja').click();
        cy.findByRole('button', { name: /Videre/i }).should('be.disabled');
        cy.findByText(/Har ikke tilhørende fagsak/i).click();
        cy.findByLabelText(/Hvilket år gjelder dokumentet?/i).select(String(String(new Date().getFullYear() - 1)));
        /* cy.findByRole('button', { name: /Videre/i }).click();
        cy.findByText('Korrigere/trekke refusjonskrav omsorgspenger').click();
        cy.findByRole('button', { name: /bekreft/i }).click();
        cy.url().should('eq', 'http://localhost:8080/journalpost/200/korrigering-av-inntektsmelding/');

    });
    */

    it('Midlertidig alene - kan navigere til eksisterende søknader', () => {
        cy.contains('Omsorgspenger/omsorgsdager').should('exist').click();
        cy.findByText(/Ekstra omsorgsdager når du er midlertidig alene om omsorgen/i).click();
        cy.findByText(/Ja/i).click();
        /* cy.findByLabelText(/Fødselsnummer annen part/i).type(29099000129);
         cy.findByRole('button', { name: /Videre/i }).click();
        cy.findByText(/Registrer søknad - ekstra omsorgsdager/i).click();
        cy.findByRole('button', { name: /bekreft/i }).click();
        cy.url().should('eq', 'http://localhost:8080/journalpost/200/omsorgspenger-midlertidig-alene/soknader/'); */
    });

    it('Alene om omsorgen - kan navigere til eksisterende søknader', () => {
        cy.contains('Omsorgspenger/omsorgsdager').should('exist').click();
        cy.findByText(/Ekstra omsorgsdager når du er alene om omsorgen/i).click();
        cy.findByText(/Ja/i).click();
        /* cy.findByLabelText(/Velg hvilket barn det gjelder/i).select('Geir-Paco Gundersen - 02021477330');
         cy.findByRole('button', { name: /Videre/i }).click();
        cy.findByText(/Registrer søknad - alene om omsorgen/i).click();
        cy.findByRole('button', { name: /bekreft/i }).click();
        cy.url().should('eq', 'http://localhost:8080/journalpost/200/omsorgspenger-alene-om-omsorgen/soknader/');*/
    });

    it('Omsorgspenger - behandlingsår vises når fagsaker ikke finnes', () => {
        cy.window().then((window) => {
            const { worker } = window.msw;
            worker.use(http.get(ApiPath.HENT_FAGSAK_PÅ_IDENT, () => HttpResponse.json([], { status: 200 })));
        });
        cy.contains('Omsorgspenger/omsorgsdager').should('exist').click();
        cy.findByText(/Omsorgspenger: direkte utbetaling av omsorgspenger/i).click();
        cy.findByText(/Ja/i).click();
        // Velg fagsak should not exist
        cy.findByLabelText(/Velg fagsak/i).should('not.exist');
        /* cy.findByRole('button', { name: /Videre/i }).should('be.disabled');
        cy.findByLabelText(/Hvilket år gjelder dokumentet?/i).select(String(new Date().getFullYear() - 1));
        cy.findByRole('button', { name: /Videre/i }).click();
        cy.findByText(/Registrer søknad - direkte utbetaling omsorgspenger/i).click();
        cy.findByRole('button', { name: /bekreft/i }).click();
        cy.url().should('eq', 'http://localhost:8080/journalpost/200/omsorgspenger-utbetaling/soknader/'); */
    });

    it('Omsorgspenger - kan navigere til eksisterende søknader', () => {
        cy.contains('Omsorgspenger/omsorgsdager').should('exist').click();
        cy.findByText(/Omsorgspenger: direkte utbetaling av omsorgspenger/i).click();
        /*cy.findByText(/Ja/i).click();
        /*cy.findByText(/Har ikke tilhørende fagsak/i).click();

        /* cy.findByLabelText(/Hvilket år gjelder dokumentet?/i).select(String(new Date().getFullYear() - 1));
        /* cy.findByRole('button', { name: /Videre/i }).click();
        cy.findByText(/Registrer søknad - direkte utbetaling omsorgspenger/i).click();
        cy.findByRole('button', { name: /bekreft/i }).click();
        cy.url().should('eq', 'http://localhost:8080/journalpost/200/omsorgspenger-utbetaling/soknader/');*/
    });
    /* 
    it('Omsorgspenger - blir stoppet hvis behandlingsaar ikke settes', () => {
        cy.window().then((window) => {
            const { worker } = window.msw;
            worker.use(
                http.post(
                    ApiPath.JOURNALPOST_SETT_BEHANDLINGSÅR.replace('{journalpostId}', ':journalpost'),
                    () => new HttpResponse(null, { status: 403 }),
                ),
            );
        });
        cy.contains('Omsorgspenger/omsorgsdager').should('exist').click();
        cy.findByText(/Omsorgspenger: direkte utbetaling av omsorgspenger/i).click();
        cy.findByText(/Ja/i).click();
        cy.findByRole('button', { name: /Videre/i }).should('be.disabled');
        cy.findByText(/Har ikke tilhørende fagsak/i).click();
        cy.findByLabelText(/Hvilket år gjelder dokumentet?/i).select(String(new Date().getFullYear() - 1));
        cy.findByRole('button', { name: /Videre/i }).click();
        cy.findByText(/Kunne ikke sjekke opplysninger. Prøv igjen senere./i).should('exist');
    });
    */

    it('validering av fødselsnummer virker', () => {
        cy.contains('Pleiepenger').click();
        cy.contains('Nei').click();

        const identifikatorInput = cy.findByLabelText(/Søkers fødselsnummer eller D-nummer:/i).should('exist');

        identifikatorInput.clear().type('28887298663');

        cy.findByText(/Dette er ikke et gyldig fødsels- eller D-nummer./i).should('not.exist');
    });

    /*
    it('validering av fødselsnummer IKKE virker', () => {
        cy.contains('Pleiepenger').click();
        cy.contains('Nei').click();

        const identifikatorInput = cy.findByLabelText(/Søkers fødselsnummer eller D-nummer:/i).should('exist');

        identifikatorInput.clear().type('2888729866').blur(); // Slettet blur

        cy.findByText(/Dette er ikke et gyldig fødsels- eller D-nummer./i).should('exist');
    }); */
});
