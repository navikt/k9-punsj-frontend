import React from 'react';
import { render, screen } from '@testing-library/react';
import { mocked } from 'jest-mock';
import { IntlShape, createIntl } from 'react-intl';
import { IPeriodInputProps, PeriodInput } from '../../../app/components/period-input/PeriodInput';
import intlHelper from '../../../app/utils/intlUtils';
import userEvent from '@testing-library/user-event';

jest.mock('react-intl');
jest.mock('app/utils/intlUtils');

const inputIdFom = 'fom';
const inputIdTom = 'tom';

const setupPeriodInput = (periodInputPropsPartial?: Partial<IPeriodInputProps>) => {
    const periodInputProps: IPeriodInputProps = {
        periode: {},
        intl: createIntl({ locale: 'nb', defaultLocale: 'nb' }),
        onChange: periodInputPropsPartial?.onChange || jest.fn(),
        onBlur: periodInputPropsPartial?.onBlur || jest.fn(),
        inputIdFom,
        inputIdTom,
        ...periodInputPropsPartial,
    };

    mocked(intlHelper).mockImplementation((intl: IntlShape, id: string) => id);

    return render(<PeriodInput {...periodInputProps} />);
};

const testDateChange = async (
    inputId: string,
    newDate: string,
    newDateFormatted: string,
    onChange: jest.Mock,
    onBlur: jest.Mock,
) => {
    const input = screen.getByRole('textbox', { name: inputId === 'fom' ? 'skjema.perioder.fom' : 'skjema.perioder.tom' }) as HTMLInputElement;
    expect(input).toBeInTheDocument();

    await userEvent.clear(input);
    await userEvent.type(input, newDate);
    await userEvent.tab();
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ [inputId]: newDateFormatted }));
    expect(onBlur).toHaveBeenCalledWith(expect.objectContaining({ [inputId]: newDateFormatted }));
};

describe('PeriodInput', () => {
    it('should display input fields', async () => {
        setupPeriodInput();

        expect(await screen.findByRole('textbox', { name: 'skjema.perioder.fom' })).toBeInTheDocument();
        expect(await screen.findByRole('textbox', { name: 'skjema.perioder.tom' })).toBeInTheDocument();
    });

    it('should display the correct value in input fields', async () => {
        const fom = '2020-01-01';
        const tom = '2020-02-01';
        setupPeriodInput({ periode: { fom, tom } });

        expect(await screen.findByRole('textbox', { name: 'skjema.perioder.fom' })).toHaveValue('01.01.2020');
        expect(await screen.findByRole('textbox', { name: 'skjema.perioder.tom' })).toHaveValue('01.02.2020');
    });

    it('should display an error message for fom date', async () => {
        const errorMessageFom = 'Error message for fom date';

        setupPeriodInput({ errorMessageFom });

        expect(await screen.findByText(errorMessageFom)).toBeInTheDocument();
    });

    it('should display an error message for tom date', async () => {
        const errorMessageTom = 'Error message fom fom date';

        setupPeriodInput({ errorMessageTom });

        expect(await screen.findByText(errorMessageTom)).toBeInTheDocument();
    });

    it('should call onChange and onBlur with a new fom date', async () => {
        const fom = '2020-01-01';
        const tom = '2020-02-01';
        const newFraOgMed = '01.03.2020';
        const newFraOgMedFormatted = '2020-03-01';
        const onChange = jest.fn();
        const onBlur = jest.fn();

        setupPeriodInput({ periode: { fom, tom }, onChange, onBlur });

        await testDateChange(inputIdFom, newFraOgMed, newFraOgMedFormatted, onChange, onBlur);
    });

    it('should call onChange and onBlur with a new tom date', async () => {
        const fom = '2020-01-01';
        const tom = '2020-02-01';
        const newTilOgMed = '01.03.2020';
        const newTilOgMedFormatted = '2020-03-01';
        const onChange = jest.fn();
        const onBlur = jest.fn();

        setupPeriodInput({ periode: { fom, tom }, onChange, onBlur });

        await testDateChange(inputIdTom, newTilOgMed, newTilOgMedFormatted, onChange, onBlur);
    });
});
