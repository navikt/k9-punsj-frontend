import React from 'react';

import { Form, Formik } from 'formik';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import LegacyJaNeiRadioGroupFormik from 'app/components/formikInput/LegacyJaNeiRadioGroupFormik';
import { JaNei } from 'app/models/enums';
import { renderWithIntl } from '../../testUtils';

describe('LegacyJaNeiRadioGroupFormik', () => {
    it('updates JaNei field value', async () => {
        const user = userEvent.setup();

        renderWithIntl(
            <Formik initialValues={{ status: JaNei.NEI }} onSubmit={() => undefined}>
                {({ values }) => (
                    <Form>
                        <LegacyJaNeiRadioGroupFormik name="status" legend="Status" />
                        <div data-testid="value">{values.status}</div>
                    </Form>
                )}
            </Formik>,
        );

        expect(screen.getByTestId('value').textContent).toBe(JaNei.NEI);

        await user.click(screen.getByLabelText('Ja'));
        expect(screen.getByTestId('value').textContent).toBe(JaNei.JA);
    });

    it('supports custom boolean mapping through onChange', async () => {
        const user = userEvent.setup();

        renderWithIntl(
            <Formik initialValues={{ active: false }} onSubmit={() => undefined}>
                {({ values, setFieldValue }) => (
                    <Form>
                        <LegacyJaNeiRadioGroupFormik
                            name="active"
                            legend="Active"
                            checked={values.active ? JaNei.JA : JaNei.NEI}
                            onChange={(_, value) => setFieldValue('active', value === JaNei.JA)}
                        />
                        <div data-testid="value">{String(values.active)}</div>
                    </Form>
                )}
            </Formik>,
        );

        expect(screen.getByTestId('value').textContent).toBe('false');

        await user.click(screen.getByLabelText('Ja'));
        expect(screen.getByTestId('value').textContent).toBe('true');
    });
});
