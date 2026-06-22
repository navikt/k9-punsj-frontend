import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UseFormReturn } from 'react-hook-form';

import { IPeriode } from '../../../app/models/types/Periode';
import { getTypedFormComponents } from '../../../app/components/form/getTypedFormComponents';

interface TestForm {
    periode: IPeriode;
}

const { TypedFormProvider, TypedFormPeriodInput } = getTypedFormComponents<TestForm>();

describe('FormPeriodInput', () => {
    it('updates react hook form value when both dates are typed', async () => {
        const user = userEvent.setup();

        render(
            <TypedFormProvider formProps={{ defaultValues: { periode: { fom: '', tom: '' } } }}>
                {(methods: UseFormReturn<TestForm>) => (
                    <>
                        <TypedFormPeriodInput
                            name="periode"
                            fomDataTestId="rhf-period-fom"
                            tomDataTestId="rhf-period-tom"
                        />
                        <div data-testid="value">{JSON.stringify(methods.watch('periode'))}</div>
                    </>
                )}
            </TypedFormProvider>,
        );

        await user.type(screen.getByTestId('rhf-period-fom'), '01.03.2020');
        await user.type(screen.getByTestId('rhf-period-tom'), '05.03.2020');

        expect(screen.getByTestId('value').textContent).toBe('{"fom":"2020-03-01","tom":"2020-03-05"}');
    });

    it('shows a group validation error on blur', async () => {
        const user = userEvent.setup();

        render(
            <TypedFormProvider formProps={{ defaultValues: { periode: { fom: '', tom: '' } }, mode: 'onBlur' }}>
                <TypedFormPeriodInput
                    name="periode"
                    validate={{
                        validate: (value) => {
                            const period = value as IPeriode | undefined;
                            return period?.fom && period?.tom ? undefined : 'Velg periode';
                        },
                    }}
                    fomDataTestId="rhf-period-fom"
                    tomDataTestId="rhf-period-tom"
                />
                <button type="button">Next</button>
            </TypedFormProvider>,
        );

        await user.click(screen.getByTestId('rhf-period-fom'));
        await user.tab();

        expect(screen.getByText('Velg periode')).toBeInTheDocument();
    });

    it('supports react hook form setFocus by forwarding the first input ref', async () => {
        const user = userEvent.setup();

        render(
            <TypedFormProvider formProps={{ defaultValues: { periode: { fom: '', tom: '' } } }}>
                {(methods: UseFormReturn<TestForm>) => (
                    <>
                        <TypedFormPeriodInput
                            name="periode"
                            fomDataTestId="rhf-period-fom"
                            tomDataTestId="rhf-period-tom"
                        />
                        <button type="button" onClick={() => methods.setFocus('periode')}>
                            Focus period
                        </button>
                    </>
                )}
            </TypedFormProvider>,
        );

        await user.click(screen.getByRole('button', { name: 'Focus period' }));

        expect(screen.getByTestId('rhf-period-fom')).toHaveFocus();
    });

    it('updates the displayed values when the external period changes after mount', async () => {
        const user = userEvent.setup();

        render(
            <TypedFormProvider formProps={{ defaultValues: { periode: { fom: '2020-01-01', tom: '2020-01-05' } } }}>
                {(methods: UseFormReturn<TestForm>) => (
                    <>
                        <TypedFormPeriodInput
                            name="periode"
                            fomDataTestId="rhf-period-fom"
                            tomDataTestId="rhf-period-tom"
                        />
                        <div data-testid="updated-period-value">{JSON.stringify(methods.watch('periode'))}</div>
                        <button
                            type="button"
                            onClick={() =>
                                methods.setValue('periode', {
                                    fom: '2020-02-01',
                                    tom: '2020-02-06',
                                })
                            }
                        >
                            Update period
                        </button>
                    </>
                )}
            </TypedFormProvider>,
        );

        expect(screen.getByTestId('rhf-period-fom')).toHaveValue('01.01.2020');
        expect(screen.getByTestId('rhf-period-tom')).toHaveValue('05.01.2020');

        await user.click(screen.getByRole('button', { name: 'Update period' }));

        expect(screen.getByTestId('updated-period-value').textContent).toBe('{"fom":"2020-02-01","tom":"2020-02-06"}');
        expect(screen.getByTestId('rhf-period-fom')).toHaveValue('01.02.2020');
        expect(screen.getByTestId('rhf-period-tom')).toHaveValue('06.02.2020');
    });
});
