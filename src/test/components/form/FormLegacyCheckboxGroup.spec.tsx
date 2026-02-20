import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type UseFormReturn } from 'react-hook-form';

import { getTypedFormComponents } from '../../../app/components/form/getTypedFormComponents';

interface TestForm {
    typer: string[];
}

const { TypedFormProvider, TypedFormLegacyCheckboxGroup } = getTypedFormComponents<TestForm>();

describe('FormLegacyCheckboxGroup', () => {
    it('updates react hook form array value via typed form components', async () => {
        const user = userEvent.setup();

        render(
            <TypedFormProvider formProps={{ defaultValues: { typer: ['arbeidstaker'] } }}>
                {(methods: UseFormReturn<TestForm>) => (
                    <>
                        <TypedFormLegacyCheckboxGroup
                            name="typer"
                            legend="Velg arbeidssituasjon"
                            options={[
                                { label: 'Arbeidstaker', value: 'arbeidstaker' },
                                { label: 'Frilanser', value: 'frilanser' },
                            ]}
                        />
                        <div data-testid="value">{JSON.stringify(methods.watch('typer'))}</div>
                    </>
                )}
            </TypedFormProvider>,
        );

        expect(screen.getByTestId('value').textContent).toBe('["arbeidstaker"]');

        await user.click(screen.getByLabelText('Frilanser'));
        expect(screen.getByTestId('value').textContent).toBe('["arbeidstaker","frilanser"]');

        await user.click(screen.getByLabelText('Arbeidstaker'));
        expect(screen.getByTestId('value').textContent).toBe('["frilanser"]');
    });

    it('shows validation error from react hook form', async () => {
        const user = userEvent.setup();

        render(
            <TypedFormProvider
                formProps={{ defaultValues: { typer: [] }, mode: 'onSubmit' }}
                onSubmit={() => undefined}
            >
                <TypedFormLegacyCheckboxGroup
                    name="typer"
                    legend="Velg arbeidssituasjon"
                    validate={{
                        validate: (value) =>
                            (Array.isArray(value) && value.length > 0) || 'Velg minst ett alternativ',
                    }}
                    options={[
                        { label: 'Arbeidstaker', value: 'arbeidstaker' },
                        { label: 'Frilanser', value: 'frilanser' },
                    ]}
                />
                <button type="submit">Send</button>
            </TypedFormProvider>,
        );

        await user.click(screen.getByRole('button', { name: 'Send' }));

        expect(screen.getByText('Velg minst ett alternativ')).toBeInTheDocument();
    });
});
