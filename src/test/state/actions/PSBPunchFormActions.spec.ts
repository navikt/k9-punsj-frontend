import { configureStore } from '@reduxjs/toolkit';

import { PunchFormActionKeys } from '../../../app/models/enums';
import { IInputError } from '../../../app/models/types';
import { IPSBSoknadUt } from '../../../app/models/types/PSBSoknadUt';
import { resetAllStateAction } from '../../../app/state/actions/GlobalActions';
import {
    getSoknad,
    getSoknadLoadingAction,
    resetPunchFormAction,
    resetSoknadAction,
    setSoknadAction,
    updateSoknad,
    validerSoknad,
} from '../../../app/state/actions/PSBPunchFormActions';
import { rootReducer } from '../../../app/state/RootState';

const mockPost = vi.fn();
const mockGet = vi.fn();
const mockPut = vi.fn();
const mockConvertResponseToError = vi.fn();
const mockConvertProblemDetailToError = vi.fn();
const mockGetValidationErrorsFromProblemDetail = vi.fn();

vi.mock('app/utils', () => ({
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
    put: (...args: unknown[]) => mockPut(...args),
    convertResponseToError: (...args: unknown[]) => mockConvertResponseToError(...args),
    convertProblemDetailToError: (...args: unknown[]) => mockConvertProblemDetailToError(...args),
    getValidationErrorsFromProblemDetail: (...args: unknown[]) => mockGetValidationErrorsFromProblemDetail(...args),
}));

const minimalSoknad = (): IPSBSoknadUt => ({
    soeknadId: 'abc123',
    soekerId: '01017012345',
    barn: { norskIdent: '02017012345', foedselsdato: '' },
    opptjeningAktivitet: {},
});

const createPsbStore = () => configureStore({ reducer: rootReducer });

describe('PSBPunchFormActions.updateSoknad', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGet.mockReset();
    });

    it('kvitterer med lagret DTO etter PUT 200', async () => {
        const store = createPsbStore();
        const onSaved = vi.fn();
        const savedSoknad = { ...minimalSoknad(), klokkeslett: '13:15:00' };
        mockPut.mockImplementation((_path, _params, _body, callback) =>
            callback(new Response(JSON.stringify(savedSoknad), { status: 200 })),
        );

        await store.dispatch(updateSoknad(minimalSoknad(), onSaved));

        expect(onSaved).toHaveBeenCalledWith(savedSoknad);
        expect(store.getState().PLEIEPENGER_SYKT_BARN.punchFormState).toMatchObject({
            soknad: savedSoknad,
            isAwaitingUpdateResponse: false,
            updateSoknadError: undefined,
        });
    });

    it('kvitterer ikke ulagrede verdier etter PUT 500', async () => {
        const store = createPsbStore();
        const onSaved = vi.fn();
        mockConvertResponseToError.mockReturnValue({ status: 500 });
        mockPut.mockImplementation((_path, _params, _body, callback) =>
            callback(new Response(null, { status: 500 })),
        );

        await store.dispatch(updateSoknad(minimalSoknad(), onSaved));

        expect(onSaved).not.toHaveBeenCalled();
        expect(store.getState().PLEIEPENGER_SYKT_BARN.punchFormState.soknad).toBeUndefined();
        expect(store.getState().PLEIEPENGER_SYKT_BARN.punchFormState).toMatchObject({
            isAwaitingUpdateResponse: false,
            updateSoknadError: { status: 500 },
        });
    });

    it.each([200, 500])('beholder nyere Redux-snapshot og lagringsstatus etter eldre PUT %i', async (status) => {
        const store = createPsbStore();
        const responses: ((response: Response) => unknown)[] = [];
        const olderSoknad = { ...minimalSoknad(), mottattDato: '2020-03-15', klokkeslett: '12:53' };
        const newerSoknad = { ...olderSoknad, klokkeslett: '13:15' };
        const onOlderSaved = vi.fn();
        const onNewerSaved = vi.fn();
        mockPut.mockImplementation((_path, _params, _body, callback: (response: Response) => unknown) => {
            responses.push(callback);
        });

        store.dispatch(updateSoknad(olderSoknad, onOlderSaved));
        store.dispatch(updateSoknad(newerSoknad, onNewerSaved));
        await responses[1](new Response(JSON.stringify(newerSoknad), { status: 200 }));
        const newerState = store.getState();
        expect(newerState.PLEIEPENGER_SYKT_BARN.punchFormState).toMatchObject({
            soknad: newerSoknad,
            isAwaitingUpdateResponse: false,
            updateSoknadError: undefined,
        });
        expect(onNewerSaved).toHaveBeenCalledWith(newerSoknad);

        await responses[0](new Response(status === 200 ? JSON.stringify(olderSoknad) : null, { status }));

        expect(store.getState()).toBe(newerState);
        expect(onOlderSaved).not.toHaveBeenCalled();
        expect(mockConvertResponseToError).not.toHaveBeenCalled();
    });

    describe.each([
        { scenario: 'nullstilling av søknad', reset: resetSoknadAction },
        { scenario: 'nullstilling av skjema', reset: resetPunchFormAction },
        { scenario: 'global nullstilling', reset: resetAllStateAction },
    ])('$scenario', ({ reset }) => {
        it.each([200, 500])('ignorerer sen PUT %i uten å gjenopprette søknad eller lagringsfeil', async (status) => {
            const store = createPsbStore();
            const responses: ((response: Response) => unknown)[] = [];
            const onSaved = vi.fn();
            const editedSoknad = { ...minimalSoknad(), klokkeslett: '13:15' };
            store.dispatch(setSoknadAction({ soeknadId: editedSoknad.soeknadId, klokkeslett: '12:53' }));
            mockPut.mockImplementation((_path, _params, _body, callback: (response: Response) => unknown) => {
                responses.push(callback);
            });
            store.dispatch(updateSoknad(editedSoknad, onSaved));
            expect(store.getState().PLEIEPENGER_SYKT_BARN.punchFormState.isAwaitingUpdateResponse).toBe(true);

            store.dispatch(reset());
            const resetState = store.getState();
            const form = resetState.PLEIEPENGER_SYKT_BARN.punchFormState;
            expect(form.soknad).toBeUndefined();
            expect(form.updateRequestId).toBeUndefined();
            expect(form.isAwaitingUpdateResponse).toBeUndefined();
            expect(form.updateSoknadError).toBeUndefined();

            await responses[0](new Response(status === 200 ? JSON.stringify(editedSoknad) : null, { status }));

            expect(store.getState()).toBe(resetState);
            expect(onSaved).not.toHaveBeenCalled();
            expect(mockConvertResponseToError).not.toHaveBeenCalled();
        });
    });

    describe.each([
        { phase: 'under innlasting', loaded: false },
        { phase: 'etter innlasting', loaded: true },
    ])('$phase av en annen søknad', ({ loaded }) => {
        it.each([200, 500])('ignorerer sen PUT %i fra forrige søknad', async (status) => {
            const store = createPsbStore();
            const responses: ((response: Response) => unknown)[] = [];
            const loads: ((response: Response, soknad: IPSBSoknadUt) => unknown)[] = [];
            const onSaved = vi.fn();
            const editedSoknad = { ...minimalSoknad(), klokkeslett: '13:15' };
            const nextSoknad = { ...minimalSoknad(), soeknadId: 'next-draft', klokkeslett: '14:30' };
            store.dispatch(setSoknadAction({ soeknadId: editedSoknad.soeknadId, klokkeslett: '12:53' }));
            mockPut.mockImplementation((_path, _params, _body, callback: (response: Response) => unknown) => {
                responses.push(callback);
            });
            mockGet.mockImplementation(
                (_path, _params, _headers, callback: (response: Response, soknad: IPSBSoknadUt) => unknown) => {
                    loads.push(callback);
                },
            );
            store.dispatch(updateSoknad(editedSoknad, onSaved));

            store.dispatch(getSoknad(nextSoknad.soeknadId));
            const loadingForm = store.getState().PLEIEPENGER_SYKT_BARN.punchFormState;
            expect(loadingForm.isSoknadLoading).toBe(true);
            expect(loadingForm.updateRequestId).toBeUndefined();
            expect(loadingForm.isAwaitingUpdateResponse).toBeUndefined();
            expect(loadingForm.updateSoknadError).toBeUndefined();
            if (loaded) {
                await loads[0](new Response(null, { status: 200 }), nextSoknad);
            }
            const enteredState = store.getState();

            await responses[0](new Response(status === 200 ? JSON.stringify(editedSoknad) : null, { status }));

            expect(store.getState()).toBe(enteredState);
            expect(onSaved).not.toHaveBeenCalled();
            expect(mockConvertResponseToError).not.toHaveBeenCalled();
            if (!loaded) {
                expect(store.getState().PLEIEPENGER_SYKT_BARN.punchFormState.isSoknadLoading).toBe(true);
                await loads[0](new Response(null, { status: 200 }), nextSoknad);
            }
            expect(store.getState().PLEIEPENGER_SYKT_BARN.punchFormState).toMatchObject({
                soknad: nextSoknad,
                isSoknadLoading: false,
                isAwaitingUpdateResponse: undefined,
                updateSoknadError: undefined,
            });
        });
    });

    describe.each([
        { scenario: 'nullstilling', action: resetSoknadAction },
        { scenario: 'innlasting', action: getSoknadLoadingAction },
    ])('$scenario', ({ action }) => {
        it.each([200, 500])('fjerner lagringsstatus fra avsluttet PUT %i', async (status) => {
            const store = createPsbStore();
            mockConvertResponseToError.mockReturnValue({ status: 500 });
            mockPut.mockImplementation((_path, _params, _body, callback) =>
                callback(new Response(status === 200 ? JSON.stringify(minimalSoknad()) : null, { status })),
            );
            await store.dispatch(updateSoknad(minimalSoknad()));
            const savedForm = store.getState().PLEIEPENGER_SYKT_BARN.punchFormState;
            expect(savedForm.isAwaitingUpdateResponse).toBe(false);
            expect(savedForm.updateSoknadError).toEqual(status === 500 ? { status: 500 } : undefined);

            store.dispatch(action());

            const form = store.getState().PLEIEPENGER_SYKT_BARN.punchFormState;
            expect(form.updateRequestId).toBeUndefined();
            expect(form.isAwaitingUpdateResponse).toBeUndefined();
            expect(form.updateSoknadError).toBeUndefined();
        });
    });

    it('ignorerer eldre PUT 200 når JSON-lesingen fullføres etter en nyere lagring', async () => {
        const store = createPsbStore();
        const responses: ((response: Response) => unknown)[] = [];
        const olderSoknad = { ...minimalSoknad(), klokkeslett: '12:53' };
        const newerSoknad = { ...olderSoknad, klokkeslett: '13:15' };
        const onOlderSaved = vi.fn();
        mockPut.mockImplementation((_path, _params, _body, callback: (response: Response) => unknown) => {
            responses.push(callback);
        });
        let resolveBody!: (value: IPSBSoknadUt) => void;
        const body = new Promise<IPSBSoknadUt>((resolve) => {
            resolveBody = resolve;
        });
        const olderResponse = new Response(null, { status: 200 });
        vi.spyOn(olderResponse, 'json').mockReturnValue(body);

        store.dispatch(updateSoknad(olderSoknad, onOlderSaved));
        const olderPending = responses[0](olderResponse);
        store.dispatch(updateSoknad(newerSoknad));
        await responses[1](new Response(JSON.stringify(newerSoknad), { status: 200 }));
        const newerState = store.getState();
        resolveBody(olderSoknad);
        await olderPending;

        expect(newerState.PLEIEPENGER_SYKT_BARN.punchFormState.soknad).toEqual(newerSoknad);
        expect(store.getState()).toBe(newerState);
        expect(onOlderSaved).not.toHaveBeenCalled();
    });
});

describe('PSBPunchFormActions.validerSoknad', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockConvertProblemDetailToError.mockReturnValue({ status: 500, message: 'Ukjent feil' });
    });

    it('dispatches uncomplete action for 400 ProblemDetail with feil', () => {
        const dispatch = vi.fn();
        const responseData = { feil: [{ felt: 'ytelse.søknadsperiode', feilmelding: 'Mangler verdi' }] };
        const errors: IInputError[] = [{ felt: 'ytelse.søknadsperiode', feilmelding: 'Mangler verdi' }];

        mockGetValidationErrorsFromProblemDetail.mockReturnValue(errors);
        mockPost.mockImplementation((_path, _params, _headers, _body, callback) =>
            callback({ status: 400 } as Response, responseData),
        );

        validerSoknad(minimalSoknad())(dispatch);

        expect(mockGetValidationErrorsFromProblemDetail).toHaveBeenCalledWith(responseData);
        expect(dispatch).toHaveBeenNthCalledWith(1, { type: PunchFormActionKeys.SOKNAD_VALIDER_REQUEST });
        expect(dispatch).toHaveBeenNthCalledWith(2, {
            type: PunchFormActionKeys.SOKNAD_VALIDER_UNCOMPLETE,
            errors,
        });
    });

    it('dispatches generic valider error for 400 ProblemDetail without feil', () => {
        const dispatch = vi.fn();
        const responseData = { title: 'Ugyldig søknad for validering', detail: 'Ingen feilliste' };
        const problemDetailError = { status: 400, message: 'Ingen feilliste' };

        mockConvertProblemDetailToError.mockReturnValue(problemDetailError);
        mockGetValidationErrorsFromProblemDetail.mockReturnValue([]);
        mockPost.mockImplementation((_path, _params, _headers, _body, callback) =>
            callback({ status: 400 } as Response, responseData),
        );

        validerSoknad(minimalSoknad())(dispatch);

        expect(dispatch).toHaveBeenNthCalledWith(1, { type: PunchFormActionKeys.SOKNAD_VALIDER_REQUEST });
        expect(dispatch).toHaveBeenNthCalledWith(2, {
            type: PunchFormActionKeys.SOKNAD_VALIDER_ERROR,
            error: problemDetailError,
        });
    });

    it('dispatches error from ProblemDetail for non-400 status', () => {
        const dispatch = vi.fn();
        const responseData = { title: 'Feil ved validering av søknad', detail: 'Backend message' };
        const problemDetailError = { status: 500, message: 'Backend message' };

        mockConvertProblemDetailToError.mockReturnValue(problemDetailError);
        mockPost.mockImplementation((_path, _params, _headers, _body, callback) =>
            callback({ status: 500 } as Response, responseData),
        );

        validerSoknad(minimalSoknad())(dispatch);

        expect(mockConvertProblemDetailToError).toHaveBeenCalledWith({ status: 500 }, responseData);
        expect(dispatch).toHaveBeenNthCalledWith(1, { type: PunchFormActionKeys.SOKNAD_VALIDER_REQUEST });
        expect(dispatch).toHaveBeenNthCalledWith(2, {
            type: PunchFormActionKeys.SOKNAD_VALIDER_ERROR,
            error: problemDetailError,
        });
    });

    it('does not send X-Nav-NorskIdent header for valider request', () => {
        const dispatch = vi.fn();

        mockPost.mockImplementation((_path, _params, _headers, _body, callback) =>
            callback({ status: 202 } as Response, {}),
        );

        validerSoknad(minimalSoknad())(dispatch);

        expect(mockPost).toHaveBeenCalled();
        expect(mockPost.mock.calls[0][2]).toBeUndefined();
    });
});
