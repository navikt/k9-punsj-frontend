import { expect } from '@jest/globals';
import { shallow } from 'enzyme';
import { mocked } from 'jest-mock';
import * as React from 'react';
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

    return shallow(<PeriodInput {...periodInputProps} />);
};

describe('PerodInput', () => {
    it('Skal vise inputfelter', () => {
        const periodInput = setupPeriodInput();
        expect(periodInput.find('DateInput')).toHaveLength(2);
        expect(periodInput.find(`#${inputIdFom}`)).toHaveLength(1);
        expect(periodInput.find(`#${inputIdTom}`)).toHaveLength(1);
    });

    it('Skal vise riktig verdi i inputfelter', () => {
        const fom = '2020-01-01';
        const tom = '2020-02-01';
        const periodInput = setupPeriodInput({ periode: { fom, tom } });
        expect(periodInput.find(`#${inputIdFom}`).prop('value')).toEqual(fom);
        expect(periodInput.find(`#${inputIdTom}`).prop('value')).toEqual(tom);
    });

    it('Skal vise feilmelding for fom-dato', () => {
        const errorMessageFom = 'Lorem ipsum solor sit amet';
        const periodInput = setupPeriodInput({ errorMessageFom });
        expect(periodInput.find(`#${inputIdFom}`).prop('errorMessage')).toEqual(errorMessageFom);
    });

    it('Skal vise feilmelding for tom-dato', () => {
        const errorMessageTom = 'Lorem ipsum solor sit amet';
        const periodInput = setupPeriodInput({ errorMessageTom });
        expect(periodInput.find(`#${inputIdTom}`).prop('errorMessage')).toEqual(errorMessageTom);
    });

    it('Skal kalle onChange med ny fom-dato', () => {
        const fom = '2020-01-01';
        const tom = '2020-02-01';
        const newFraOgMed = '2020-01-03';
        const onChange = jest.fn();
        const periodInput = setupPeriodInput({ periode: { fom, tom }, onChange });
        const inputField = periodInput
            .findWhere((n) => n.name() === 'DateInput' && n.prop('id') === inputIdFom)
            .at(0)
            .shallow()
            .find('Datepicker');
        inputField.simulate('change', newFraOgMed);
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith({ fom: newFraOgMed, tom });
    });

    it('Skal kalle onBlur med ny fom-dato', () => {
        const fom = '2020-01-01';
        const tom = '2020-02-01';
        const newFraOgMed = '2020-01-03';
        const onBlur = jest.fn();
        const periodInput = setupPeriodInput({ periode: { fom, tom }, onBlur });
        const inputField = periodInput
            .findWhere((n) => n.name() === 'DateInput' && n.prop('id') === inputIdFom)
            .at(0)
            .shallow()
            .find('Datepicker')
            .dive()
            .find(`#${inputIdFom}`)
            .dive();
        inputField.simulate('blur', { target: { value: newFraOgMed } });
        expect(onBlur).toHaveBeenCalledTimes(1);
        expect(onBlur).toHaveBeenCalledWith({ fom: newFraOgMed, tom });
    });

    it('Skal kalle onChange med ny tom-dato', () => {
        const fom = '2020-01-01';
        const tom = '2020-02-01';
        const newTilOgMed = '2020-02-03';
        const onChange = jest.fn();
        const periodInput = setupPeriodInput({ periode: { fom, tom }, onChange });
        const inputField = periodInput
            .findWhere((n) => n.name() === 'DateInput' && n.prop('id') === inputIdTom)
            .at(0)
            .shallow()
            .find('Datepicker');
        inputField.simulate('change', newTilOgMed);
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith({ fom, tom: newTilOgMed });
    });

    it('Skal kalle onBlur med ny tom-dato', () => {
        const fom = '2020-01-01';
        const tom = '2020-02-01';
        const newTilOgMed = '2020-02-03';
        const onBlur = jest.fn();
        const periodInput = setupPeriodInput({ periode: { fom, tom }, onBlur });
        const inputField = periodInput
            .findWhere((n) => n.name() === 'DateInput' && n.prop('id') === inputIdTom)
            .at(0)
            .shallow()
            .find('Datepicker')
            .dive()
            .find(`#${inputIdTom}`)
            .dive();
        inputField.simulate('blur', { target: { value: newTilOgMed } });
        expect(onBlur).toHaveBeenCalledTimes(1);
        expect(onBlur).toHaveBeenCalledWith({ fom, tom: newTilOgMed });
    });

    it('Skal ha egendefinert klassenavn', () => {
        const className = 'test';
        const periodInput = setupPeriodInput({ className });
        expect(periodInput.prop('className')).toContain(className);
    });
});
