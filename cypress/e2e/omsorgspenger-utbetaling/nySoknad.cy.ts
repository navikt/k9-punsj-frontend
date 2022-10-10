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
        });
    });
    it('kan sende inn søknad om omsorgspengeutbetaling', () => {
        cy.contains(/Arbeidstaker/i).click();
        cy.findAllByRole('combobox').eq(0).select('979312059');
        cy.findAllByRole('combobox').eq(1).select(fraværÅrsak.ORDINÆRT_FRAVÆR);
        cy.findAllByRole('combobox').eq(2).select(søknadÅrsak.KONFLIKT_MED_ARBEIDSGIVER);
    });

    // sjekke at journalpostnummer fra flere saker vises
    // sjekk av validering og feilmeldinger på alle felter
    // sjekk at man ikke får sende inn dersom man har valideringsfeil
    // sjekk at alle input-felter fungerer og oppdaterer state?
    // sjekke at eksisterende søknadsperioder vises?
});
