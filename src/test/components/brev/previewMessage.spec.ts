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
    it('returnerer statusfeil for en annen HTTP-feil enn 500', async () => {
        const notFound = new Response(null, { status: 404 });
        const fetchMock = vi.fn().mockResolvedValue(notFound);
        vi.stubGlobal('fetch', fetchMock);

        await expect(previewMessage(values, '81549300', 'PSB')).resolves.toBe(notFound.statusText);
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
