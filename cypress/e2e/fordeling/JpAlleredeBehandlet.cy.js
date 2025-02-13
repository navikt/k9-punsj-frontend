import { getBarnInfoForSelect } from '../../utils/utils';
import journalpost from '../../fixtures/jpUkjent310.json';
import barnFraApi from '../../fixtures/barn.json';

const journalpostId = journalpost.journalpostId;
const norskIdent = journalpost.norskIdent;
const barn3FraApi = barnFraApi.barn[2];
const fnrBarnIkkeFraList = '02021477330';
const annenSøkerFnr = '02918496664';
const fnrAnnenPart = '02021477330';

describe(`Fordeling Journalpost allerede behandlet`, { testIsolation: false }, () => {
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
            cy.findByText(/Sakstype/i).should('not.exist');
        });
    });

    it('Kopiering info vises', () => {
        cy.get('[data-test-id="infoJournalpostAlleredeBehandlet"]').should('exist');
    });

    it('Viser dokumentvalg', () => {
        cy.contains(/Dette gjelder:?/i).should('exist');
        cy.contains('Pleiepenger').should('exist');

        cy.contains('Omsorgspenger/omsorgsdager').should('exist').click();

        cy.contains('Ekstra omsorgsdager ved kronisk sykt eller funksjonshemmet barn').should('exist');
        cy.contains('Ekstra omsorgsdager når du er alene om omsorgen').should('exist');
        cy.contains('Ekstra omsorgsdager når du er midlertidig alene om omsorgen').should('exist');
        cy.contains('Omsorgspenger: direkte utbetaling av omsorgspenger').should('exist');
        cy.contains('Korrigering av inntektsmelding omsorgspenger AG').should('exist');

        cy.contains('Pleiepenger i livets sluttfase').should('exist');

        cy.contains('Annet').should('not.exist');

        cy.get('[data-test-id="kopierJournalpostBtn"]').should('be.disabled');
    });

    it('Test Pleiepenger', () => {
        cy.contains('Pleiepenger').click();

        cy.contains('Kopier journalposten til annen søker (gjelder kun for to søkere i journalposten)').should('exist');

        cy.findByLabelText('Velg hvilket barn det gjelder')
            .select(getBarnInfoForSelect(barn3FraApi))
            .should('have.value', barn3FraApi.identitetsnummer);

        cy.get('[data-test-id="kopierJournalpostBtn"]').should('not.be.disabled');

        cy.findByLabelText('Det gjelder et annet barn').check();

        cy.get('[data-test-id="kopierJournalpostBtn"]').should('be.disabled');

        cy.findByLabelText('Pleietrengendes fødselsnummer:').should('exist').type(fnrBarnIkkeFraList);

        cy.get('[data-test-id="kopierJournalpostBtn"]').should('not.be.disabled');

        // Clear barn
        cy.findByLabelText('Det gjelder et annet barn').click();

        cy.get('[data-test-id="toSokereCheckbox"]').check();

        cy.contains('Du skal kopiere journalposten til annen søker. Det vil da opprettes en ny oppgave i LOS.').should(
            'exist',
        );

        cy.findByLabelText('Fødselsnummer annen søker:').should('exist').type(annenSøkerFnr);

        cy.findByLabelText('Velg hvilket barn det gjelder')
            .select(getBarnInfoForSelect(barn3FraApi))
            .should('have.value', barn3FraApi.identitetsnummer);

        cy.get('[data-test-id="kopierJournalpostBtn"]').should('not.be.disabled');

        // Clear annen søker
        cy.get('[data-test-id="toSokereCheckbox"]').click();
    });

    it('Test Ekstra omsorgsdager ved kronisk sykt eller funksjonshemmet barn', () => {
        cy.contains('Omsorgspenger/omsorgsdager').click();
        cy.contains('Ekstra omsorgsdager ved kronisk sykt eller funksjonshemmet barn').click();

        cy.contains('Kopier journalposten til annen søker (gjelder kun for to søkere i journalposten)').should('exist');

        cy.findByLabelText('Velg hvilket barn det gjelder')
            .select(getBarnInfoForSelect(barn3FraApi))
            .should('have.value', barn3FraApi.identitetsnummer);

        cy.get('[data-test-id="kopierJournalpostBtn"]').should('not.be.disabled');

        cy.findByLabelText('Det gjelder et annet barn').check();

        cy.get('[data-test-id="kopierJournalpostBtn"]').should('be.disabled');

        cy.findByLabelText('Pleietrengendes fødselsnummer:').should('exist').type(fnrBarnIkkeFraList);

        cy.get('[data-test-id="kopierJournalpostBtn"]').should('not.be.disabled');

        // Clear barn
        cy.findByLabelText('Det gjelder et annet barn').click();

        cy.get('[data-test-id="toSokereCheckbox"]').check();

        cy.contains('Du skal kopiere journalposten til annen søker. Det vil da opprettes en ny oppgave i LOS.').should(
            'exist',
        );

        cy.findByLabelText('Fødselsnummer annen søker:').should('exist').type(annenSøkerFnr);

        cy.findByLabelText('Velg hvilket barn det gjelder')
            .select(getBarnInfoForSelect(barn3FraApi))
            .should('have.value', barn3FraApi.identitetsnummer);

        cy.get('[data-test-id="kopierJournalpostBtn"]').should('not.be.disabled');

        // Clear annen søker
        cy.get('[data-test-id="toSokereCheckbox"]').click();
    });

    it('Test Ekstra omsorgsdager når du er alene om omsorgen', () => {
        cy.contains('Omsorgspenger/omsorgsdager').click();
        cy.contains('Ekstra omsorgsdager når du er alene om omsorgen').click();

        cy.contains('Kopier journalposten til annen søker (gjelder kun for to søkere i journalposten)').should('exist');

        cy.findByLabelText('Velg hvilket barn det gjelder')
            .select(getBarnInfoForSelect(barn3FraApi))
            .should('have.value', barn3FraApi.identitetsnummer);

        cy.get('[data-test-id="kopierJournalpostBtn"]').should('not.be.disabled');

        cy.findByLabelText('Det gjelder et annet barn').check();

        cy.get('[data-test-id="kopierJournalpostBtn"]').should('be.disabled');

        cy.findByLabelText('Pleietrengendes fødselsnummer:').should('exist').type(fnrBarnIkkeFraList);

        cy.get('[data-test-id="kopierJournalpostBtn"]').should('not.be.disabled');

        // Clear barn
        cy.findByLabelText('Det gjelder et annet barn').click();

        cy.get('[data-test-id="toSokereCheckbox"]').check();

        cy.contains('Du skal kopiere journalposten til annen søker. Det vil da opprettes en ny oppgave i LOS.').should(
            'exist',
        );

        cy.findByLabelText('Fødselsnummer annen søker:').should('exist').type(annenSøkerFnr);

        cy.findByLabelText('Velg hvilket barn det gjelder')
            .select(getBarnInfoForSelect(barn3FraApi))
            .should('have.value', barn3FraApi.identitetsnummer);

        cy.get('[data-test-id="kopierJournalpostBtn"]').should('not.be.disabled');

        // Clear annen søker
        cy.get('[data-test-id="toSokereCheckbox"]').click();
    });

    it('Test Ekstra omsorgsdager når du er midlertidig alene om omsorgen', () => {
        cy.contains('Omsorgspenger/omsorgsdager').click();

        cy.contains('Ekstra omsorgsdager når du er midlertidig alene om omsorgen').click();

        cy.contains('Kopier journalposten til annen søker (gjelder kun for to søkere i journalposten)').should('exist');

        cy.get('[data-test-id="kopierJournalpostBtn"]').should('be.disabled');

        cy.findByLabelText('Fødselsnummer annen part:').should('exist').type(fnrAnnenPart);

        cy.get('[data-test-id="kopierJournalpostBtn"]').should('not.be.disabled');

        cy.get('[data-test-id="toSokereCheckbox"]').check();

        cy.contains('Du skal kopiere journalposten til annen søker. Det vil da opprettes en ny oppgave i LOS.').should(
            'exist',
        );

        cy.findByLabelText('Fødselsnummer annen søker:').should('exist').type(annenSøkerFnr);

        cy.get('[data-test-id="kopierJournalpostBtn"]').should('not.be.disabled');

        // Clear annen søker
        cy.get('[data-test-id="toSokereCheckbox"]').check();
    });

    it('Test Omsorgspenger: direkte utbetaling av omsorgspenger', () => {
        cy.contains('Omsorgspenger/omsorgsdager').click();

        cy.contains('Omsorgspenger: direkte utbetaling av omsorgspenger').click();

        cy.contains('Kopier journalposten til annen søker (gjelder kun for to søkere i journalposten)').should('exist');

        cy.get('[data-test-id="kopierJournalpostBtn"]').should('be.disabled');

        cy.get('[data-test-id="valgAvbehandlingsÅr"]').select('2023').should('have.value', '2023');

        cy.get('[data-test-id="kopierJournalpostBtn"]').should('not.be.disabled');

        cy.get('[data-test-id="toSokereCheckbox"]').check();

        cy.contains('Du skal kopiere journalposten til annen søker. Det vil da opprettes en ny oppgave i LOS.').should(
            'exist',
        );

        cy.findByLabelText('Fødselsnummer annen søker:').should('exist').type(annenSøkerFnr);

        cy.get('[data-test-id="kopierJournalpostBtn"]').should('not.be.disabled');

        // Clear annen søker
        cy.get('[data-test-id="toSokereCheckbox"]').check();
    });

    it('Test Korrigering av inntektsmelding omsorgspenger AG', () => {
        cy.contains('Omsorgspenger/omsorgsdager').click();

        cy.contains('Korrigering av inntektsmelding omsorgspenger AG').click();

        cy.contains('Kopier journalposten til annen søker (gjelder kun for to søkere i journalposten)').should('exist');

        cy.get('[data-test-id="kopierJournalpostBtn"]').should('be.disabled');

        cy.get('[data-test-id="valgAvbehandlingsÅr"]').select('2023').should('have.value', '2023');

        cy.get('[data-test-id="kopierJournalpostBtn"]').should('not.be.disabled');

        cy.get('[data-test-id="toSokereCheckbox"]').check();

        cy.contains('Du skal kopiere journalposten til annen søker. Det vil da opprettes en ny oppgave i LOS.').should(
            'exist',
        );

        cy.findByLabelText('Fødselsnummer annen søker:').should('exist').type(annenSøkerFnr);

        cy.get('[data-test-id="kopierJournalpostBtn"]').should('not.be.disabled');

        // Clear annen søker
        cy.get('[data-test-id="toSokereCheckbox"]').check();
    });

    it('Test Pleiepenger i livets sluttfase', () => {
        cy.contains('Pleiepenger i livets sluttfase').click();

        cy.contains('Kopier journalposten til annen søker (gjelder kun for to søkere i journalposten)').should('exist');

        cy.get('[data-test-id="kopierJournalpostBtn"]').should('be.disabled');

        cy.findByLabelText('Pleietrengendes fødselsnummer:').should('exist').type(fnrBarnIkkeFraList);

        cy.get('[data-test-id="kopierJournalpostBtn"]').should('not.be.disabled');

        cy.get('[data-test-id="toSokereCheckbox"]').check();

        cy.contains('Du skal kopiere journalposten til annen søker. Det vil da opprettes en ny oppgave i LOS.').should(
            'exist',
        );

        cy.findByLabelText('Fødselsnummer annen søker:').should('exist').type(annenSøkerFnr);

        cy.get('[data-test-id="kopierJournalpostBtn"]').should('not.be.disabled');

        // Clear annen søker
        cy.get('[data-test-id="toSokereCheckbox"]').click();
    });
});
