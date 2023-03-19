import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import TextInput from '../../../app/components/skjema/TextInput';
import { TestSkjema } from './testskjema';

describe('TextInput', () => {
    test('oppdaterer felt ved inntasting', async () => {
        const { getByLabelText } = render(
            <TestSkjema
                initialValues={{
                    fødselsnummer: '',
                }}
            >
                <TextInput feltnavn="fødselsnummer" />
            </TestSkjema>,
        );

        const inputfelt = getByLabelText(/fødselsnummer/i);

        expect(inputfelt.getAttribute('value')).toEqual('');

        const fnrValue = '12312312312';
        await userEvent.type(inputfelt, fnrValue);
        expect(inputfelt.getAttribute('value')).toEqual(fnrValue);
    });
});
