import { OMP_UT_API_PATHS } from 'app/apiConfig';
import { fraværÅrsak, søknadÅrsak } from 'app/omsorgspenger-utbetaling/konstanter';
import omsorgspengerutbetalingHandlers from 'mocks/omsorgspengeutbetalingHandlers';

describe('Omsorgspengeutbetaling - ny søknad', () => {
    beforeEach(() => {
        cy.visit(
            'http://localhost:8080/journalpost/200#/omsorgspenger-utbetaling/skjema/bc12baac-0f0c-427e-a059-b9fbf9a3adff'
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
        cy.findByRole('button', { name: 'Send inn' }).click();

        cy.url().should(
            'eq',
            'http://localhost:8080/journalpost/200#/omsorgspenger-utbetaling/fullfort/bc12baac-0f0c-427e-a059-b9fbf9a3adff'
        );
        cy.contains('Tilbake til LOS').scrollIntoView().should('be.visible');
    });
    it('Kan sende inn søknad for selvstendig næringsdrivende', () => {
        cy.contains(/Frilanser/i).click();
        cy.findByRole('group', { name: 'Har søker dekket 10 omsorgsdager?' }).within(() => {
            cy.findByText('Ja').click();
        });
        cy.findByLabelText('Når startet søker som frilanser?').type('01.01.2019');
        cy.findByLabelText('Når sluttet søker som frilanser?')
        // cy.findAllByRole('combobox').eq(1).select(fraværÅrsak.ORDINÆRT_FRAVÆR);
        // cy.findByLabelText('Fra og med').type('01.10.2022');
        // cy.findByLabelText('Til og med').type('10.10.2022');
        // cy.findByLabelText('Normal arbeidstid per dag').type('7');
        // cy.findByLabelText('Timer fravær per dag').type('7');

        // cy.findByText('Ikke relevant').click();
        // cy.findAllByText('Ikke opplyst').eq(0).click();
        // cy.findAllByText('Ikke opplyst').eq(1).click();
        // cy.findByRole('button', { name: 'Send inn' }).click();
        // cy.findByRole('button', { name: 'Videre' }).click();
        // cy.findByRole('button', { name: 'Send inn' }).click();

        cy.url().should(
            'eq',
            'http://localhost:8080/journalpost/200#/omsorgspenger-utbetaling/fullfort/bc12baac-0f0c-427e-a059-b9fbf9a3adff'
        );
        cy.contains('Tilbake til LOS').scrollIntoView().should('be.visible');
    });

    // sjekke at journalpostnummer fra flere saker vises
    // sjekk av validering og feilmeldinger på alle felter
    // sjekk at man ikke får sende inn dersom man har valideringsfeil
    // sjekk at alle input-felter fungerer og oppdaterer state?
    // sjekke at eksisterende søknadsperioder vises?
});
