import { shallow } from 'enzyme';
import { mocked } from 'jest-mock';
import { Input } from 'nav-frontend-skjema';
import * as React from 'react';
import { IntlShape, createIntl } from 'react-intl';

import {
    IPeriodeinfopanelerProps,
    PeriodeinfoComponent,
    PeriodeinfoPaneler,
} from 'app/containers/pleiepenger/PeriodeinfoPaneler';
import intlHelper from 'app/utils/intlUtils';

import { Periodeinfo } from '../../../app/models/types/Periodeinfo';

jest.mock('react-intl');
jest.mock('app/utils/intlUtils');

interface ITestperiodeinfo {
    test: string;
}

type Testperiodeinfo = Periodeinfo<ITestperiodeinfo>;

const testperiode0: Testperiodeinfo = {
    periode: { fom: '2020-01-01', tom: '2020-01-31' },
    test: 'abc',
};
const testperiode1: Testperiodeinfo = {
    periode: { fom: '2020-02-01', tom: '2020-02-29' },
    test: 'bca',
};
const testperiode2: Testperiodeinfo = {
    periode: { fom: '2020-03-01', tom: '2020-03-31' },
    test: 'cab',
};

const testperioder: Testperiodeinfo[] = [testperiode0, testperiode1, testperiode2];

const testinputid = (periodeindex: number) => `testperiode_${periodeindex}_testinput`;

const testkomponent: PeriodeinfoComponent<ITestperiodeinfo> = (
    info: Testperiodeinfo,
    periodeindex: number,
    updatePeriodeinfoInSoknad: (info: Partial<Testperiodeinfo>) => any,
    updatePeriodeinfoInSoknadState: (info: Partial<Testperiodeinfo>, showStatus: boolean) => any,
    feilkodeprefiksMedIndeks?: string,
) => (
    <Input
        label=""
        id={testinputid(periodeindex)}
        className="testinput"
        value={info.test}
        onChange={(event) => updatePeriodeinfoInSoknadState({ test: event.target.value }, false)}
        onBlur={(event) => updatePeriodeinfoInSoknad({ test: event.target.value })}
        feil={feilkodeprefiksMedIndeks ? `Feilmelding med kode ${feilkodeprefiksMedIndeks}` : undefined}
    />
);

const initialperiodetest: Testperiodeinfo = {
    periode: { fom: '2020-04-01', tom: '2020-04-30' },
    test: 'cba',
};

const setupPeriodepaneler = (periodepanelerPropsPartial?: Partial<IPeriodeinfopanelerProps>) => {
    const periodepanelerProps: IPeriodeinfopanelerProps = {
        periods: testperioder,
        intl: createIntl({ locale: 'nb', defaultLocale: 'nb' }),
        initialPeriodeinfo: initialperiodetest,
        panelid: (index: number) => `testperiode_${index}`,
        component: testkomponent,
        editSoknad: jest.fn(),
        editSoknadState: jest.fn(),
        kanHaFlere: true,
        medSlettKnapp: true,
        ...periodepanelerPropsPartial,
    };

    mocked(intlHelper).mockImplementation((intl: IntlShape, id: string, value?: { [key: string]: string }) => id);

    // eslint-disable-next-line react/jsx-props-no-spreading
    return shallow(<PeriodeinfoPaneler {...periodepanelerProps} />);
};

describe('Periodepaneler', () => {
    it('Viser listepaneler', () => {
        const periodepaneler = setupPeriodepaneler();
        expect(periodepaneler.find('Listepaneler')).toHaveLength(1);
    });

    it('Viser perioder som listeelementer', () => {
        const periodepaneler = setupPeriodepaneler();
        expect(periodepaneler.find('Listepaneler').prop('items')).toEqual(testperioder);
    });
});
