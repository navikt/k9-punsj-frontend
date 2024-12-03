import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mocked } from 'jest-mock';
import { createIntl, IntlShape } from 'react-intl';
import { pfTilleggsinformasjon } from '../../../app/søknader/pleiepenger/components/pfTilleggsinformasjon';
import { ITilleggsinformasjon } from '../../../app/models/types/PSBSoknad';
import { Periodeinfo } from '../../../app/models/types/Periodeinfo';
import {
    UpdatePeriodeinfoInSoknad,
    UpdatePeriodeinfoInSoknadState,
} from '../../../app/components/periodeinfoPaneler/PeriodeinfoPaneler';
import { GetErrorMessage } from '../../../app/models/types/Error';
import intlHelper from '../../../app/utils/intlUtils';

jest.mock('app/utils/intlUtils');

const testTekst = 'Lorem ipsum dolor sit amet';
const testPeriodeinfo: Periodeinfo<ITilleggsinformasjon> = {
    periode: { fom: '2020-01-01', tom: '2020-12-31' },
    tilleggsinformasjon: testTekst,
};
const testPeriodeindex = 0;
const testUpdatePeriodeinfoInSoknad = jest.fn();
const testUpdatePeriodeinfoInSoknadState = jest.fn();
const testFeilprefiks = 'feilprefiks';
const testGetErrorMessage = jest.fn();
const testIntl = createIntl({ locale: 'nb', defaultLocale: 'nb' });
const testKodeord = 'kodeord';

const renderPfTilleggsinformasjon = (
    optionalPeriodeinfo?: Periodeinfo<ITilleggsinformasjon>,
    optionalPeriodeindex?: number,
    optionalUpdatePeriodeinfoInSoknad?: UpdatePeriodeinfoInSoknad<ITilleggsinformasjon>,
    optionalUpdatePeriodeinfoInSoknadState?: UpdatePeriodeinfoInSoknadState<ITilleggsinformasjon>,
    optionalFeilprefiks?: string,
    optionalGetErrorMessage?: GetErrorMessage,
    optionalIntl?: IntlShape,
    optionalKodeord?: string,
) => {
    mocked(intlHelper).mockImplementation((intl: IntlShape, id: string) => id);

    const Component = pfTilleggsinformasjon(optionalKodeord || testKodeord)(
        optionalPeriodeinfo || testPeriodeinfo,
        optionalPeriodeindex || testPeriodeindex,
        optionalUpdatePeriodeinfoInSoknad || testUpdatePeriodeinfoInSoknad,
        optionalUpdatePeriodeinfoInSoknadState || testUpdatePeriodeinfoInSoknadState,
        optionalFeilprefiks || testFeilprefiks,
        optionalGetErrorMessage || testGetErrorMessage,
        optionalIntl || testIntl,
    );

    return render(<>{Component}</>);
};

describe('pfTilleggsinformasjon', () => {
    beforeEach(() => jest.resetAllMocks());

    it('renders the component', () => {
        renderPfTilleggsinformasjon();
        expect(screen.getByLabelText(`skjema.${testKodeord}.tilleggsinfo`)).toBeInTheDocument();
    });

    it('displays correct label', () => {
        renderPfTilleggsinformasjon();
        expect(screen.getByLabelText(`skjema.${testKodeord}.tilleggsinfo`)).toBeTruthy();
    });

    it('shows correct text in textarea', () => {
        renderPfTilleggsinformasjon();
        expect(screen.getByLabelText(`skjema.${testKodeord}.tilleggsinfo`)).toHaveValue(testTekst);
    });

    it('calls updatePeriodeinfoInSoknadState on change', async () => {
        // Mock state update
        testUpdatePeriodeinfoInSoknadState.mockImplementation((data) => {
            testPeriodeinfo.tilleggsinformasjon = data.tilleggsinformasjon;
        });

        const { getByLabelText } = renderPfTilleggsinformasjon();
        const textarea = getByLabelText(`skjema.${testKodeord}.tilleggsinfo`);

        const newValue = 'Integer ut ligula sed est.';
        fireEvent.change(textarea, { target: { value: newValue } });

        expect(testUpdatePeriodeinfoInSoknadState).toHaveBeenCalledTimes(1);
        expect(testUpdatePeriodeinfoInSoknadState).toHaveBeenLastCalledWith({ tilleggsinformasjon: newValue }, false);
    });

    it('calls updatePeriodeinfoInSoknad on blur', async () => {
        renderPfTilleggsinformasjon();
        const textarea = screen.getByLabelText(`skjema.${testKodeord}.tilleggsinfo`);
        const newValue = 'Integer ut ligula sed est.';
        await userEvent.type(textarea, newValue);
        await userEvent.tab();
        expect(testUpdatePeriodeinfoInSoknad).toHaveBeenCalledTimes(1);
        expect(testUpdatePeriodeinfoInSoknad).toHaveBeenCalledWith({ tilleggsinformasjon: newValue });
    });

    it('shows error message', () => {
        renderPfTilleggsinformasjon();
        expect(testGetErrorMessage).toHaveBeenCalledTimes(1);
        expect(testGetErrorMessage).toHaveBeenCalledWith(
            `${testFeilprefiks}.perioder['2020-01-01/2020-12-31'].tilleggsinformasjon`,
        );
    });
});
