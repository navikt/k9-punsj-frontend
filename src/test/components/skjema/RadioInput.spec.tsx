import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { By, TestSkjema } from './testskjema';
import RadioInput from '../../../app/components/skjema/RadioInput';

describe('<RadioInput>', () => {
    test('rendrer radios for options', () => {
        render(
            <TestSkjema initialValues={{ favorittby: null }}>
                <RadioInput feltnavn="favorittby" optionValues={Object.values(By)} />
            </TestSkjema>
        );

        const osloRadio = screen.getByLabelText(/oslo/i);
        const barcaRadio = screen.getByLabelText(/barcelona/i);
        const newRadio = screen.getByLabelText(/new/i);

        expect(osloRadio).not.toBeChecked();
        expect(barcaRadio).not.toBeChecked();
        expect(newRadio).not.toBeChecked();

        userEvent.click(barcaRadio);

        expect(barcaRadio).toBeChecked();
    });
});
