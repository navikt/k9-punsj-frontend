import { TextField } from '@navikt/ds-react';
import { render, screen } from '@testing-library/react';
import { mocked } from 'jest-mock';
import * as React from 'react';
import { IntlShape } from 'react-intl';

import {
    IPeriodeinfopanelerProps,
    PeriodeinfoComponent,
    PeriodeinfoPaneler,
} from '../../../app/components/periodeinfoPaneler/PeriodeinfoPaneler';
import { IPeriodeinfoExtension, Periodeinfo } from '../../../app/models/types/Periodeinfo';
import intlHelper from '../../../app/utils/intlUtils';

jest.mock('react-intl');
jest.mock('app/utils/intlUtils');

interface ITestperiodeinfo extends IPeriodeinfoExtension {
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

const testkomponent: PeriodeinfoComponent<IPeriodeinfoExtension> = (
    info: Periodeinfo<IPeriodeinfoExtension>,
    periodeindex: number,
    updatePeriodeinfoInSoknad: (info: Partial<Periodeinfo<IPeriodeinfoExtension>>) => any,
    updatePeriodeinfoInSoknadState: (info: Partial<Periodeinfo<IPeriodeinfoExtension>>, showStatus: boolean) => any,
    feilkodeprefiksMedIndeks?: string,
) => {
    const testInfo = info as Testperiodeinfo;
    return (
        <TextField
            label=""
            id={testinputid(periodeindex)}
            className="testinput"
            value={testInfo.test}
            onChange={(event) => updatePeriodeinfoInSoknadState({ test: event.target.value }, false)}
            onBlur={(event) => updatePeriodeinfoInSoknad({ test: event.target.value })}
            error={feilkodeprefiksMedIndeks ? `Feilmelding med kode ${feilkodeprefiksMedIndeks}` : undefined}
        />
    );
};

const initialperiodetest: Testperiodeinfo = {
    periode: { fom: '2020-04-01', tom: '2020-04-30' },
    test: 'cba',
};

const setupPeriodepaneler = (periodepanelerPropsPartial?: Partial<IPeriodeinfopanelerProps>) => {
    const periodepanelerProps: IPeriodeinfopanelerProps = {
        periods: testperioder,
        initialPeriodeinfo: initialperiodetest,
        panelid: (index: number) => `testperiode_${index}`,
        component: testkomponent,
        editSoknad: jest.fn(),
        editSoknadState: jest.fn(),
        kanHaFlere: true,
        medSlettKnapp: true,
        getErrorMessage: jest.fn(),
        ...periodepanelerPropsPartial,
    };

    mocked(intlHelper).mockImplementation((intl: IntlShape, id: string) => id);

    return render(<PeriodeinfoPaneler {...periodepanelerProps} />);
};

describe('Periodepaneler', () => {
    it('Viser listepaneler', () => {
        setupPeriodepaneler();

        expect(screen.getByTestId('listepanel')).toBeInTheDocument();
    });

    it('Viser perioder som listeelementer', () => {
        setupPeriodepaneler();

        const listItems = screen.getAllByTestId('listepaneler');

        expect(listItems).toHaveLength(testperioder.length);
    });
});
