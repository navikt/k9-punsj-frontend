import { afterEach, describe, expect, it, vi } from 'vitest';

import { ApiPath } from 'app/apiConfig';
import { defaultValuesBrev, previewMessage } from 'app/components/brev/utils';

const values = {
    ...defaultValuesBrev,
    brevmalkode: 'GENERELT_FRITEKSTBREV',
    mottaker: '81549300',
};

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('previewMessage', () => {
    it.each([
        { name: 'tom statusText', statusText: '', expected: '' },
        { name: 'statusText fra serveren', statusText: 'Not Found', expected: 'Not Found' },
    ])('returnerer feiltekst for 404 med $name', async ({ statusText, expected }) => {
        const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 404, statusText }));
        vi.stubGlobal('fetch', fetchMock);

        await expect(previewMessage(values, '81549300', 'PSB')).resolves.toBe(expected);
        expect(fetchMock).toHaveBeenCalledWith(
            ApiPath.BREV_FORHAANDSVIS,
            expect.objectContaining({ method: 'post', credentials: 'include' }),
        );
    });

    it('returnerer nettverksfeil uten å skjule feilmeldingen', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockRejectedValue(new TypeError('Nettverksfeil')),
        );

        await expect(previewMessage(values, '81549300', 'PSB')).resolves.toBe('Nettverksfeil');
    });
});
