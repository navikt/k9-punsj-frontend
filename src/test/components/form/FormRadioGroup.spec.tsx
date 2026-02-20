import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type UseFormReturn } from 'react-hook-form';

import { getTypedFormComponents } from '../../../app/components/form/getTypedFormComponents';

interface TestForm {
    status: string;
}

const { TypedFormProvider, TypedFormRadioGroup } = getTypedFormComponents<TestForm>();

describe('FormRadioGroup', () => {
    it('updates react hook form value via typed form components', async () => {
        const user = userEvent.setup();

        render(
            <TypedFormProvider formProps={{ defaultValues: { status: 'nei' } }}>
                {(methods: UseFormReturn<TestForm>) => (
                    <>
                        <TypedFormRadioGroup
                            name="status"
                            legend="Status"
                            options={[
                                { label: 'Ja', value: 'ja' },
                                { label: 'Nei', value: 'nei' },
                            ]}
                        />
                        <div data-testid="value">{methods.watch('status')}</div>
                    </>
                )}
            </TypedFormProvider>,
        );

        expect(screen.getByTestId('value').textContent).toBe('nei');

        await user.click(screen.getByLabelText('Ja'));
        expect(screen.getByTestId('value').textContent).toBe('ja');

        await user.click(screen.getByLabelText('Nei'));
        expect(screen.getByTestId('value').textContent).toBe('nei');
    });

    it('shows validation error from react hook form', async () => {
        const user = userEvent.setup();

        render(
            <TypedFormProvider
                formProps={{ defaultValues: { status: '' }, mode: 'onSubmit' }}
                onSubmit={() => undefined}
            >
                <TypedFormRadioGroup
                    name="status"
                    legend="Status"
                    validate={{ required: 'Velg status' }}
                    options={[
                        { label: 'Ja', value: 'ja' },
                        { label: 'Nei', value: 'nei' },
                    ]}
                />
                <button type="submit">Send</button>
            </TypedFormProvider>,
        );

        await user.click(screen.getByRole('button', { name: 'Send' }));

        expect(screen.getByText('Velg status')).toBeInTheDocument();
    });
});
