import React from 'react';
import { render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';

import { PunsjFormProvider } from '../../../app/components/form/FormProvider';

interface TestForm {
    navn: string;
}

describe('PunsjFormProvider', () => {
    it('sender inn verdier fra et internt skjema', async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn();
        render(
            <PunsjFormProvider<TestForm> formProps={{ defaultValues: { navn: 'Ola' } }} onSubmit={onSubmit}>
                {(methods) => (
                    <>
                        <input aria-label="Navn" {...methods.register('navn')} />
                        <button type="submit">Send</button>
                    </>
                )}
            </PunsjFormProvider>,
        );

        await user.clear(screen.getByLabelText('Navn'));
        await user.type(screen.getByLabelText('Navn'), 'Kari');
        await user.click(screen.getByRole('button', { name: 'Send' }));

        expect(onSubmit).toHaveBeenCalledWith({ navn: 'Kari' }, expect.anything());
    });

    it('kan bytte mellom internt og eksternt skjema uten å endre rekkefølgen på hooks', () => {
        const { result } = renderHook(() => useForm<TestForm>({ defaultValues: { navn: 'Ekstern' } }));
        const children = (methods: ReturnType<typeof useForm<TestForm>>) => <span>{methods.getValues('navn')}</span>;
        const { rerender } = render(
            <PunsjFormProvider<TestForm> formProps={{ defaultValues: { navn: 'Intern' } }}>
                {children}
            </PunsjFormProvider>,
        );
        expect(screen.getByText('Intern')).toBeInTheDocument();

        rerender(<PunsjFormProvider form={result.current}>{children}</PunsjFormProvider>);
        expect(screen.getByText('Ekstern')).toBeInTheDocument();

        rerender(
            <PunsjFormProvider<TestForm> formProps={{ defaultValues: { navn: 'Intern igjen' } }}>
                {children}
            </PunsjFormProvider>,
        );
        expect(screen.getByText('Intern igjen')).toBeInTheDocument();
    });
});
