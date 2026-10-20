import { fjernIndexFraLabel } from '../../../app/components/skjema/skjemaUtils';

describe('skjemaUtils', () => {
    test('fjerner index fra label', () => {
        const label = 'felt[11].feltnavn';

        expect(fjernIndexFraLabel(label)).toEqual('felt[].feltnavn');
    });

    test('rører ikke label uten index', () => {
        const label = 'felt.feltnavn';

        expect(fjernIndexFraLabel(label)).toEqual(label);
    });
});
