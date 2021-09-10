import { INumberSelectProps, NumberSelect } from 'app/components/number-select/NumberSelect';
import { shallow } from 'enzyme';
import * as React from 'react';

const setupNumberSelect = (numberSelectPropsPartial?: Partial<INumberSelectProps>) => {
    const numberSelectProps: INumberSelectProps = {
        label: '',
        to: 0,
        ...numberSelectPropsPartial,
    };

    // eslint-disable-next-line react/jsx-props-no-spreading
    return shallow(<NumberSelect {...numberSelectProps} />);
};

describe('NumberSelect', () => {
    it('Skal vise nedtrekksmeny med tall fra 0 til definert maksverdi', () => {
        const to = 12;
        const numberSelect = setupNumberSelect({ to });
        expect(numberSelect.find('option')).toHaveLength(to + 1);
        expect(numberSelect.find('option:first-child').prop('value')).toEqual(0);
        expect(numberSelect.find('option:last-child').prop('value')).toEqual(to);
        numberSelect.find('option').forEach((option) => {
            expect(option.prop('value')).toBeGreaterThanOrEqual(0);
            expect(option.prop('value')).toBeLessThanOrEqual(to);
        });
    });

    it('Skal vise nedtrekksmeny med tall fra definert minverdi til definert maksverdi', () => {
        const from = 12;
        const to = 24;
        const numberSelect = setupNumberSelect({ from, to });
        expect(numberSelect.find('option')).toHaveLength(to - from + 1);
        expect(numberSelect.find('option:first-child').prop('value')).toEqual(from);
        expect(numberSelect.find('option:last-child').prop('value')).toEqual(to);
        numberSelect.find('option').forEach((option) => {
            expect(option.prop('value')).toBeGreaterThanOrEqual(from);
            expect(option.prop('value')).toBeLessThanOrEqual(to);
        });
    });
});
