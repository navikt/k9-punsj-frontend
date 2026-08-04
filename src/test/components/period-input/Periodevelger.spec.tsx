import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mocked } from 'jest-mock';
import React from 'react';
import { IntlShape, createIntl } from 'react-intl';
import Periodevelger, { PeriodevelgerProps } from '../../../app/components/period-input/Periodevelger';
import intlHelper from '../../../app/utils/intlUtils';

jest.mock('react-intl');
jest.mock('app/utils/intlUtils');

const inputIdFom = 'fom';
const inputIdTom = 'tom';

const setupPeriodevelger = (propsPartial?: Partial<PeriodevelgerProps>) => {
    const props: PeriodevelgerProps = {
        periode: {},
        intl: createIntl({ locale: 'nb', defaultLocale: 'nb' }),
        onChange: propsPartial?.onChange || jest.fn(),
        onBlur: propsPartial?.onBlur || jest.fn(),
        inputIdFom,
        inputIdTom,
        ...propsPartial,
    };

    mocked(intlHelper).mockImplementation((intl: IntlShape, id: string) => id);

    return render(<Periodevelger {...props} />);
};

const testDateChange = async (
    inputId: string,
    newDate: string,
    newDateFormatted: string,
    onChange: jest.Mock,
    onBlur: jest.Mock,
) => {
    const input = screen.getByTestId(inputId) as HTMLInputElement;
    expect(input).toBeInTheDocument();

    await userEvent.clear(input);
    await userEvent.type(input, newDate);
    await userEvent.tab();
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ [inputId]: newDateFormatted }));
    expect(onBlur).toHaveBeenCalledWith(expect.objectContaining({ [inputId]: newDateFormatted }));
};

describe('Periodevelger', () => {
    it('should display input fields', async () => {
        setupPeriodevelger();

        expect(await screen.findByTestId(inputIdFom)).toBeInTheDocument();
        expect(await screen.findByTestId(inputIdTom)).toBeInTheDocument();
    });

    it('should display the correct value in input fields', async () => {
        const fom = '2020-01-01';
        const tom = '2020-02-01';
        setupPeriodevelger({ periode: { fom, tom } });

        expect(await screen.findByTestId(inputIdFom)).toHaveValue('01.01.2020');
        expect(await screen.findByTestId(inputIdTom)).toHaveValue('01.02.2020');
    });

    it('should display an error message for fom date', async () => {
        const errorMessageFom = 'Error message for fom date';

        setupPeriodevelger({ errorMessageFom });

        expect(await screen.findByText(`skjema.perioder.fom: ${errorMessageFom}`)).toBeInTheDocument();
    });

    it('should display an error message for tom date', async () => {
        const errorMessageTom = 'Error message fom fom date';

        setupPeriodevelger({ errorMessageTom });

        expect(await screen.findByText(`skjema.perioder.tom: ${errorMessageTom}`)).toBeInTheDocument();
    });

    it('should call onChange and onBlur with a new fom date', async () => {
        const fom = '2020-01-01';
        const tom = '2020-02-01';
        const newFraOgMed = '01.03.2020';
        const newFraOgMedFormatted = '2020-03-01';
        const onChange = jest.fn();
        const onBlur = jest.fn();

        setupPeriodevelger({ periode: { fom, tom }, onChange, onBlur });

        await testDateChange(inputIdFom, newFraOgMed, newFraOgMedFormatted, onChange, onBlur);
    });

    it('should call onChange with the correct final value when a complete date is typed', async () => {
        const onChange = jest.fn();

        setupPeriodevelger({ periode: {}, onChange });

        await userEvent.type(screen.getByTestId(inputIdFom), '01.03.2020');

        expect(onChange).toHaveBeenLastCalledWith({ fom: '2020-03-01', tom: '' });
    });

    it('should call onChange and onBlur with a new tom date', async () => {
        const fom = '2020-01-01';
        const tom = '2020-02-01';
        const newTilOgMed = '01.03.2020';
        const newTilOgMedFormatted = '2020-03-01';
        const onChange = jest.fn();
        const onBlur = jest.fn();

        setupPeriodevelger({ periode: { fom, tom }, onChange, onBlur });

        await testDateChange(inputIdTom, newTilOgMed, newTilOgMedFormatted, onChange, onBlur);
    });

    it('should update displayed values when periode props change after mount', async () => {
        const { rerender } = setupPeriodevelger({ periode: { fom: '2020-01-01', tom: '2020-02-01' } });

        expect(await screen.findByTestId(inputIdFom)).toHaveValue('01.01.2020');
        expect(await screen.findByTestId(inputIdTom)).toHaveValue('01.02.2020');

        rerender(
            <Periodevelger
                periode={{ fom: '2020-03-01', tom: '2020-04-01' }}
                intl={createIntl({ locale: 'nb', defaultLocale: 'nb' })}
                onChange={jest.fn()}
                onBlur={jest.fn()}
                inputIdFom={inputIdFom}
                inputIdTom={inputIdTom}
            />,
        );

        expect(await screen.findByTestId(inputIdFom)).toHaveValue('01.03.2020');
        expect(await screen.findByTestId(inputIdTom)).toHaveValue('01.04.2020');
    });

    it('should clear displayed values when periode props are reset after mount', async () => {
        const { rerender } = setupPeriodevelger({ periode: { fom: '2020-01-01', tom: '2020-02-01' } });

        expect(await screen.findByTestId(inputIdFom)).toHaveValue('01.01.2020');
        expect(await screen.findByTestId(inputIdTom)).toHaveValue('01.02.2020');

        rerender(
            <Periodevelger
                periode={{ fom: '', tom: '' }}
                intl={createIntl({ locale: 'nb', defaultLocale: 'nb' })}
                onChange={jest.fn()}
                onBlur={jest.fn()}
                inputIdFom={inputIdFom}
                inputIdTom={inputIdTom}
            />,
        );

        expect(await screen.findByTestId(inputIdFom)).toHaveValue('');
        expect(await screen.findByTestId(inputIdTom)).toHaveValue('');
    });
});
