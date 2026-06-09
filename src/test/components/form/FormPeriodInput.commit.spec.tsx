import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UseFormReturn } from 'react-hook-form';

import { IPeriode } from '../../../app/models/types/Periode';
import { getTypedFormComponents } from '../../../app/components/form/getTypedFormComponents';

const mockSetSelected = jest.fn();

jest.mock('@navikt/ds-react', () => {
    const reactModule = jest.requireActual<typeof import('react')>('react');

    const DatePicker = Object.assign(
        ({ children, onSelect }: { children: React.ReactNode; onSelect?: (range?: unknown) => void }) => (
            <div>
                <button
                    type="button"
                    onClick={() =>
                        onSelect?.({
                            from: new Date('2020-03-01T00:00:00.000Z'),
                            to: new Date('2020-03-05T00:00:00.000Z'),
                        })
                    }
                >
                    Commit range
                </button>
                {children}
            </div>
        ),
        {
            Input: reactModule.forwardRef(
                (
                    {
                        onChange,
                        onBlur,
                        ...props
                    }: {
                        onChange?: React.ChangeEventHandler<HTMLInputElement>;
                        onBlur?: React.FocusEventHandler<HTMLInputElement>;
                        'data-testid'?: string;
                    },
                    ref: React.Ref<HTMLInputElement>,
                ) => <input ref={ref} onChange={onChange} onBlur={onBlur} {...props} />,
            ),
        },
    );

    return {
        DatePicker,
        ErrorMessage: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
        useRangeDatepicker: (opt?: { onRangeChange?: (range?: unknown) => void; onValidate?: (value: unknown) => void }) => ({
            datepickerProps: {
                onSelect: (range?: unknown) => {
                    opt?.onRangeChange?.(range);
                    opt?.onValidate?.({
                        from: { isEmpty: false, isValidDate: true },
                        to: { isEmpty: false, isValidDate: true, isBeforeFrom: false },
                    });
                },
            },
            fromInputProps: {},
            toInputProps: {},
            selectedRange: undefined,
            setSelected: mockSetSelected,
            reset: jest.fn(),
        }),
    };
});

interface TestForm {
    periode: IPeriode;
}

const { TypedFormProvider, TypedFormPeriodInput } = getTypedFormComponents<TestForm>();

describe('FormPeriodInput commit behavior', () => {
    it('marks the field as touched when a range is committed from the calendar', async () => {
        const user = userEvent.setup();

        render(
            <TypedFormProvider formProps={{ defaultValues: { periode: { fom: '', tom: '' } }, mode: 'onBlur' }}>
                {(methods: UseFormReturn<TestForm>) => (
                    <>
                        <TypedFormPeriodInput name="periode" />
                        <div data-testid="touched">{methods.formState.touchedFields.periode ? 'touched' : 'untouched'}</div>
                        <div data-testid="watched-value">{JSON.stringify(methods.watch('periode'))}</div>
                    </>
                )}
            </TypedFormProvider>,
        );

        await user.click(screen.getByRole('button', { name: 'Commit range' }));

        expect(screen.getByTestId('touched').textContent).toBe('touched');
        expect(screen.getByTestId('watched-value').textContent).toBe('{"fom":"2020-03-01","tom":"2020-03-05"}');
    });
});
