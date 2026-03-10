import React from 'react';

import { Form, Formik } from 'formik';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import LegacyCheckboxGroupFormik from '../../../app/components/formikInput/LegacyCheckboxGroupFormik';

describe('LegacyCheckboxGroupFormik', () => {
    it('updates array field value in Formik', async () => {
        const user = userEvent.setup();

        render(
            <Formik initialValues={{ typer: ['arbeidstaker'] }} onSubmit={() => undefined}>
                {({ values }) => (
                    <Form>
                        <LegacyCheckboxGroupFormik
                            name="typer"
                            legend="Velg arbeidssituasjon"
                            checkboxes={[
                                { label: 'Arbeidstaker', value: 'arbeidstaker' },
                                { label: 'Frilanser', value: 'frilanser' },
                            ]}
                        />
                        <div data-testid="value">{JSON.stringify(values.typer)}</div>
                    </Form>
                )}
            </Formik>,
        );

        expect(screen.getByTestId('value').textContent).toBe('["arbeidstaker"]');

        await user.click(screen.getByLabelText('Frilanser'));
        expect(screen.getByTestId('value').textContent).toBe('["arbeidstaker","frilanser"]');

        await user.click(screen.getByLabelText('Arbeidstaker'));
        expect(screen.getByTestId('value').textContent).toBe('["frilanser"]');
    });

    it('supports custom onChange callback', async () => {
        const user = userEvent.setup();
        const onChange = jest.fn();

        render(
            <Formik initialValues={{ typer: [] as string[] }} onSubmit={() => undefined}>
                <Form>
                    <LegacyCheckboxGroupFormik
                        name="typer"
                        legend="Velg arbeidssituasjon"
                        checkboxes={[
                            { label: 'Arbeidstaker', value: 'arbeidstaker' },
                            { label: 'Frilanser', value: 'frilanser' },
                        ]}
                        onChange={onChange}
                    />
                </Form>
            </Formik>,
        );

        await user.click(screen.getByLabelText('Frilanser'));

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenLastCalledWith(expect.any(Object), 'frilanser', ['frilanser']);
    });
});
