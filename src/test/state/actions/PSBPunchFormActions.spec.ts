import { PunchFormActionKeys } from '../../../app/models/enums';
import { IInputError } from '../../../app/models/types';
import { IPSBSoknadUt } from '../../../app/models/types/PSBSoknadUt';
import { validerSoknad } from '../../../app/state/actions/PSBPunchFormActions';

const mockPost = jest.fn();
const mockConvertProblemDetailToError = jest.fn();
const mockGetValidationErrorsFromProblemDetail = jest.fn();

jest.mock('app/utils', () => ({
    get: jest.fn(),
    post: (...args: unknown[]) => mockPost(...args),
    put: jest.fn(),
    convertResponseToError: jest.fn(),
    convertProblemDetailToError: (...args: unknown[]) => mockConvertProblemDetailToError(...args),
    getValidationErrorsFromProblemDetail: (...args: unknown[]) => mockGetValidationErrorsFromProblemDetail(...args),
}));

const minimalSoknad = (): IPSBSoknadUt => ({
    soeknadId: 'abc123',
    soekerId: '01017012345',
    barn: { norskIdent: '02017012345', foedselsdato: '' },
    opptjeningAktivitet: {},
});

describe('PSBPunchFormActions.validerSoknad', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockConvertProblemDetailToError.mockReturnValue({ status: 500, message: 'Ukjent feil' });
    });

    it('dispatches uncomplete action for 400 ProblemDetail with feil', () => {
        const dispatch = jest.fn();
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
        const dispatch = jest.fn();
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
        const dispatch = jest.fn();
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
        const dispatch = jest.fn();

        mockPost.mockImplementation((_path, _params, _headers, _body, callback) =>
            callback({ status: 202 } as Response, {}),
        );

        validerSoknad(minimalSoknad())(dispatch);

        expect(mockPost).toHaveBeenCalled();
        expect(mockPost.mock.calls[0][2]).toBeUndefined();
    });
});
