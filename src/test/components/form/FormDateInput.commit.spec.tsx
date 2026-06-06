import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UseFormReturn } from 'react-hook-form';

import { getTypedFormComponents } from '../../../app/components/form/getTypedFormComponents';

jest.mock('../../../app/components/skjema/Datovelger/DatovelgerControlled', () => ({
    __esModule: true,
    default: ({
        onBlur,
        onInputBlur,
        value,
    }: {
        onBlur?: (value: string) => void;
        onInputBlur?: () => void;
        value?: string;
    }) => (
        <div>
            <button type="button" onClick={() => onBlur?.('2020-03-01')}>
                Commit date
            </button>
            <button type="button" onClick={() => onInputBlur?.()}>
                Blur input
            </button>
            <div data-testid="value">{value || ''}</div>
        </div>
    ),
}));

interface TestForm {
    mottattDato: string;
}

const { TypedFormProvider, TypedFormDateInput } = getTypedFormComponents<TestForm>();

describe('FormDateInput commit behavior', () => {
    it('marks the field as touched when a date is committed from the calendar', async () => {
        const user = userEvent.setup();

        render(
            <TypedFormProvider formProps={{ defaultValues: { mottattDato: '' }, mode: 'onBlur' }}>
                {(methods: UseFormReturn<TestForm>) => (
                    <>
                        <TypedFormDateInput name="mottattDato" label="Mottatt dato" />
                        <div data-testid="touched">
                            {methods.formState.touchedFields.mottattDato ? 'touched' : 'untouched'}
                        </div>
                        <div data-testid="watched-value">{methods.watch('mottattDato')}</div>
                    </>
                )}
            </TypedFormProvider>,
        );

        await user.click(screen.getByRole('button', { name: 'Commit date' }));

        expect(screen.getByTestId('touched').textContent).toBe('touched');
        expect(screen.getByTestId('watched-value').textContent).toBe('2020-03-01');
    });
});
