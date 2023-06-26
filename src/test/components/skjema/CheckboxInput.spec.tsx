import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import CheckboxInput from '../../../app/components/skjema/CheckboxInput';
import { TestSkjema } from './testskjema';

describe('<CheckboxInput>', () => {
    test('rendrer checkbox', async () => {
        render(
            <TestSkjema
                initialValues={{
                    erBlond: false,
                    alder: 45,
                    fødselsnummer: '',
                    favorittby: null,
                }}
            >
                <CheckboxInput feltnavn="erBlond" />
            </TestSkjema>,
        );

        const checkbox = screen.getByLabelText(/blond/i);
        expect(checkbox).not.toBeChecked();

        await userEvent.click(checkbox);

        expect(checkbox).toBeChecked();
    });
});
