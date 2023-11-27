import { fraværÅrsak, søknadÅrsak } from 'app/omsorgspenger-utbetaling/konstanter';
import omsorgspengerutbetalingHandlers from 'mocks/omsorgspengeutbetalingHandlers';

describe('Omsorgspengeutbetaling - ny søknad', () => {
    beforeEach(() => {
        cy.visit(
            'http://localhost:8080/journalpost/200/omsorgspenger-utbetaling/skjema/bc12baac-0f0c-427e-a059-b9fbf9a3adff',
        );
        cy.window().then((window) => {
            const { worker } = window.msw;
            worker.use(omsorgspengerutbetalingHandlers.soknad);
            worker.use(omsorgspengerutbetalingHandlers.ingenEksisterendePerioder);
            worker.use(omsorgspengerutbetalingHandlers.oppdater);
            worker.use(omsorgspengerutbetalingHandlers.valider);
            worker.use(omsorgspengerutbetalingHandlers.sendInn);
        });
    });
    it('Kan sende inn søknad for arbeidstaker', () => {
        cy.contains(/Arbeidstaker/i).click();
        cy.findAllByRole('combobox').eq(0).select('979312059');
        cy.findAllByRole('combobox').eq(1).select(fraværÅrsak.ORDINÆRT_FRAVÆR);
        cy.findAllByRole('combobox').eq(2).select(søknadÅrsak.KONFLIKT_MED_ARBEIDSGIVER);
        cy.findByLabelText('Fra og med').type('01.10.2022');
        cy.findByLabelText('Til og med').type('10.10.2022');
        cy.findByLabelText('Normal arbeidstid per dag').type('7');
        cy.findByLabelText('Timer fravær per dag').type('7');

        cy.findByText('Ikke relevant').click();
        cy.findAllByText('Ikke opplyst').eq(0).click();
        cy.findAllByText('Ikke opplyst').eq(1).click();
        cy.findByRole('button', { name: 'Send inn' }).click();
        cy.findByRole('button', { name: 'Videre' }).click();
        cy.get('.navds-modal').within(() => {
            cy.findByRole('button', { name: 'Send inn' }).click();
        });

        cy.contains('Tilbake til LOS').scrollIntoView().should('be.visible');
    });
    it('Kan sende inn søknad for frilanser', () => {
        cy.contains(/Frilanser/i).click();
        cy.findByRole('group', { name: 'Har søker dekket 10 omsorgsdager?' }).within(() => {
            cy.findByText('Ja').click();
        });
        cy.findByLabelText('Når startet søker som frilanser?').type('01.01.2019');
        cy.findByLabelText('Når sluttet søker som frilanser?').type('10.10.2022');
        cy.findAllByRole('combobox').eq(0).select(fraværÅrsak.ORDINÆRT_FRAVÆR);
        cy.findByLabelText('Fra og med').type('01.10.2022');
        cy.findByLabelText('Til og med').type('10.10.2022');
        cy.findByLabelText('Normal arbeidstid per dag').type('7');
        cy.findByLabelText('Timer fravær per dag').type('7');

        cy.findByText('Ikke relevant').click();
        cy.findAllByText('Ikke opplyst').eq(0).click();
        cy.findAllByText('Ikke opplyst').eq(1).click();
        cy.findByRole('button', { name: 'Send inn' }).click();
        cy.findByRole('button', { name: 'Videre' }).click();
        cy.get('.navds-modal').within(() => {
            cy.findByRole('button', { name: 'Send inn' }).click();
        });

        cy.contains('Tilbake til LOS').scrollIntoView().should('be.visible');
    });

    it('Kan sende inn søknad for selvstendig næringsdrivende', () => {
        cy.contains(/Selvstendig næringsdrivende/i).click();
        cy.findByRole('group', { name: 'Har søker dekket 10 omsorgsdager?' }).within(() => {
            cy.findByText('Ja').click();
        });
        cy.findByText(/Fiske/i).click();
        cy.findByRole('group', { name: /Er søker fisker på blad B?/i }).within(() => {
            cy.findByText('Ja').click();
        });
        cy.findByLabelText(/Hva heter virksomheten?/i).type('Bobbys Burger');
        cy.findByLabelText(/Organisasjonsnummer/i).type('974761076');
        cy.findByRole('group', { name: /Har søker regnskapsfører?/i }).within(() => {
            cy.findByText('Ja').click();
        });
        cy.findByLabelText(/Navn på regnskapsfører/i).type('Geir-Per Enoksen');
        cy.findByLabelText(/Telefonnummer til regnskapsfører/i).type('97476107');
        cy.findByLabelText(/Startdato/i).type('01.10.2015');
        cy.findAllByRole('combobox').eq(0).select(fraværÅrsak.ORDINÆRT_FRAVÆR);
        cy.findByLabelText('Fra og med').type('01.10.2022');
        cy.findByLabelText('Til og med').type('10.10.2022');
        cy.findByLabelText('Normal arbeidstid per dag').type('7');
        cy.findByLabelText('Timer fravær per dag').type('7');

        cy.findByText('Ikke relevant').click();
        cy.findAllByText('Ikke opplyst').eq(0).click();
        cy.findAllByText('Ikke opplyst').eq(1).click();
        cy.findByRole('button', { name: 'Send inn' }).click();
        cy.findByRole('button', { name: 'Videre' }).click();
        cy.get('.navds-modal').within(() => {
            cy.findByRole('button', { name: 'Send inn' }).click();
        });

        cy.contains('Tilbake til LOS').scrollIntoView().should('be.visible');
    });

    it('Innsending stoppes av validering', () => {
        cy.findByRole('button', { name: 'Send inn' }).click();
        cy.findByText(/Du må fikse disse feilene før du kan sende inn punsjemeldingen./i)
            .scrollIntoView()
            .should('be.visible');
        cy.findByRole('button', { name: 'Videre' }).should('not.exist');
    });

    it('Innsending stoppes av validering fra backend', () => {
        cy.window().then((window) => {
            const { worker } = window.msw;
            worker.use(omsorgspengerutbetalingHandlers.validerFeil);
        });
        cy.contains(/Arbeidstaker/i).click();
        cy.findAllByRole('combobox').eq(0).select('979312059');
        cy.findAllByRole('combobox').eq(1).select(fraværÅrsak.ORDINÆRT_FRAVÆR);
        cy.findAllByRole('combobox').eq(2).select(søknadÅrsak.KONFLIKT_MED_ARBEIDSGIVER);
        cy.findByLabelText('Fra og med').type('01.10.2022');
        cy.findByLabelText('Til og med').type('10.10.2022');
        cy.findByLabelText('Normal arbeidstid per dag').type('7');
        cy.findByLabelText('Timer fravær per dag').type('7');

        cy.findByText('Ikke relevant').click();
        cy.findAllByText('Ikke opplyst').eq(0).click();
        cy.findAllByText('Ikke opplyst').eq(1).click();
        cy.findByRole('button', { name: 'Send inn' }).click();
        cy.findByText(/feil: Hei, det har oppstått en helt generisk feil. Med vennlig hilsen backend/i)
            .scrollIntoView()
            .should('be.visible');
    });

    // sjekke at journalpostnummer fra flere saker vises
    // sjekk av validering og feilmeldinger på alle felter
    // sjekk at man ikke får sende inn dersom man har valideringsfeil
    // sjekk at alle input-felter fungerer og oppdaterer state?
    // sjekke at eksisterende søknadsperioder vises?
});
