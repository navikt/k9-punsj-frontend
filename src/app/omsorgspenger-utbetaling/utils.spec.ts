import backendSoknad from '../../../cypress/fixtures/omp_ut/backendSoknad';
import frontendSoknad from '../../../cypress/fixtures/omp_ut/frontendSoknad';
import { backendTilFrontendMapping, frontendTilBackendMapping } from './utils';

describe('Mapping av omsorgspengeutbetaling', () => {
    test('mapper fra backend til frontend ', () => {
        const frontendMapping = backendTilFrontendMapping(backendSoknad);
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

        expect(new Set(fraværsperioderFrontend)).toEqual(new Set(backendSoknad.fravaersperioder));
        expect(frontendMapping).toEqual(frontendSoknad);
    });
    test('mapper fra frontend til backend ', () => {
        const backendMapping = frontendTilBackendMapping(frontendSoknad);
        console.log(backendMapping);
        console.log(backendSoknad);

        expect(backendMapping).toEqual(backendSoknad);
    });
});
