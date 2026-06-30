import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import Datovelger from '../../../app/components/skjema/Datovelger/Datovelger';

describe('Datovelger', () => {
    it('renders with label', () => {
        render(<Datovelger label="Dato" value="" onChange={jest.fn()} onBlur={jest.fn()} />);
        expect(screen.getByLabelText('Dato')).toBeInTheDocument();
    });

    it('displays initial value formatted as dd.MM.yyyy', async () => {
        render(<Datovelger label="Dato" value="2020-03-01" onChange={jest.fn()} onBlur={jest.fn()} />);
        expect(await screen.findByDisplayValue('01.03.2020')).toBeInTheDocument();
    });

    it('calls onChange with ISO date when valid date is typed', async () => {
        const onChange = jest.fn();
        render(<Datovelger label="Dato" value="" onChange={onChange} onBlur={jest.fn()} />);
        const input = screen.getByLabelText('Dato');
        await userEvent.type(input, '01.03.2020');
        expect(onChange).toHaveBeenLastCalledWith('2020-03-01');
    });

    it('shows format error when invalid text is typed', async () => {
        render(<Datovelger label="Dato" value="" onChange={jest.fn()} onBlur={jest.fn()} />);
        const input = screen.getByLabelText('Dato');
        await userEvent.type(input, 'abc');
        await userEvent.tab();
        expect(await screen.findByText('Dato har ikke gyldig format')).toBeInTheDocument();
    });

    it('calls onBlur with the committed ISO value on input blur', async () => {
        const onBlur = jest.fn();
        render(<Datovelger label="Dato" value="" onChange={jest.fn()} onBlur={onBlur} />);
        const input = screen.getByLabelText('Dato');
        await userEvent.type(input, '01.03.2020');
        await userEvent.tab();
        expect(onBlur).toHaveBeenLastCalledWith('2020-03-01');
    });

    it('does not commit a stale value when invalid text is blurred', async () => {
        const onBlur = jest.fn();
        render(<Datovelger label="Dato" value="2020-03-01" onChange={jest.fn()} onBlur={onBlur} />);
        const input = screen.getByLabelText('Dato');

        await userEvent.clear(input);
        await userEvent.type(input, '32.13.2024');
        await userEvent.tab();

        expect(onBlur).not.toHaveBeenCalled();
        expect(await screen.findByText('Dato har ikke gyldig format')).toBeInTheDocument();
    });

    it('syncs displayed value when value prop changes externally', async () => {
        const { rerender } = render(
            <Datovelger label="Dato" value="2020-01-01" onChange={jest.fn()} onBlur={jest.fn()} />,
        );
        expect(await screen.findByDisplayValue('01.01.2020')).toBeInTheDocument();

        rerender(<Datovelger label="Dato" value="2020-06-15" onChange={jest.fn()} onBlur={jest.fn()} />);
        expect(await screen.findByDisplayValue('15.06.2020')).toBeInTheDocument();
    });

    it('clears displayed value when value prop is reset to empty', async () => {
        const { rerender } = render(
            <Datovelger label="Dato" value="2020-01-01" onChange={jest.fn()} onBlur={jest.fn()} />,
        );
        expect(await screen.findByDisplayValue('01.01.2020')).toBeInTheDocument();

        rerender(<Datovelger label="Dato" value="" onChange={jest.fn()} onBlur={jest.fn()} />);
        expect(await screen.findByDisplayValue('')).toBeInTheDocument();
    });
});
