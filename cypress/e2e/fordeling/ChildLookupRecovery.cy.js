import { ApiPath } from 'app/apiConfig';
import { http, HttpResponse } from 'msw/http';
import journalpost from '../../fixtures/jpPSB300.json';
import barnFraApi from '../../fixtures/barn.json';

const observedRequestsProperty = '__childLookupRecoveryRequests';
const norskIdent = journalpost.norskIdent;
const barn = barnFraApi.barn[2];
const lukkDebuggPath = ApiPath.JOURNALPOST_LUKK_DEBUGG.replace('{journalpostId}', journalpost.journalpostId);

const observe = (window, method, respond, includeData = false) => async ({ request }) => {
    const response = await respond(request);
    if (!response) return undefined;

    const observedRequest = {
        method,
        path: new URL(request.url).pathname,
        norskIdent: request.headers.get('X-Nav-NorskIdent'),
        status: response.status,
    };
    if (includeData) {
        observedRequest.data = await response.clone().json();
    }
    window[observedRequestsProperty].push(observedRequest);
    return response;
};

const installRecoveryHandlers = (failureStatus) => {
    cy.window().then((window) => {
        window[observedRequestsProperty] = [];
        let barnRequestCount = 0;

        window.msw.worker.use(
            http.get(
                ApiPath.HENT_FAGSAK_PÅ_IDENT,
                observe(
                    window,
                    'GET',
                    (request) =>
                        request.headers.get('X-Nav-NorskIdent') === norskIdent
                            ? HttpResponse.json([], { status: 200 })
                            : undefined,
                    true,
                ),
            ),
            http.get(
                ApiPath.BARN_GET,
                observe(
                    window,
                    'GET',
                    (request) => {
                        if (request.headers.get('X-Nav-NorskIdent') !== norskIdent) return undefined;

                        barnRequestCount += 1;
                        return barnRequestCount === 1
                            ? HttpResponse.json({ error: 'Child lookup failed' }, { status: failureStatus })
                            : HttpResponse.json(barnFraApi, { status: 200 });
                    },
                    true,
                ),
            ),
            http.post(ApiPath.JOURNALPOST_MOTTAK, observe(window, 'POST', () => HttpResponse.json({}, { status: 200 }))),
            http.post(
                ApiPath.JOURNALPOST_SETT_PAA_VENT.replace('{journalpostId}', ':journalpostId'),
                observe(window, 'POST', () => HttpResponse.json({ sattPåVent: true }, { status: 200 })),
            ),
            http.post(
                ApiPath.JOURNALPOST_KOPIERE.replace('{journalpostId}', ':journalpostId'),
                observe(window, 'POST', () => HttpResponse.json({ saksnummer: '1DQAW94' }, { status: 200 })),
            ),
            http.post(
                ApiPath.JOURNALPOST_SETT_BEHANDLINGSÅR.replace('{journalpostId}', ':journalpostId'),
                observe(window, 'POST', () => new HttpResponse(null, { status: 200 })),
            ),
            http.post(
                ApiPath.OPPRETT_GOSYS_OPPGAVE,
                observe(window, 'POST', () => HttpResponse.json({}, { status: 200 })),
            ),
            http.post(
                ApiPath.JOURNALPOST_LUKK_OPPGAVE.replace('{journalpostId}', ':journalpostId'),
                observe(window, 'POST', () => HttpResponse.json({}, { status: 200 })),
            ),
            http.get(
                ApiPath.JOURNALPOST_LUKK_DEBUGG.replace('{journalpostId}', ':journalpostId'),
                observe(window, 'GET', () => HttpResponse.json({}, { status: 200 })),
            ),
        );
    });
};

const visitFordeling = () => {
    cy.visit(`/journalpost/${journalpost.journalpostId}`);
    cy.findByText(/Skjul/i).should('exist').click();
};

const assertNoMutations = () => {
    cy.window()
        .its(observedRequestsProperty)
        .should((requests) => {
            const mutations = requests.filter(
                ({ method, path }) => method !== 'GET' || path === lukkDebuggPath,
            );
            expect(mutations).to.deep.equal([]);
        });
};

describe(
    'Gjenoppretting etter feil ved oppslag av barn',
    { testIsolation: true, viewportWidth: 1280, viewportHeight: 1450 },
    () => {
        [403, 500].forEach((failureStatus) => {
            it(`viser barnelisten etter ${failureStatus} og deretter 200`, () => {
                visitFordeling();
                installRecoveryHandlers(failureStatus);

                cy.findByText(/^Ja$/i).click();
                cy.window()
                    .its(observedRequestsProperty)
                    .should((requests) => {
                        const childRequests = requests.filter(
                            ({ method, path }) => method === 'GET' && path === ApiPath.BARN_GET,
                        );
                        const fagsakRequests = requests.filter(
                            ({ method, path }) => method === 'GET' && path === ApiPath.HENT_FAGSAK_PÅ_IDENT,
                        );
                        expect(childRequests).to.have.length(1);
                        expect(childRequests[0]).to.deep.include({
                            norskIdent,
                            status: failureStatus,
                            data: { error: 'Child lookup failed' },
                        });
                        expect(fagsakRequests[0]).to.deep.include({
                            norskIdent,
                            status: 200,
                            data: [],
                        });
                    });
                cy.findByLabelText('Pleietrengendes fødselsnummer:').should('exist');

                cy.findByText(/^Nei$/i).click();
                cy.findByText(/^Ja$/i).click();
                cy.window()
                    .its(observedRequestsProperty)
                    .should((requests) => {
                        const childRequests = requests.filter(
                            ({ method, path }) => method === 'GET' && path === ApiPath.BARN_GET,
                        );
                        expect(childRequests.length).to.be.greaterThan(1);
                        expect(childRequests[1]).to.deep.include({
                            norskIdent,
                            status: 200,
                            data: barnFraApi,
                        });
                    });

                cy.findByLabelText('Velg hvilket barn det gjelder').should('be.visible');
                cy.findByLabelText('Det gjelder et annet barn').should('not.be.checked');
                cy.findByLabelText('Pleietrengendes fødselsnummer:').should('not.exist');
                cy.findByLabelText('Pleietrengende har ikke fødselsnummer').should('not.exist');
                cy.get('[data-test-id="journalførOgFortsett"]').should('be.disabled');
                cy.get('[data-test-id="journalførOgVent"]').should('be.disabled');

                cy.findByLabelText('Velg hvilket barn det gjelder').select(barn.identitetsnummer);
                cy.get('.journalpostpanel').within(() => {
                    cy.findByText(barn.identitetsnummer).should('exist');
                });
                cy.get('[data-test-id="journalførOgFortsett"]').should('not.be.disabled');
                cy.get('[data-test-id="journalførOgVent"]').should('not.be.disabled');

                cy.findByLabelText('Det gjelder et annet barn').check();
                cy.findByLabelText('Pleietrengendes fødselsnummer:').should('be.visible');
                cy.findByLabelText('Velg hvilket barn det gjelder').should('be.disabled');
                assertNoMutations();
            });
        });
    },
);
