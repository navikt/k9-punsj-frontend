import React from 'react';
import { shallow } from 'enzyme';
import { PeriodInput, IPeriodInputProps } from '../../../app/components/period-input/PeriodInput';
import { IntlShape, createIntl } from 'react-intl';
import { mocked } from 'jest-mock';
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

    return shallow(<PeriodInput {...periodInputProps} />);
};

describe('PeriodInput', () => {
    it('should render both date inputs', () => {
        const wrapper = setupPeriodInput();
        expect(wrapper.find('NewDateInput').length).toBe(2);
    });

    it('should call onChange when a date is changed', () => {
        const handleChange = jest.fn();
        const wrapper = setupPeriodInput({ onChange: handleChange });

        wrapper.find('NewDateInput').at(0).simulate('change', '2023-01-01');
        wrapper.find('NewDateInput').at(1).simulate('change', '2023-12-31');

        expect(handleChange).toHaveBeenCalledTimes(2);
        expect(handleChange).toHaveBeenCalledWith({ fom: '2023-01-01', tom: '' });
        expect(handleChange).toHaveBeenCalledWith({ fom: '', tom: '2023-12-31' });
    });

    it('should call onBlur when a date input loses focus', () => {
        const handleBlur = jest.fn();
        const wrapper = setupPeriodInput({ onBlur: handleBlur });

        wrapper.find('NewDateInput').at(0).simulate('blur', '2023-01-01');
        wrapper.find('NewDateInput').at(1).simulate('blur', '2023-12-31');

        expect(handleBlur).toHaveBeenCalledTimes(2);
        expect(handleBlur).toHaveBeenCalledWith({ fom: '2023-01-01', tom: '' });
        expect(handleBlur).toHaveBeenCalledWith({ fom: '', tom: '2023-12-31' });
    });

    it('should disable the date inputs when disabled prop is true', () => {
        const wrapper = setupPeriodInput({ disabled: true });

        expect(wrapper.find('NewDateInput').at(0).prop('inputDisabled')).toBe(true);
        expect(wrapper.find('NewDateInput').at(1).prop('inputDisabled')).toBe(true);
    });

    it('should display error messages when provided', () => {
        const wrapper = setupPeriodInput({
            errorMessageFom: 'Invalid start date',
            errorMessageTom: 'Invalid end date',
        });

        expect(wrapper.find('NewDateInput').at(0).prop('errorMessage')).toBe('Invalid start date');
        expect(wrapper.find('NewDateInput').at(1).prop('errorMessage')).toBe('Invalid end date');
    });
});
