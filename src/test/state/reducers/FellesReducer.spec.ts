const mockGet = jest.fn();

jest.mock('app/utils', () => ({
    get: (...args: unknown[]) => mockGet(...args),
    post: jest.fn(),
    put: jest.fn(),
    convertResponseToError: jest.fn(),
}));

import FellesReducer, { getJournalpost, getJournalpostLoadAction } from 'app/state/reducers/FellesReducer';

describe('FellesReducer.getJournalpost', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('dispatches request error when get rejects on network failure', async () => {
        const dispatch = jest.fn();

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
    it('clears previous journalpost status flags on new load', () => {
        const previousState = {
            dedupKey: 'dedup-key',
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
