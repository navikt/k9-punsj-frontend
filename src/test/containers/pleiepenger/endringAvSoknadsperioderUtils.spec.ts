import { IPeriode } from '../../../app/models/types/Periode';
import { buildEndringAvSoknadsperioderUpdate } from '../../../app/søknader/pleiepenger/containers/EndringAvSøknadsperioder/EndringAvSøknadsperioder';

describe('buildEndringAvSoknadsperioderUpdate', () => {
    it('beholder kun trekkKravPerioder når listen ikke er tom', () => {
        const perioder: IPeriode[] = [{ fom: '2026-02-02', tom: '2026-02-20' }];

        expect(buildEndringAvSoknadsperioderUpdate(perioder)).toEqual({
            trekkKravPerioder: perioder,
        });
    });

    it('nullstiller begrunnelseForInnsending når alle trekkKravPerioder er fjernet', () => {
        expect(buildEndringAvSoknadsperioderUpdate([])).toEqual({
            trekkKravPerioder: [],
            begrunnelseForInnsending: undefined,
        });
    });
});
