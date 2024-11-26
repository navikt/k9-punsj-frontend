import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { mocked } from 'jest-mock';
import { IntlShape, createIntl } from 'react-intl';
import { IPeriodInputProps, PeriodInput } from '../../../app/components/period-input/PeriodInput';
import intlHelper from '../../../app/utils/intlUtils';

jest.mock('react-intl');
jest.mock('app/utils/intlUtils');

const inputIdFom = 'fom';
const inputIdTom = 'tom';

const setupPeriodInput = (periodInputPropsPartial?: Partial<IPeriodInputProps>) => {
    const periodInputProps: IPeriodInputProps = {
        periode: {},
        intl: createIntl({ locale: 'nb', defaultLocale: 'nb' }),
        onChange: jest.fn(),
        onBlur: jest.fn(),
        inputIdFom,
        inputIdTom,
        ...periodInputPropsPartial,
    };

    mocked(intlHelper).mockImplementation((intl: IntlShape, id: string) => id);

    return render(<PeriodInput {...periodInputProps} />);
};

describe('PeriodInput', () => {
    it('should display input fields', async () => {
        setupPeriodInput();

        const fomInput = await screen.findByTestId('fom');
        const tomInput = await screen.findByTestId('tom');

        expect(fomInput).toBeInTheDocument();
        expect(tomInput).toBeInTheDocument();
    });

    it('should display the correct value in input fields', async () => {
        const fom = '2020-01-01';
        const tom = '2020-02-01';
        setupPeriodInput({ periode: { fom, tom } });
        // console.log(screen.debug());

        const fomInput = await screen.findByTestId(inputIdFom);
        const tomInput = await screen.findByTestId(inputIdTom);

        // Check the values
        expect(fomInput).toHaveValue('01.01.2020');
        expect(tomInput).toHaveValue('01.02.2020');
    });

    it('should display an error message for fom date', async () => {
        const errorMessageFom = 'Error message for fom date';

        setupPeriodInput({ errorMessageFom });

        const errorMessage = await screen.findByText(errorMessageFom);

        expect(errorMessage).toBeInTheDocument();
    });

    it('should display an error message for tom date', async () => {
        const errorMessageTom = 'Error message fom fom date';

        setupPeriodInput({ errorMessageTom });

        const errorMessage = await screen.findByText(errorMessageTom);

        expect(errorMessage).toBeInTheDocument();
    });

    it('should call onChange with a new fom date', async () => {
        const fom = '2020-01-01';
        const tom = '2020-02-01';
        const newFraOgMed = '2020-01-03';
        const onChange = jest.fn(); // Mock the onChange function

        setupPeriodInput({ periode: { fom, tom }, onChange });

        const fomInput = screen.getByTestId('fom'); // Assuming 'fom' is your input's data-testid

        // Change the value of the input field
        fireEvent.change(fomInput, { target: { value: newFraOgMed } });

        // Now, call onBlur or whatever event triggers the onChange in your component
        fireEvent.blur(fomInput);

        // Expect the onChange callback to have been called with the correct object
        // expect(onChange).toHaveBeenCalledTimes(1);

        // Check if onChange was called with the correct object (assuming your periode object looks like this)
        expect(onChange).toHaveBeenCalledWith({
            fom: newFraOgMed, // Adjust based on what you expect fom to be
            tom: '', // Adjust this as needed for your test
        });
    });
});
