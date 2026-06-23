import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UseFormReturn } from 'react-hook-form';

import { getTypedFormComponents } from '../../../app/components/form/getTypedFormComponents';

jest.mock('@navikt/ds-react', () => {
    const reactModule = jest.requireActual<typeof import('react')>('react');

    const DatePicker = Object.assign(
        ({ children, onSelect }: { children: React.ReactNode; onSelect?: (date?: Date) => void }) => (
            <div>
                <button type="button" onClick={() => onSelect?.(new Date('2020-03-01T00:00:00.000Z'))}>
                    Commit date
                </button>
                {children}
            </div>
        ),
        {
            Input: reactModule.forwardRef(
                (
                    props: {
                        onChange?: React.ChangeEventHandler<HTMLInputElement>;
                        onBlur?: React.FocusEventHandler<HTMLInputElement>;
                        hideLabel?: boolean;
                        label?: React.ReactNode;
                        description?: React.ReactNode;
                        error?: React.ReactNode;
                        size?: 'small' | 'medium';
                        setAnchorRef?: React.Dispatch<React.SetStateAction<HTMLButtonElement | null>>;
                        'data-testid'?: string;
                    },
                    ref: React.Ref<HTMLInputElement>,
                ) => {
                    const { onChange, onBlur } = props;
                    const inputProps = { ...props };

                    delete inputProps.hideLabel;
                    delete inputProps.label;
                    delete inputProps.description;
                    delete inputProps.error;
                    delete inputProps.size;
                    delete inputProps.setAnchorRef;

                    return <input ref={ref} onChange={onChange} onBlur={onBlur} {...inputProps} />;
                },
            ),
        },
    );

    return {
        DatePicker,
        useDatepicker: () => ({
            datepickerProps: {},
            inputProps: {},
            setSelected: jest.fn(),
        }),
    };
});

interface TestForm {
    mottattDato: string;
}

const { TypedFormProvider, TypedFormDateInput } = getTypedFormComponents<TestForm>();

describe('FormDateInput commit behavior', () => {
    it('marks the field as touched when a date is committed from the calendar', async () => {
        const user = userEvent.setup();

        render(
            <TypedFormProvider formProps={{ defaultValues: { mottattDato: '' }, mode: 'onBlur' }}>
                {(methods: UseFormReturn<TestForm>) => (
                    <>
                        <TypedFormDateInput name="mottattDato" label="Mottatt dato" />
                        <div data-testid="touched">
                            {methods.formState.touchedFields.mottattDato ? 'touched' : 'untouched'}
                        </div>
                        <div data-testid="watched-value">{methods.watch('mottattDato')}</div>
                    </>
                )}
            </TypedFormProvider>,
        );

        await user.click(screen.getByRole('button', { name: 'Commit date' }));

        expect(screen.getByTestId('touched').textContent).toBe('touched');
        expect(screen.getByTestId('watched-value').textContent).toBe('2020-03-01');
    });
});
