import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { TestSkjema } from './testskjema';
import NumberInput from '../../../app/components/skjema/NumberInput';

describe('<NumberInput>', () => {
  const initAlder = 4;
  const { getByLabelText, getAllByRole } = render(
    <TestSkjema
      initialValues={{
        fødselsnummer: '',
        alder: initAlder,
      }}
    >
      <NumberInput feltnavn="alder" />
    </TestSkjema>
  );

  test('plussknapp øker verdi med 1', () => {
    const inputfelt = getByLabelText(/alder/i);
    expect(inputfelt.getAttribute('value')).toEqual(`${initAlder}`);

    const knapper = getAllByRole('button');

    const plussknapp = knapper.find((knapp) => knapp.innerHTML.match(/øk/i));
    expect(plussknapp).toBeDefined();

    // @ts-ignore
    fireEvent.click(plussknapp);

    expect(inputfelt.getAttribute('value')).toEqual(`${initAlder + 1}`);
  });

  test('minusknapp minsker verdi med 1', () => {
    const inputfelt = getByLabelText(/alder/i);
    expect(inputfelt.getAttribute('value')).toEqual(`${initAlder}`);

    const knapper = getAllByRole('button');

    const minusknapp = knapper.find((knapp) => knapp.innerHTML.match(/mink/i));
    expect(minusknapp).toBeDefined();

    // @ts-ignore
    fireEvent.click(minusknapp);

    expect(inputfelt.getAttribute('value')).toEqual(`${initAlder - 1}`);
  });
});
