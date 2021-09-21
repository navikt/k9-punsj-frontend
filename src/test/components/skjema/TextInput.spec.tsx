import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TextInput from '../../../app/components/skjema/TextInput';
import { TestSkjema } from './testskjema';

describe('TextInput', () => {
    test('oppdaterer felt ved inntasting', () => {
        const { getByLabelText } = render(
            <TestSkjema
                initialValues={{
                    fødselsnummer: '',
                }}
            >
                <TextInput feltnavn="fødselsnummer" />
            </TestSkjema>
        );

        const inputfelt = getByLabelText(/fødselsnummer/i);

        expect(inputfelt.getAttribute('value')).toEqual('');

        const fnrValue = '12312312312';
        userEvent.type(inputfelt, fnrValue);
        expect(inputfelt.getAttribute('value')).toEqual(fnrValue);
    });
});
