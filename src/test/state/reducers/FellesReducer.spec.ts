const mockGet = vi.fn();

vi.mock('app/utils', () => ({
    get: (...args: unknown[]) => mockGet(...args),
    post: vi.fn(),
    put: vi.fn(),
    convertResponseToError: vi.fn(),
}));

import FellesReducer, { getJournalpost, getJournalpostLoadAction, resetBarnAction } from 'app/state/reducers/FellesReducer';
import { getHentBarnErrorAction, getHentBarnForbiddenAction, getHentBarnSuccessAction } from 'app/state/reducers/HentBarn';

describe('FellesReducer.getJournalpost', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('dispatches request error when get rejects on network failure', async () => {
        const dispatch = vi.fn();

        mockGet.mockRejectedValue(new TypeError('Failed to fetch'));

        await getJournalpost('123')(dispatch);

        expect(dispatch).toHaveBeenNthCalledWith(1, getJournalpostLoadAction());
        expect(dispatch).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                type: 'FELLES/PUNCH_JOURNALPOST_REQUEST_ERROR',
                error: expect.objectContaining({
                    statusText: 'Nettverksfeil',
                    message: 'Failed to fetch',
                }),
            }),
        );
    });
});

describe('FellesReducer', () => {
    it.each([
        ['oppslagsfeil', getHentBarnErrorAction()],
        ['tilgangsavslag', getHentBarnForbiddenAction()],
    ])('nullstiller %s etter vellykket oppslag av barn', (_, failureAction) => {
        const failedState = FellesReducer(undefined, failureAction);
        const barn = [
            {
                fornavn: 'Test',
                etternavn: 'Barn',
                identitetsnummer: '18410162721',
                fødselsdato: '2018-01-01',
                sammensattNavn: 'Test Barn',
            },
        ];

        const nextState = FellesReducer(failedState, getHentBarnSuccessAction(barn));

        expect(nextState).toEqual(
            expect.objectContaining({
                barn,
                hentBarnError: undefined,
                hentBarnForbidden: undefined,
                hentBarnSuccess: true,
            }),
        );
    });

    it('nullstiller feilstatus ved nullstilling av barn', () => {
        const failedState = FellesReducer(
            FellesReducer(undefined, getHentBarnErrorAction()),
            getHentBarnForbiddenAction(),
        );

        const nextState = FellesReducer(failedState, resetBarnAction());

        expect(nextState).toEqual(
            expect.objectContaining({
                hentBarnError: undefined,
                hentBarnForbidden: undefined,
            }),
        );
    });

    it('clears previous journalpost status flags on new load', () => {
        const previousState = {
            journalpostNotFound: true,
            journalpostForbidden: true,
            journalpostConflict: true,
            journalpostConflictError: {
                type: 'IKKE_STØTTET',
            },
            journalpostRequestError: {
                message: 'Noe gikk galt',
            },
        };

        const nextState = FellesReducer(previousState, getJournalpostLoadAction());

        expect(nextState).toEqual(
            expect.objectContaining({
                journalpostNotFound: undefined,
                journalpostForbidden: undefined,
                journalpostConflict: undefined,
                journalpostConflictError: undefined,
                journalpostRequestError: undefined,
                isJournalpostLoading: true,
            }),
        );
    });
});
