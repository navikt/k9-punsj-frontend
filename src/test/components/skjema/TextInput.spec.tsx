import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import TextInput from '../../../app/components/skjema/TextInput';
import { TestSkjema } from './testskjema';

describe('TextInput', () => {
  test('oppdaterer felt ved inntasting', () => {
    const { getByLabelText } = render(
      <TestSkjema
        initialValues={{
          fødselsnummer: '',
          alder: 23,
        }}
      >
        <TextInput feltnavn="fødselsnummer" />
      </TestSkjema>
    );

    const inputfelt = getByLabelText(/fødselsnummer/i);

    expect(inputfelt.getAttribute('value')).toEqual('');

    const fnrValue = '12312312312';
    fireEvent.change(inputfelt, { target: { value: fnrValue } });
    expect(inputfelt.getAttribute('value')).toEqual(fnrValue);
  });
});
