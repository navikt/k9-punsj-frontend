import { ApiPath } from '../../../app/apiConfig';
import { OMSKorrigering } from '../../../app/models/types/OMSKorrigering';
import { updateOMSKorrigering, validerOMSKorrigering } from '../../../app/state/actions/OMSPunchFormActions';

const mockGet = jest.fn();
const mockPost = jest.fn();
const mockPut = jest.fn();
const mockApiUrl = jest.fn((...args: unknown[]) => args[0] as string);
const mockInitializeDate = jest.fn();

jest.mock('app/utils', () => ({
    apiUrl: (path: string, pathParameters?: unknown) => mockApiUrl(path, pathParameters),
    get: (...args: unknown[]) => mockGet(...args),
    initializeDate: (...args: unknown[]) => mockInitializeDate(...args),
    post: (...args: unknown[]) => mockPost(...args),
    put: (...args: unknown[]) => mockPut(...args),
}));

const minimalKorrigering = (overrides: Partial<OMSKorrigering> = {}): OMSKorrigering =>
    ({
        mottattDato: '2026-02-27',
        klokkeslett: '10:00',
        soeknadId: 'e917ec68-66ce-4ce3-a8d2-f3d883f67103',
        soekerId: '01017012345',
        journalposter: ['123'],
        organisasjonsnummer: '999263550',
        arbeidsforholdId: null,
        fravaersperioder: [],
        ...overrides,
    }) as OMSKorrigering;

describe('OMSPunchFormActions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch = jest.fn().mockResolvedValue({ status: 202 }) as jest.Mock;
    });

    it('uses soekerId in X-Nav-NorskIdent header for valider request', async () => {
        const korrigering = minimalKorrigering({ soekerId: '12057900000' });

        await validerOMSKorrigering(korrigering);

        expect(mockApiUrl).toHaveBeenCalledWith(ApiPath.OMS_SOKNAD_VALIDER, { id: korrigering.soeknadId });
        expect(global.fetch).toHaveBeenCalledWith(
            ApiPath.OMS_SOKNAD_VALIDER,
            expect.objectContaining({
                method: 'post',
                headers: expect.objectContaining({
                    'X-Nav-NorskIdent': '12057900000',
                }),
            }),
        );
    });

    it('returns 400 response and skips fetch when soeknadId is blank on valider', async () => {
        const korrigering = minimalKorrigering({ soeknadId: '   ' });

        const response = await validerOMSKorrigering(korrigering);

        expect(global.fetch).not.toHaveBeenCalled();
        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toEqual({ feil: [] });
    });

    it('returns 400 response and skips put when soeknadId is blank on oppdater', async () => {
        const korrigering = minimalKorrigering({ soeknadId: '' });

        const response = await updateOMSKorrigering(korrigering);

        expect(mockPut).not.toHaveBeenCalled();
        expect(response.status).toBe(400);
    });
});
