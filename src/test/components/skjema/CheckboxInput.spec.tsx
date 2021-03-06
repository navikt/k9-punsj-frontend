import React from 'react';
import { render, screen } from '@testing-library/react';
import { TestSkjema } from './testskjema';
import CheckboxInput from '../../../app/components/skjema/CheckboxInput';
import userEvent from '@testing-library/user-event';

describe('<CheckboxInput>', () => {
  test('rendrer checkbox', () => {
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
      </TestSkjema>
    );

    const checkbox = screen.getByLabelText(/blond/i);
    expect(checkbox).not.toBeChecked();

    userEvent.click(checkbox);

    expect(checkbox).toBeChecked();
  });
});
