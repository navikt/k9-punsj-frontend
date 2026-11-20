import { HttpResponse, http } from 'msw/http';
import { ApiPath } from 'app/apiConfig';
import journalpost from '../../cypress/fixtures/jpPSB300.json';
import { JOURNALPOST_LOADER_TEST_SCENARIOS } from './journalpostLoaderTestScenarios';

const journalpostUrl = (journalpostId: string) =>
    ApiPath.JOURNALPOST_GET.replace('{journalpostId}', journalpostId);
const closeUrl = (journalpostId: string) =>
    ApiPath.JOURNALPOST_LUKK_DEBUGG.replace('{journalpostId}', journalpostId);
const journalpostResponse = (journalpostId: string) => ({ ...journalpost, journalpostId });

const mockHandlersJournalpostLoader = {
    valid: http.get(journalpostUrl(JOURNALPOST_LOADER_TEST_SCENARIOS.valid), () =>
        HttpResponse.json(journalpostResponse(JOURNALPOST_LOADER_TEST_SCENARIOS.valid), { status: 200 }),
    ),
    loading: http.get(
        journalpostUrl(JOURNALPOST_LOADER_TEST_SCENARIOS.loading),
        () => new Promise<Response>(() => undefined),
    ),
    forbidden: http.get(journalpostUrl(JOURNALPOST_LOADER_TEST_SCENARIOS.forbidden), () =>
        new HttpResponse(null, { status: 403 }),
    ),
    notFound: http.get(journalpostUrl(JOURNALPOST_LOADER_TEST_SCENARIOS.notFound), () =>
        new HttpResponse(null, { status: 404 }),
    ),
    noDocuments: http.get(journalpostUrl(JOURNALPOST_LOADER_TEST_SCENARIOS.noDocuments), () =>
        HttpResponse.json(
            { ...journalpostResponse(JOURNALPOST_LOADER_TEST_SCENARIOS.noDocuments), dokumenter: [] },
            { status: 200 },
        ),
    ),
    supportedConflict: http.get(journalpostUrl(JOURNALPOST_LOADER_TEST_SCENARIOS.supportedConflict), () =>
        HttpResponse.json({ type: 'punsj://ikke-støttet-journalpost' }, { status: 409 }),
    ),
    serverError: http.get(journalpostUrl(JOURNALPOST_LOADER_TEST_SCENARIOS.serverError), () =>
        new HttpResponse(null, { status: 500 }),
    ),
    unknownConflict: http.get(journalpostUrl(JOURNALPOST_LOADER_TEST_SCENARIOS.unknownConflict), () =>
        HttpResponse.json({ type: 'punsj://ukjent-type' }, { status: 409 }),
    ),
    missingConflictType: http.get(journalpostUrl(JOURNALPOST_LOADER_TEST_SCENARIOS.missingConflictType), () =>
        HttpResponse.json({}, { status: 409 }),
    ),
    closeNotFoundConflict: http.get(journalpostUrl(JOURNALPOST_LOADER_TEST_SCENARIOS.closeNotFound), () =>
        HttpResponse.json({ type: 'punsj://ikke-støttet-journalpost' }, { status: 409 }),
    ),
    closeNotFound: http.get(closeUrl(JOURNALPOST_LOADER_TEST_SCENARIOS.closeNotFound), () =>
        new HttpResponse(null, { status: 404 }),
    ),
    closeAlreadyClosedConflict: http.get(
        journalpostUrl(JOURNALPOST_LOADER_TEST_SCENARIOS.closeAlreadyClosed),
        () => HttpResponse.json({ type: 'punsj://ikke-støttet-journalpost' }, { status: 409 }),
    ),
    closeAlreadyClosed: http.get(closeUrl(JOURNALPOST_LOADER_TEST_SCENARIOS.closeAlreadyClosed), () =>
        HttpResponse.json({ status: 'ALLEREDE_FERDIGSTILT' }, { status: 400 }),
    ),
    closeServerErrorConflict: http.get(
        journalpostUrl(JOURNALPOST_LOADER_TEST_SCENARIOS.closeServerError),
        () => HttpResponse.json({ type: 'punsj://ikke-støttet-journalpost' }, { status: 409 }),
    ),
    closeServerError: http.get(closeUrl(JOURNALPOST_LOADER_TEST_SCENARIOS.closeServerError), () =>
        new HttpResponse(null, { status: 500 }),
    ),
    closeSuccessConflict: http.get(
        journalpostUrl(JOURNALPOST_LOADER_TEST_SCENARIOS.closeSuccess),
        () => HttpResponse.json({ type: 'punsj://ikke-støttet-journalpost' }, { status: 409 }),
    ),
    closeSuccess: http.get(closeUrl(JOURNALPOST_LOADER_TEST_SCENARIOS.closeSuccess), () =>
        HttpResponse.json({ status: 'FERDIGSTILT' }, { status: 200 }),
    ),
};

export default mockHandlersJournalpostLoader;
