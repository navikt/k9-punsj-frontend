import { IPeriode } from '../../../app/models/types/Periode';
import { buildEndringAvSoknadsperioderUpdate } from '../../../app/søknader/pleiepenger/containers/EndringAvSøknadsperioder/EndringAvSøknadsperioder';

describe('buildEndringAvSoknadsperioderUpdate', () => {
    it('oppdaterer kun trekkKravPerioder når periodene overlapper eksisterende perioder', () => {
        const perioder: IPeriode[] = [{ fom: '2026-02-02', tom: '2026-02-20' }];
        const eksisterendePerioder: IPeriode[] = [{ fom: '2026-02-01', tom: '2026-02-28' }];

        expect(buildEndringAvSoknadsperioderUpdate(perioder, eksisterendePerioder)).toEqual({
            trekkKravPerioder: perioder,
        });
    });

    it('nullstiller begrunnelseForInnsending når alle trekkKravPerioder er fjernet', () => {
        expect(buildEndringAvSoknadsperioderUpdate([])).toEqual({
            trekkKravPerioder: [],
            begrunnelseForInnsending: undefined,
        });
    });

    it('nullstiller begrunnelseForInnsending når periodene ikke lenger overlapper eksisterende perioder', () => {
        const perioder: IPeriode[] = [{ fom: '2026-03-01', tom: '2026-03-10' }];
        const eksisterendePerioder: IPeriode[] = [{ fom: '2026-02-01', tom: '2026-02-28' }];

        expect(buildEndringAvSoknadsperioderUpdate(perioder, eksisterendePerioder)).toEqual({
            trekkKravPerioder: perioder,
            begrunnelseForInnsending: undefined,
        });
    });
});
