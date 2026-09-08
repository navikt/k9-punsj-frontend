import OLPSchema from './schema';

const validateFrilanser = (frilanser: Record<string, unknown>) =>
    OLPSchema.validateAt('opptjeningAktivitet.frilanser', {
        opptjeningAktivitet: { frilanser },
    });

describe('frilanser i OLP-skjemaet', () => {
    test('avviser sluttdato før startdato', async () => {
        await expect(
            validateFrilanser({
                startdato: '2022-10-10',
                sluttdato: '2022-10-01',
                jobberFortsattSomFrilans: false,
            }),
        ).rejects.toThrow('Sluttdato kan ikke være før startdato.');
    });

    test('godtar like datoer og tom sluttdato for aktiv frilanser', async () => {
        await expect(
            validateFrilanser({
                startdato: '2022-10-10',
                sluttdato: '2022-10-10',
                jobberFortsattSomFrilans: false,
            }),
        ).resolves.toBeDefined();
        await expect(
            validateFrilanser({
                startdato: '2022-10-10',
                sluttdato: '',
                jobberFortsattSomFrilans: true,
            }),
        ).resolves.toBeDefined();
    });
});