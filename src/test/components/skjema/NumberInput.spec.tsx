import React from 'react';
import { render } from '@testing-library/react';
import { TestSkjema } from './testskjema';
import NumberInput from '../../../app/components/skjema/NumberInput';
import userEvent from '@testing-library/user-event';

describe('<NumberInput>', () => {
    const initAlder = 4;
    const renderInputFelt = () =>
        render(
            <TestSkjema
                initialValues={{
                    alder: initAlder,
                }}
            >
                <NumberInput feltnavn="alder" />
            </TestSkjema>
        );

    test('plussknapp øker verdi med 1', () => {
        const { getByLabelText, getAllByRole } = renderInputFelt();
        const inputfelt = getByLabelText(/alder/i);
        expect(inputfelt.getAttribute('value')).toEqual(`${initAlder}`);

        const knapper = getAllByRole('button');

        const plussknapp = knapper.find((knapp) => knapp.innerHTML.match(/øk/i));
        expect(plussknapp).toBeDefined();

        // @ts-ignore
        userEvent.click(plussknapp);

        expect(inputfelt.getAttribute('value')).toEqual(`${initAlder + 1}`);
    });

    test('minusknapp minsker verdi med 1', () => {
        const { getByLabelText, getAllByRole } = renderInputFelt();
        const inputfelt = getByLabelText(/alder/i);
        expect(inputfelt.getAttribute('value')).toEqual(`${initAlder}`);

        const knapper = getAllByRole('button');

        const minusknapp = knapper.find((knapp) => knapp.innerHTML.match(/mink/i));
        expect(minusknapp).toBeDefined();

        // @ts-ignore
        userEvent.click(minusknapp);

        expect(inputfelt.getAttribute('value')).toEqual(`${initAlder - 1}`);
    });
});
