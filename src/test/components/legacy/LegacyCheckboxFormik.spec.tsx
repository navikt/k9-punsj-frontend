import React from 'react';

import { Form, Formik } from 'formik';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import LegacyCheckboxFormik from '../../../app/components/formikInput/LegacyCheckboxFormik';

describe('LegacyCheckboxFormik', () => {
    it('updates boolean value with valueIsBoolean', async () => {
        const user = userEvent.setup();

        render(
            <Formik initialValues={{ arbeidstaker: false }} onSubmit={() => undefined}>
                {({ values }) => (
                    <Form>
                        <LegacyCheckboxFormik name="arbeidstaker" label="Arbeidstaker" valueIsBoolean />
                        <div data-testid="value">{String(values.arbeidstaker)}</div>
                    </Form>
                )}
            </Formik>,
        );

        expect(screen.getByTestId('value').textContent).toBe('false');

        await user.click(screen.getByLabelText('Arbeidstaker'));
        expect(screen.getByTestId('value').textContent).toBe('true');

        await user.click(screen.getByLabelText('Arbeidstaker'));
        expect(screen.getByTestId('value').textContent).toBe('false');
    });
});
