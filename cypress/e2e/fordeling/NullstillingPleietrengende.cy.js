import { ApiPath } from 'app/apiConfig';
import { http, HttpResponse } from 'msw/http';
import { getFagsakNavnForSelect } from '../../utils/utils';
import journalpost from '../../fixtures/jpPSB300.json';
import fagsaker from '../../fixtures/fagsaker.json';
import barnFraApi from '../../fixtures/barn.json';

const dokumenttype = 'Pleiepenger sykt barn';
const fnrNySøker = '12448325820';
const fagsakMedBarn = fagsaker[2];
const barnFraListe = barnFraApi.barn[0];
const observedRequestsProperty = '__fordelingObservedRequests';
const lukkDebuggPath = ApiPath.JOURNALPOST_LUKK_DEBUGG.replace('{journalpostId}', journalpost.journalpostId);

const observer = (appWindow, method, getResponse) => ({ request }) => {
    const observedRequest = {
        method,
        path: new URL(request.url).pathname,
    };
    const norskIdent = request.headers.get('X-Nav-NorskIdent');
    if (norskIdent) {
        observedRequest.norskIdent = norskIdent;
    }
    appWindow[observedRequestsProperty].push(observedRequest);
    return getResponse(request);
};

const installTestHandlers = ({ tommeLister = false } = {}) => {
    cy.window().then((window) => {
        window[observedRequestsProperty] = [];
        window.msw.worker.use(
            http.get(ApiPath.HENT_FAGSAK_PÅ_IDENT, observer(window, 'GET', ({ headers }) =>
                HttpResponse.json(
                    tommeLister || headers.get('X-Nav-NorskIdent') === fnrNySøker ? [] : fagsaker,
                    { status: 200 },
                ),
            )),
            http.get(
                ApiPath.BARN_GET,
                observer(
                    window,
                    'GET',
                    () => HttpResponse.json(tommeLister ? { ...barnFraApi, barn: [] } : barnFraApi, { status: 200 }),
                ),
            ),
            http.get(ApiPath.GOSYS_GJELDER, observer(window, 'GET', () =>
                HttpResponse.json({ Annet: 'Gjelder noe annet, må velges i Gosys' }, { status: 200 }),
            )),
            http.post(
                ApiPath.JOURNALPOST_MOTTAK,
                observer(window, 'POST', () => HttpResponse.json({}, { status: 200 })),
            ),
            http.post(
                ApiPath.JOURNALPOST_SETT_PAA_VENT.replace('{journalpostId}', ':journalpostId'),
                observer(window, 'POST', () => HttpResponse.json({ sattPåVent: true }, { status: 200 })),
            ),
            http.post(
                ApiPath.JOURNALPOST_KOPIERE.replace('{journalpostId}', ':journalpostId'),
                observer(window, 'POST', () => HttpResponse.json({ saksnummer: '1DQAW94' }, { status: 200 })),
            ),
            http.post(
                ApiPath.JOURNALPOST_SETT_BEHANDLINGSÅR.replace('{journalpostId}', ':journalpostId'),
                observer(window, 'POST', () => new HttpResponse(null, { status: 200 })),
            ),
            http.post(
                ApiPath.OPPRETT_GOSYS_OPPGAVE,
                observer(window, 'POST', () => HttpResponse.json({}, { status: 200 })),
            ),
            http.post(
                ApiPath.JOURNALPOST_LUKK_OPPGAVE.replace('{journalpostId}', ':journalpostId'),
                observer(window, 'POST', () => HttpResponse.json({}, { status: 200 })),
            ),
            http.get(
                ApiPath.JOURNALPOST_LUKK_DEBUGG.replace('{journalpostId}', ':journalpostId'),
                observer(window, 'GET', () => HttpResponse.json({}, { status: 200 })),
            ),
        );
    });

    cy.window().then(async (window) => {
        const response = await window.fetch(ApiPath.GOSYS_GJELDER);
        expect(response.status).to.equal(200);
        expect(window[observedRequestsProperty]).to.deep.equal([
            { method: 'GET', path: ApiPath.GOSYS_GJELDER },
        ]);
        window[observedRequestsProperty] = [];
    });
};

const visitFordeling = (options) => {
    cy.visit(`/journalpost/${journalpost.journalpostId}`);
    cy.findByText(/Skjul/i).should('exist').click();
    installTestHandlers(options);
};

const velgManglendeFnr = () => {
    cy.findByLabelText('Reserver saksnummer til ny fagsak').check();
    cy.findByLabelText('Det gjelder et annet barn').check();
    cy.findByLabelText('Pleietrengende har ikke fødselsnummer').check();
    cy.findByLabelText('Pleietrengende har ikke fødselsnummer').should('be.checked');
    cy.findByLabelText('Pleietrengendes fødselsnummer:').should('be.disabled');
    cy.get('[data-test-id="pleietrengendeHarIkkeFnrInformasjon"]').should('exist');
};

const assertNoObservedRequests = () => {
    cy.window()
        .its(observedRequestsProperty)
        .should((requests) => {
            const mutasjonerOgDebugglukking = requests.filter(
                ({ method, path }) => method !== 'GET' || path === lukkDebuggPath,
            );
            expect(mutasjonerOgDebugglukking).to.deep.equal([]);
        });
};

describe(
    'Nullstilling av manglende fødselsnummer for pleietrengende',
    { testIsolation: true, viewportWidth: 1280, viewportHeight: 1450 },
    () => {
        it('nullstiller tillatelsen ved søkerbytte før annet barn velges', () => {
            visitFordeling();

            cy.findByText(/^Ja$/i).click();
            cy.findByLabelText('Velg fagsak')
                .select(getFagsakNavnForSelect(fagsakMedBarn.fagsakId, dokumenttype))
                .should('have.value', fagsakMedBarn.fagsakId);

            velgManglendeFnr();
            cy.get('[data-test-id="journalførOgFortsett"]').should('be.disabled');
            cy.findByLabelText('Pleietrengende har ikke fødselsnummer').uncheck();
            cy.get('[data-test-id="journalførOgVent"]').should('be.disabled');
            cy.findByLabelText('Pleietrengende har ikke fødselsnummer').check();
            cy.get('[data-test-id="journalførOgVent"]').should('not.be.disabled').click();
            cy.get('[data-test-id="klassifiserModal"]').should('exist');
            cy.get('[data-test-id="klassifiserModalAvbryt"]').click();
            cy.get('[data-test-id="klassifiserModal"]').should('not.exist');

            cy.findByText(/^Nei$/i).click();
            cy.findByLabelText('Søkers fødselsnummer eller D-nummer:').type(fnrNySøker);
            cy.window()
                .its(observedRequestsProperty)
                .should((requests) => {
                    expect(requests).to.deep.include({
                        method: 'GET',
                        path: ApiPath.HENT_FAGSAK_PÅ_IDENT,
                        norskIdent: fnrNySøker,
                    });
                    expect(requests).to.deep.include({
                        method: 'GET',
                        path: ApiPath.BARN_GET,
                        norskIdent: fnrNySøker,
                    });
                });
            cy.findByLabelText('Velg hvilket barn det gjelder')
                .should('exist');
            cy.get('[data-test-id="journalførOgVent"]').should('be.visible').and('be.disabled');

            cy.findByText(/^Ja$/i).click();
            cy.findByLabelText('Velg fagsak').should('exist');
            cy.get('.journalpostpanel').within(() => {
                cy.findByText(fnrNySøker).should('not.exist');
                cy.findByText(/Barnets ID/i).should('not.exist');
                cy.findByText(barnFraListe.identitetsnummer).should('not.exist');
            });
            cy.get('[data-test-id="journalførOgFortsett"]').should('be.disabled');
            cy.get('[data-test-id="journalførOgVent"]').should('be.disabled');

            cy.findByLabelText('Det gjelder et annet barn').check();
            cy.findByLabelText('Pleietrengende har ikke fødselsnummer').should('not.be.checked');
            cy.findByLabelText('Pleietrengendes fødselsnummer:').should('not.be.disabled');
            cy.get('[data-test-id="pleietrengendeHarIkkeFnrInformasjon"]').should('not.exist');
            cy.get('[data-test-id="journalførOgVent"]').should('be.disabled');
            assertNoObservedRequests();
        });

        it('nullstiller tillatelsen ved dokumenttypebytte', () => {
            visitFordeling({ tommeLister: true });
            cy.findByText(/^Ja$/i).click();
            cy.findByLabelText('Pleietrengende har ikke fødselsnummer').should('exist').check();
            cy.findByLabelText('Pleietrengende har ikke fødselsnummer').should('be.checked');
            cy.findByLabelText('Pleietrengendes fødselsnummer:').should('be.disabled');
            cy.get('[data-test-id="pleietrengendeHarIkkeFnrInformasjon"]').should('exist');
            cy.get('[data-test-id="journalførOgVent"]').should('not.be.disabled');

            cy.get('[data-test-id="dokumenttypeRadioPanelOmsorgspenger"]').click();
            cy.get('[data-test-id="dokumenttypeRadioPanelPleiepenger"]').click();

            cy.findByLabelText('Pleietrengende har ikke fødselsnummer').should('exist');
            cy.findByLabelText('Pleietrengende har ikke fødselsnummer').should('not.be.checked');
            cy.findByLabelText('Pleietrengendes fødselsnummer:').should('not.be.disabled');
            cy.get('[data-test-id="pleietrengendeHarIkkeFnrInformasjon"]').should('not.exist');
            cy.get('[data-test-id="journalførOgVent"]').should('be.disabled');
            assertNoObservedRequests();
        });

        it('nullstiller tillatelsen ved bytte mellom ny og eksisterende sak', () => {
            visitFordeling();
            cy.findByText(/^Ja$/i).click();
            cy.findByLabelText('Velg fagsak')
                .select(getFagsakNavnForSelect(fagsakMedBarn.fagsakId, dokumenttype))
                .should('have.value', fagsakMedBarn.fagsakId);
            velgManglendeFnr();

            cy.findByLabelText('Reserver saksnummer til ny fagsak').uncheck();
            cy.findByLabelText('Reserver saksnummer til ny fagsak').check();
            cy.get('[data-test-id="journalførOgVent"]').should('be.disabled');

            cy.findByLabelText('Det gjelder et annet barn').check();
            cy.findByLabelText('Pleietrengende har ikke fødselsnummer').should('not.be.checked');
            cy.findByLabelText('Pleietrengendes fødselsnummer:').should('not.be.disabled');
            cy.get('[data-test-id="pleietrengendeHarIkkeFnrInformasjon"]').should('not.exist');
            assertNoObservedRequests();
        });
    },
);
