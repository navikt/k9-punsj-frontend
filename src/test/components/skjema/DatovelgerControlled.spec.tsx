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
});
