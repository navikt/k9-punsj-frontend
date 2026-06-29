import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import DatovelgerControlled from '../../../app/components/skjema/Datovelger/DatovelgerControlled';

describe('DatovelgerControlled', () => {
    it('updates external value when a complete date is typed', async () => {
        const user = userEvent.setup();
        const onChange = jest.fn();

        render(
            <DatovelgerControlled
                label="Mottatt dato"
                value=""
                onChange={onChange}
                dataTestId="controlled-date-input"
            />,
        );

        await user.type(screen.getByTestId('controlled-date-input'), '01.03.2020');

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith('2020-03-01');
    });

    it('commits the typed value on blur', async () => {
        const user = userEvent.setup();
        const onBlur = jest.fn();

        render(
            <DatovelgerControlled
                label="Mottatt dato"
                value=""
                onChange={() => undefined}
                onBlur={onBlur}
                dataTestId="controlled-date-input"
            />,
        );

        await user.type(screen.getByTestId('controlled-date-input'), '01.03.2020');
        await user.tab();

        expect(onBlur).toHaveBeenCalledWith('2020-03-01');
    });

    it('shows invalid format only after blur for a partial date', async () => {
        const user = userEvent.setup();

        render(
            <DatovelgerControlled
                label="Mottatt dato"
                value=""
                onChange={() => undefined}
                dataTestId="controlled-date-input"
            />,
        );

        const input = screen.getByTestId('controlled-date-input');

        await user.type(input, '1');
        expect(screen.queryByText('Dato har ikke gyldig format')).not.toBeInTheDocument();

        await user.tab();
        expect(screen.getByText('Dato har ikke gyldig format')).toBeInTheDocument();
    });

    it('hides external error messages until blur when configured', async () => {
        const user = userEvent.setup();

        render(
            <DatovelgerControlled
                label="Mottatt dato"
                value=""
                onChange={() => undefined}
                errorMessage="Påkrevd"
                showExternalErrorAfterSubmit={false}
                dataTestId="controlled-date-input"
            />,
        );

        expect(screen.queryByText('Påkrevd')).not.toBeInTheDocument();

        await user.click(screen.getByTestId('controlled-date-input'));
        await user.tab();

        expect(screen.getByText('Påkrevd')).toBeInTheDocument();
    });

    it('shows external error messages immediately after submit-style rerender', () => {
        const { rerender } = render(
            <DatovelgerControlled
                label="Mottatt dato"
                value=""
                onChange={() => undefined}
                errorMessage="Påkrevd"
                showExternalErrorAfterSubmit={false}
                dataTestId="controlled-date-input"
            />,
        );

        expect(screen.queryByText('Påkrevd')).not.toBeInTheDocument();

        rerender(
            <DatovelgerControlled
                label="Mottatt dato"
                value=""
                onChange={() => undefined}
                errorMessage="Påkrevd"
                showExternalErrorAfterSubmit={true}
                dataTestId="controlled-date-input"
            />,
        );

        expect(screen.getByText('Påkrevd')).toBeInTheDocument();
    });

    it('commits the typed value on blur after the parent syncs the controlled value', async () => {
        const user = userEvent.setup();
        const onBlur = jest.fn();

        const TestHarness = () => {
            const [value, setValue] = React.useState('');

            return (
                <DatovelgerControlled
                    label="Mottatt dato"
                    value={value}
                    onChange={setValue}
                    onBlur={onBlur}
                    dataTestId="controlled-date-input"
                />
            );
        };

        render(<TestHarness />);

        await user.type(screen.getByTestId('controlled-date-input'), '01.03.2020');
        await user.tab();

        expect(onBlur).toHaveBeenCalledTimes(1);
        expect(onBlur).toHaveBeenCalledWith('2020-03-01');
    });

    it('updates the displayed value when the external value changes after mount', () => {
        const { rerender } = render(
            <DatovelgerControlled
                label="Mottatt dato"
                value="2020-01-01"
                onChange={() => undefined}
                dataTestId="controlled-date-input"
            />,
        );

        expect(screen.getByTestId('controlled-date-input')).toHaveValue('01.01.2020');

        rerender(
            <DatovelgerControlled
                label="Mottatt dato"
                value="2020-02-01"
                onChange={() => undefined}
                dataTestId="controlled-date-input"
            />,
        );

        expect(screen.getByTestId('controlled-date-input')).toHaveValue('01.02.2020');
    });

    it('keeps the typed value visible when editing an existing date to an out of range date', async () => {
        const user = userEvent.setup();
        const onBlur = jest.fn();

        const TestHarness = () => {
            const [value, setValue] = React.useState('2020-03-15');

            return (
                <DatovelgerControlled
                    label="Mottatt dato"
                    value={value}
                    onChange={setValue}
                    onBlur={onBlur}
                    fromDate={new Date('2020-03-10T00:00:00.000Z')}
                    dataTestId="controlled-date-input"
                />
            );
        };

        render(<TestHarness />);

        const input = screen.getByTestId('controlled-date-input');

        await user.clear(input);
        await user.type(input, '01.03.2020');
        await user.tab();

        expect(input).toHaveValue('01.03.2020');
        expect(screen.getByText('Datoen er ikke tillatt')).toBeInTheDocument();
        expect(onBlur).not.toHaveBeenCalled();
    });
});
