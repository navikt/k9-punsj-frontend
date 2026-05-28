import React from 'react';

import { Form, Formik } from 'formik';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import DatovelgerFormik from '../../../app/components/skjema/Datovelger/DatovelgerFormik';

const mockDatovelgerControlled = ({ dataTestId = 'mock-date-input', onBlur, onChange, value }: any) => (
    <div>
        <div data-testid={`${dataTestId}-input`}>{value}</div>
        <button type="button" data-testid={`${dataTestId}-change`} onClick={() => onChange('2020-03-01')}>
            Change
        </button>
        <button type="button" data-testid={`${dataTestId}-blur`} onClick={() => onBlur?.('2020-03-01')}>
            Blur
        </button>
    </div>
);

jest.mock('../../../app/components/skjema/Datovelger/DatovelgerControlled', () => {
    return {
        __esModule: true,
        default: (props: any) => mockDatovelgerControlled(props),
    };
});

describe('DatovelgerFormik', () => {
    it('updates the field value through the controlled adapter', async () => {
        const user = userEvent.setup();

        render(
            <Formik initialValues={{ mottattDato: '' }} onSubmit={() => undefined}>
                {({ values }) => (
                    <Form>
                        <DatovelgerFormik name="mottattDato" label="Mottatt dato" dataTestId="formik-date" />
                        <div data-testid="value">{values.mottattDato}</div>
                    </Form>
                )}
            </Formik>,
        );

        expect(screen.getByTestId('formik-date-input')).toHaveTextContent('');
        await user.click(screen.getByTestId('formik-date-change'));

        expect(screen.getByTestId('value').textContent).toBe('2020-03-01');
        expect(screen.getByTestId('formik-date-input')).toHaveTextContent('2020-03-01');
    });

    it('supports the legacy handleBlur callback with updated form values', async () => {
        const user = userEvent.setup();
        const handleBlur = jest.fn((callback: () => void) => callback());

        render(
            <Formik initialValues={{ mottattDato: '' }} onSubmit={() => undefined}>
                {({ touched }) => (
                    <Form>
                        <DatovelgerFormik
                            name="mottattDato"
                            label="Mottatt dato"
                            handleBlur={handleBlur}
                            dataTestId="formik-date"
                        />
                        <div data-testid="touched">{String(!!touched.mottattDato)}</div>
                    </Form>
                )}
            </Formik>,
        );

        await user.click(screen.getByTestId('formik-date-change'));
        await user.click(screen.getByTestId('formik-date-blur'));

        expect(handleBlur).toHaveBeenCalledWith(
            expect.any(Function),
            expect.objectContaining({ mottattDato: '2020-03-01' }),
        );
        expect(screen.getByTestId('touched').textContent).toBe('true');
    });
});
