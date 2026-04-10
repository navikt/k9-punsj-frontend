import backendSoknad from '../../../../cypress/fixtures/omp_ut/backendSoknad';
import frontendSoknad from '../../../../cypress/fixtures/omp_ut/frontendSoknad';
import { backendTilFrontendMapping, frontendTilBackendMapping } from './utils';
import { timerOgMinutterTilTimerMedDesimaler } from 'app/utils';
import { IOMPUTSoknad, IOMPUTSoknadBackend } from './types/OMPUTSoknad';

const backendFixture = backendSoknad as unknown as IOMPUTSoknadBackend;
const frontendFixture = frontendSoknad as unknown as IOMPUTSoknad;
const backendFravaersperioder = backendFixture.fravaersperioder || [];

describe('Mapping av omsorgspengeutbetaling', () => {
    test('mapper fra backend til frontend ', () => {
        const frontendMapping = backendTilFrontendMapping(backendFixture);
        const fraværsperioderArbeidstaker =
            frontendMapping?.opptjeningAktivitet?.arbeidstaker
                ?.map((arbeidstaker) => arbeidstaker.fravaersperioder)
                .flat() || [];
        const fraværsperioderSelvstendigNaeringsdrivende =
            frontendMapping.opptjeningAktivitet?.selvstendigNaeringsdrivende.fravaersperioder || [];
        const fraværsperioderFrilanser = frontendMapping.opptjeningAktivitet?.frilanser.fravaersperioder || [];
        const fraværsperioderFrontend = [
            ...fraværsperioderArbeidstaker,
            ...fraværsperioderFrilanser,
            ...fraværsperioderSelvstendigNaeringsdrivende,
        ];

        expect(new Set(fraværsperioderFrontend)).toEqual(new Set(backendFravaersperioder));
        expect(frontendMapping).toEqual(frontendFixture);
    });

    test('mapper fra frontend til backend ', () => {
        const backendMapping = frontendTilBackendMapping(frontendFixture);

        expect(backendMapping).toEqual(backendFixture);
    });

    test('samler fraværsperioder på samme arbeidstaker ved korrigering', () => {
        const [førsteFravaersperiode] = backendFravaersperioder;
        if (!førsteFravaersperiode) {
            throw new Error('Mangler fraværsperiode i testdata');
        }

        const backendMapping = backendTilFrontendMapping({
            ...backendFixture,
            erKorrigering: true,
            opptjeningAktivitet: undefined,
            fravaersperioder: [
                {
                    ...førsteFravaersperiode,
                    periode: {
                        fom: '2022-06-01',
                        tom: '2022-06-10',
                    },
                },
                {
                    ...førsteFravaersperiode,
                    periode: {
                        fom: '2022-06-11',
                        tom: '2022-06-23',
                    },
                },
            ],
        });

        expect(backendMapping.opptjeningAktivitet?.arbeidstaker).toHaveLength(1);
        expect(backendMapping.opptjeningAktivitet?.arbeidstaker[0].fravaersperioder).toHaveLength(2);
    });
});

describe('konverter', () => {
    test('regner riktig', () => {
        const desimaler = timerOgMinutterTilTimerMedDesimaler({ timer: '10', minutter: '3' });
        expect(desimaler).toEqual('10.05');
    });
});
