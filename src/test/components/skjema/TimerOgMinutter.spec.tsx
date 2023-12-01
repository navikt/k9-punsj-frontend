import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import TimerOgMinutter from '../../../app/components/timefoering/TimerOgMinutter';

describe('TimerOgMinutter', () => {
    const mockOnChangeTimer = jest.fn();
    const mockOnChangeMinutter = jest.fn();
    const mockOnBlur = jest.fn();

    it('renders without crashing', () => {
        render(
            <TimerOgMinutter
                label="Test Label"
                onChangeTimer={mockOnChangeTimer}
                onChangeMinutter={mockOnChangeMinutter}
                onBlur={mockOnBlur}
                timer=""
                minutter=""
            />,
        );
    });

    it('calls onChangeTimer when timer input is changed', () => {
        const { getByLabelText } = render(
            <TimerOgMinutter
                label="Test Label"
                onChangeTimer={mockOnChangeTimer}
                onChangeMinutter={mockOnChangeMinutter}
                onBlur={mockOnBlur}
                timer=""
                minutter=""
            />,
        );
        const input = getByLabelText('Timer');
        fireEvent.change(input, { target: { value: '7' } });
        expect(mockOnChangeTimer).toHaveBeenCalledWith('7');
    });

    it('calls onChangeMinutter when minutter input is changed', () => {
        const { getByLabelText } = render(
            <TimerOgMinutter
                label="Test Label"
                onChangeTimer={mockOnChangeTimer}
                onChangeMinutter={mockOnChangeMinutter}
                onBlur={mockOnBlur}
                timer=""
                minutter=""
            />,
        );
        const input = getByLabelText('Minutter');
        fireEvent.change(input, { target: { value: '30' } });
        expect(mockOnChangeMinutter).toHaveBeenCalledWith('30');
    });

    it('calls onBlur when input loses focus', () => {
        const { getByLabelText } = render(
            <TimerOgMinutter
                label="Test Label"
                onChangeTimer={mockOnChangeTimer}
                onChangeMinutter={mockOnChangeMinutter}
                onBlur={mockOnBlur}
                timer=""
                minutter=""
            />,
        );
        const input = getByLabelText('Timer');
        fireEvent.blur(input);
        expect(mockOnBlur).toHaveBeenCalled();
    });

    it('displays error message when error prop is provided', () => {
        const { getByText } = render(
            <TimerOgMinutter
                label="Test Label"
                onChangeTimer={mockOnChangeTimer}
                onChangeMinutter={mockOnChangeMinutter}
                onBlur={mockOnBlur}
                timer=""
                minutter=""
                error="Test error message"
            />,
        );
        expect(getByText('Test error message')).toBeInTheDocument();
    });
});
