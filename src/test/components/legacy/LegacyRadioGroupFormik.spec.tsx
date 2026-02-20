import React from 'react';

import { Form, Formik } from 'formik';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import LegacyRadioGroupFormik from 'app/components/formikInput/LegacyRadioGroupFormik';

describe('LegacyRadioGroupFormik', () => {
    it('updates string field value using Formik field.onChange', async () => {
        const user = userEvent.setup();

        render(
            <Formik initialValues={{ status: 'nei' }} onSubmit={() => undefined}>
                {({ values }) => (
                    <Form>
                        <LegacyRadioGroupFormik
                            name="status"
                            legend="Status"
                            options={[
                                { label: 'Ja', value: 'ja' },
                                { label: 'Nei', value: 'nei' },
                            ]}
                        />
                        <div data-testid="value">{values.status}</div>
                    </Form>
                )}
            </Formik>,
        );

        expect(screen.getByTestId('value').textContent).toBe('nei');

        await user.click(screen.getByLabelText('Ja'));
        expect(screen.getByTestId('value').textContent).toBe('ja');

        await user.click(screen.getByLabelText('Nei'));
        expect(screen.getByTestId('value').textContent).toBe('nei');
    });

    it('supports custom onChange(event, value) mapping for boolean field', async () => {
        const user = userEvent.setup();

        render(
            <Formik initialValues={{ active: false }} onSubmit={() => undefined}>
                {({ values, setFieldValue }) => (
                    <Form>
                        <LegacyRadioGroupFormik
                            name="active"
                            legend="Active"
                            checked={values.active ? 'ja' : 'nei'}
                            options={[
                                { label: 'Ja', value: 'ja' },
                                { label: 'Nei', value: 'nei' },
                            ]}
                            onChange={(_, value) => setFieldValue('active', value === 'ja')}
                        />
                        <div data-testid="value">{String(values.active)}</div>
                    </Form>
                )}
            </Formik>,
        );

        expect(screen.getByTestId('value').textContent).toBe('false');

        await user.click(screen.getByLabelText('Ja'));
        expect(screen.getByTestId('value').textContent).toBe('true');

        await user.click(screen.getByLabelText('Nei'));
        expect(screen.getByTestId('value').textContent).toBe('false');
    });
});
