import React from 'react';
import { ShallowWrapper, shallow } from 'enzyme';
import { WrappedComponentProps, createIntl } from 'react-intl';
import { PeriodInput } from '../../../app/components/period-input/PeriodInput';

jest.mock('app/utils/intlUtils');

const getDateInputField = (component: ShallowWrapper, fieldId: string) =>
    component
        .findWhere((n) => n.name() === 'DateInput' && n.prop('id') === fieldId)
        .at(0)
        .shallow()
        .find('Datepicker')
        .dive()
        .find(`#${fieldId}`)
        .dive();

const wrappedComponentProps: WrappedComponentProps = {
    intl: createIntl({ locale: 'nb', defaultLocale: 'nb' }),
};

describe('PeriodInput', () => {
    it('Oppdaterer felt når fra-dato på søknadsperioden endres', () => {
        const newDato = '2020-01-01';
        const id = 'soknadsperiode-fra';
        const periodInput = shallow(
            <PeriodInput
                periode={{}}
                onChange={jest.fn()}
                onBlur={jest.fn()}
                {...wrappedComponentProps}
                inputIdFom={id}
            />,
        );

        const inputField = getDateInputField(periodInput, id);
        inputField.simulate('change', { target: { value: newDato } });
        expect(inputField.prop('value')).toEqual(newDato);
    });

    it('Oppdaterer felt når til-dato på søknadsperioden endres', () => {
        const newDato = '2020-01-01';
        const id = 'soknadsperiode-til';
        const periodInput = shallow(
            <PeriodInput
                periode={{}}
                onChange={jest.fn()}
                onBlur={jest.fn()}
                {...wrappedComponentProps}
                inputIdTom={id}
            />,
        );

        const inputField = getDateInputField(periodInput, id);
        inputField.simulate('change', { target: { value: newDato } });
        expect(inputField.prop('value')).toEqual(newDato);
    });
});
