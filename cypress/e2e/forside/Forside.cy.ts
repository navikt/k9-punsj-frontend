import { rest } from 'msw';

import { LOCAL_API_URL } from '../../../src/mocks/konstanter';

describe('forside', () => {
    beforeEach(() => {
        cy.visit('/', {
            onBeforeLoad: (window) => {},
        });
    });
    it('kan søke opp journalpost', () => {
        cy.soekPaaJournalpost();
        cy.url().should('contains', '/journalpost/200');
    });

    it('får feilmelding når journalposten ikke finnes', () => {
        cy.window().then((window) => {
            const { worker } = window.msw;
            worker.use(rest.get(`${LOCAL_API_URL}/journalpost/201`, (req, res, ctx) => res(ctx.status(404))));
        });

        cy.soekPaaJournalpost('201');
        cy.contains(/Det finnes ingen journalposter med ID 201/i).should('exist');
    });

    it('viser feilmelding ved forbidden', () => {
        cy.window().then((window) => {
            const { worker } = window.msw;
            worker.use(rest.get(`${LOCAL_API_URL}/journalpost/203`, (req, res, ctx) => res(ctx.status(403))));
        });
        cy.soekPaaJournalpost('203');
        cy.contains(/Du har ikke tilgang til å slå opp denne personen/i).should('exist');
    });

    // teste 409 på journalpost
    // teste uhåndterte feilmeldinger
});
