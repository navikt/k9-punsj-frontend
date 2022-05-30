import { ApiPath } from 'app/apiConfig';
import { BACKEND_BASE_URL } from '../../../src/mocks/konstanter';

describe('Fordeling', () => {
    beforeEach(() => {
        cy.visit('/journalpost/200');
    });
    it('viser dokumentvalg', () => {
        cy.contains(/Dette gjelder:?/i).should('exist');
        cy.contains('Pleiepenger').should('exist');
        cy.contains('Korrigering av inntektsmelding omsorgspenger AG').should('exist');
        cy.contains('Annet').should('exist');
    });

    it('kan opprette journalføringsoppgave i Gosys', () => {
        cy.intercept(
            {
                method: 'GET',
                url: '/api/k9-punsj/gosys/gjelder',
            },
            { fixture: 'gosysKategorier.json' }
        ).as('gosysKategorier');
        cy.contains('Annet').click();
        cy.wait('@gosysKategorier');
        const identifikatorInput = cy.findByLabelText(/Søkers fødselsnummer eller D-nummer/i).should('exist');
        identifikatorInput.clear().type('13337');
    });
    it('kan korrigere inntektsmelding uten at sjekkSkalTilK9 kjøres', () => {
        cy.window().then((window) => {
            const { worker, rest } = window.msw;
            worker.use(
                rest.get(`${BACKEND_BASE_URL}/api/k9-punsj${ApiPath.SJEKK_OM_SKAL_TIL_K9SAK}`, (req, res, ctx) =>
                    res(
                        ctx.json({
                            k9sak: false,
                        })
                    )
                )
            );
        });

        cy.findByText(/Korrigering av inntektsmelding omsorgspenger AG/i).click();
        cy.findByText('Ja').click();
        cy.findByRole('button', { name: /Videre/i }).click();
        cy.findByText('Korrigere/trekke refusjonskrav omsorgspenger').click();
        cy.findByRole('button', { name: /bekreft/i }).click();
        cy.url().should('eq', 'http://localhost:8080/journalpost/200#/korrigering-av-inntektsmelding');
    });
});
