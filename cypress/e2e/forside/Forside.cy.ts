import { ApiPath } from 'app/apiConfig';

describe('forside', () => {
    beforeEach(() => {
        cy.visit('/', {
            onBeforeLoad: () => {},
        });
    });
    it('kan søke opp journalpost', () => {
        cy.soekPaaJournalpost();
        cy.url().should('contains', '/journalpost/200');
    });

    it('får feilmelding når journalposten ikke finnes', () => {
        cy.window().then((window) => {
            const { worker, http, HttpResponse } = window.msw;
            worker.use(
                http.get(
                    ApiPath.JOURNALPOST_GET.replace('{journalpostId}', '201'),
                    () => new HttpResponse(null, { status: 404 }),
                ),
            );
        });

        cy.soekPaaJournalpost('201');
        cy.contains(/Det finnes ingen journalposter med ID 201/i).should('exist');
    });

    it('viser feilmelding ved forbidden', () => {
        cy.window().then((window) => {
            const { worker, http, HttpResponse } = window.msw;
            worker.use(
                http.get(
                    ApiPath.JOURNALPOST_GET.replace('{journalpostId}', '203'),
                    () => new HttpResponse(null, { status: 403 }),
                ),
            );
        });
        cy.soekPaaJournalpost('203');
        cy.contains(/Du har ikke tilgang til å slå opp denne personen/i).should('exist');
    });

    // teste 409 på journalpost
    // teste uhåndterte feilmeldinger
});
