import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UseFormReturn } from 'react-hook-form';

import { getTypedFormComponents } from '../../../app/components/form/getTypedFormComponents';

interface TestForm {
    mottattDato: string;
}

const { TypedFormProvider, TypedFormDateInput } = getTypedFormComponents<TestForm>();

describe('FormDateInput', () => {
    it('updates react hook form value via typed form components', async () => {
        const user = userEvent.setup();

        render(
            <TypedFormProvider formProps={{ defaultValues: { mottattDato: '' } }}>
                {(methods: UseFormReturn<TestForm>) => (
                    <>
                        <TypedFormDateInput name="mottattDato" label="Mottatt dato" data-testid="rhf-date-input" />
                        <div data-testid="value">{methods.watch('mottattDato')}</div>
                    </>
                )}
            </TypedFormProvider>,
        );

        await user.type(screen.getByTestId('rhf-date-input'), '01.03.2020');

        expect(screen.getByTestId('value').textContent).toBe('2020-03-01');
    });

    it('shows validation error from react hook form', async () => {
        const user = userEvent.setup();

        render(
            <TypedFormProvider
                formProps={{ defaultValues: { mottattDato: '' }, mode: 'onSubmit' }}
                onSubmit={() => undefined}
            >
                <TypedFormDateInput
                    name="mottattDato"
                    label="Mottatt dato"
                    validate={{ required: 'Velg mottatt dato' }}
                    data-testid="rhf-date-input"
                />
                <button type="submit">Send</button>
            </TypedFormProvider>,
        );

        await user.click(screen.getByRole('button', { name: 'Send' }));

        expect(screen.getByText('Velg mottatt dato')).toBeInTheDocument();
    });
});
