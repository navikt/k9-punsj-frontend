import { fraværÅrsak, søknadÅrsak } from 'app/omsorgspenger-utbetaling/konstanter';
import omsorgspengerutbetalingHandlers from 'mocks/omsorgspengeutbetalingHandlers';

describe('Omsorgspengeutbetaling - ny søknad', () => {
    beforeEach(() => {
        cy.visit(
            'http://localhost:8080/journalpost/200/omsorgspenger-utbetaling/journalfor-og-fortsett/skjema/bc12baac-0f0c-427e-a059-b9fbf9a3adff',
        );
        cy.window().then((window) => {
            const { worker } = window.msw;
            worker.use(omsorgspengerutbetalingHandlers.soknad);
            worker.use(omsorgspengerutbetalingHandlers.eksisterendePerioderOmsorgspengeutbetaling);
            worker.use(omsorgspengerutbetalingHandlers.oppdater);
            worker.use(omsorgspengerutbetalingHandlers.valider);
            worker.use(omsorgspengerutbetalingHandlers.sendInn);
        });
    });
    it('Kan sende inn korrigering for arbeidstaker', () => {
        cy.contains(/Eksisterende perioder/i).click();
        cy.findByRole('group', { name: /Er dette en ny søknad eller en korrigering?/i }).within(() =>
            cy.findByText('Korrigering').click(),
        );
        cy.contains(/Arbeidstaker/i).click();
        cy.findAllByRole('combobox').eq(0).select('979312059');
        cy.findAllByRole('combobox').eq(1).select(fraværÅrsak.ORDINÆRT_FRAVÆR);
        cy.findAllByRole('combobox').eq(2).select(søknadÅrsak.KONFLIKT_MED_ARBEIDSGIVER);
        cy.findByLabelText('Fra og med').type('01.10.2022');
        cy.findByLabelText('Til og med').type('10.10.2022');
        cy.findByLabelText('Normal arbeidstid per dag').type('7');
        cy.findByLabelText('Timer fravær per dag').type('7');

        cy.findByText(
            'Er dokumentet signert av søker eller, dersom søker er under 18 år gammel, av forelder/verge/fullmektig?',
        ).should('not.exist');
        cy.findByText('Medlemskap').should('not.exist');
        cy.findByText('Utenlandsopphold').should('not.exist');
        cy.findByRole('button', { name: 'Send inn' }).click();
        cy.findByRole('button', { name: 'Videre' }).click();
        cy.get('.navds-modal').within(() => {
            cy.findByRole('button', { name: 'Send inn' }).click();
        });

        cy.contains('Tilbake til LOS').scrollIntoView().should('be.visible');
    });

    it('Kan sende inn søknad for frilanser', () => {
        cy.contains(/Eksisterende perioder/i);
        cy.findByRole('group', { name: /Er dette en ny søknad eller en korrigering?/i }).within(() =>
            cy.findByText('Korrigering').click(),
        );
        cy.contains(/Frilanser/i).click();
        cy.findByRole('group', { name: 'Har søker dekket 10 omsorgsdager?' }).should('not.exist');
        cy.findByLabelText('Når startet søker som frilanser?').type('01.01.2019');
        cy.findByLabelText('Når sluttet søker som frilanser?').type('10.10.2022');
        cy.findAllByRole('combobox').eq(0).select(fraværÅrsak.ORDINÆRT_FRAVÆR);
        cy.findByLabelText('Fra og med').type('01.10.2022');
        cy.findByLabelText('Til og med').type('10.10.2022');
        cy.findByLabelText('Normal arbeidstid per dag').type('7');
        cy.findByLabelText('Timer fravær per dag').type('7');

        cy.findByText(
            'Er dokumentet signert av søker eller, dersom søker er under 18 år gammel, av forelder/verge/fullmektig?',
        ).should('not.exist');
        cy.findByText('Medlemskap').should('not.exist');
        cy.findByText('Utenlandsopphold').should('not.exist');
        cy.findByRole('button', { name: 'Send inn' }).click();
        cy.findByRole('button', { name: 'Videre' }).click();
        cy.get('.navds-modal').within(() => {
            cy.findByRole('button', { name: 'Send inn' }).click();
        });

        cy.contains('Tilbake til LOS').scrollIntoView().should('be.visible');
    });

    it('Kan sende inn søknad for selvstendig næringsdrivende', () => {
        cy.contains(/Eksisterende perioder/i);
        cy.findByRole('group', { name: /Er dette en ny søknad eller en korrigering?/i }).within(() =>
            cy.findByText('Korrigering').click(),
        );
        cy.contains(/Selvstendig næringsdrivende/i).click();
        cy.findByRole('group', { name: 'Har søker dekket 10 omsorgsdager?' }).should('not.exist');
        cy.findByText(/Fiske/i).click();
        cy.findByRole('group', { name: /Er søker fisker på blad B?/i }).should('not.exist');
        cy.findByLabelText(/Hva heter virksomheten?/i).should('not.exist');
        cy.findByLabelText(/Organisasjonsnummer/i).type('974761076');
        cy.findByRole('group', { name: /Har søker regnskapsfører?/i }).should('not.exist');
        cy.findByLabelText(/Navn på regnskapsfører/i).should('not.exist');
        cy.findByLabelText(/Telefonnummer til regnskapsfører/i).should('not.exist');
        cy.findByLabelText(/Startdato/i).type('01.10.2015');
        cy.findAllByRole('combobox').eq(0).select(fraværÅrsak.ORDINÆRT_FRAVÆR);
        cy.findByLabelText('Fra og med').type('01.10.2022');
        cy.findByLabelText('Til og med').type('10.10.2022');
        cy.findByLabelText('Normal arbeidstid per dag').type('7');
        cy.findByLabelText('Timer fravær per dag').type('7');

        cy.findByText(
            'Er dokumentet signert av søker eller, dersom søker er under 18 år gammel, av forelder/verge/fullmektig?',
        ).should('not.exist');
        cy.findByText('Medlemskap').should('not.exist');
        cy.findByText('Utenlandsopphold').should('not.exist');
        cy.findByRole('button', { name: 'Send inn' }).click();
        cy.findByRole('button', { name: 'Videre' }).click();
        cy.get('.navds-modal').within(() => {
            cy.findByRole('button', { name: 'Send inn' }).click();
        });

        cy.contains('Tilbake til LOS').scrollIntoView().should('be.visible');
    });

    // sjekke at journalpostnummer fra flere saker vises
    // sjekk av validering og feilmeldinger på alle felter
    // sjekk at man ikke får sende inn dersom man har valideringsfeil
    // sjekk at alle input-felter fungerer og oppdaterer state?
    // sjekke at eksisterende søknadsperioder vises?
});
