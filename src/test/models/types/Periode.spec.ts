import { IntlShape, createIntl } from 'react-intl';

import { IPeriode, Periode } from 'app/models/types';
import intlHelper from 'app/utils/intlUtils';

vi.mock('app/utils/envUtils');
vi.mock('app/utils/intlUtils');

describe('Periode', () => {
    const fom = '2020-01-01';
    const tom = '2020-01-31';

    const setupPeriode = (periodePartial?: Partial<IPeriode>) => {
        const periode: IPeriode = {
            fom: null,
            tom: null,
            ...periodePartial,
        };

        vi.mocked(intlHelper).mockImplementation((intl: IntlShape, id: string) => {
            if (id === 'tidsformat.DATE_SHORT') {
                return 'DD.MM.YYYY';
            }
            return '';
        });

        return new Periode(periode);
    };

    describe('Periode.generateStringsForDescription', () => {
        const intl = createIntl({ locale: 'nb', defaultLocale: 'nb' });

        it('Returnerer tomme strenger når ingen datoer er satt', () => {
            expect(setupPeriode().generateStringsForDescription(intl)).toEqual({
                ft: '',
                fom: '',
                tom: '',
            });
        });

        it('Returnerer "f" og datostreng for fomdato når kun denne er satt', () => {
            expect(setupPeriode({ fom }).generateStringsForDescription(intl)).toEqual({
                ft: 'f',
                fom: '01.01.2020',
                tom: '',
            });
        });

        it('Returnerer "t" og datostreng for tomdato når kun denne er satt', () => {
            expect(setupPeriode({ tom }).generateStringsForDescription(intl)).toEqual({
                ft: 't',
                fom: '',
                tom: '31.01.2020',
            });
        });

        it('Returnerer "ft" og datostrenger når begge datoer er satt', () => {
            expect(setupPeriode({ fom, tom }).generateStringsForDescription(intl)).toEqual({
                ft: 'ft',
                fom: '01.01.2020',
                tom: '31.01.2020',
            });
        });
    });
});
