import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import PeriodeInputV2 from '../../../app/components/periode-inputV2/PeriodeInputV2';
import { IPeriode } from '../../../app/models/types/Periode';

describe('PeriodeInputV2', () => {
    const mockOnChange = jest.fn();
    const mockOnBlur = jest.fn();

    const defaultProps = {
        periode: { fom: null, tom: null },
        onChange: mockOnChange,
        onBlur: mockOnBlur,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('rendrer uten å krasje', async () => {
        await act(async () => {
            render(<PeriodeInputV2 {...defaultProps} />);
        });
        expect(screen.getByLabelText('Fra og med')).toBeInTheDocument();
        expect(screen.getByLabelText('Til og med')).toBeInTheDocument();
    });

    it('viser initielle verdier når de er angitt', async () => {
        const initialValues: IPeriode = {
            fom: '2024-01-01',
            tom: '2024-12-31',
        };
        await act(async () => {
            render(<PeriodeInputV2 {...defaultProps} periode={initialValues} />);
        });

        // Vent på at verdiene er oppdatert
        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(screen.getByLabelText('Fra og med')).toHaveValue('01.01.2024');
        expect(screen.getByLabelText('Til og med')).toHaveValue('31.12.2024');
    });

    it('kaller onChange når datoer endres', async () => {
        await act(async () => {
            render(<PeriodeInputV2 {...defaultProps} />);
        });

        const fomInput = screen.getByLabelText('Fra og med');
        const tomInput = screen.getByLabelText('Til og med');

        await act(async () => {
            fireEvent.change(fomInput, { target: { value: '01.01.2024' } });
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        await act(async () => {
            fireEvent.change(tomInput, { target: { value: '31.12.2024' } });
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(mockOnChange).toHaveBeenCalledTimes(2);
        expect(mockOnChange).toHaveBeenLastCalledWith({
            fom: '2024-01-01',
            tom: '2024-12-31',
        });
    });

    it('kaller onBlur når input mister fokus', async () => {
        await act(async () => {
            render(<PeriodeInputV2 {...defaultProps} />);
        });

        const fomInput = screen.getByLabelText('Fra og med');
        await act(async () => {
            fireEvent.blur(fomInput);
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(mockOnBlur).toHaveBeenCalled();
    });

    it('viser feilmeldinger når de er angitt', async () => {
        const errorProps = {
            ...defaultProps,
            fomInputProps: { error: 'Fra og med er påkrevd' },
            tomInputProps: { error: 'Til og med er påkrevd' },
        };

        await act(async () => {
            render(<PeriodeInputV2 {...errorProps} />);
        });

        expect(screen.getByText('Fra og med er påkrevd')).toBeInTheDocument();
        expect(screen.getByText('Til og med er påkrevd')).toBeInTheDocument();
    });

    it('håndterer datovalidering korrekt', async () => {
        await act(async () => {
            render(<PeriodeInputV2 {...defaultProps} />);
        });

        const fomInput = screen.getByLabelText('Fra og med');
        const tomInput = screen.getByLabelText('Til og med');

        await act(async () => {
            // Sett tom før fom
            fireEvent.change(tomInput, { target: { value: '01.01.2024' } });
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        await act(async () => {
            fireEvent.change(fomInput, { target: { value: '31.12.2024' } });
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(mockOnChange).toHaveBeenCalledTimes(2);
        expect(mockOnChange).toHaveBeenLastCalledWith({
            fom: '2024-12-31',
            tom: '2024-12-31', // DatePicker korrigerer datoer automatisk
        });
    });

    it('håndterer tomme datoinput korrekt', async () => {
        await act(async () => {
            render(<PeriodeInputV2 {...defaultProps} />);
        });

        const fomInput = screen.getByLabelText('Fra og med');
        const tomInput = screen.getByLabelText('Til og med');

        await act(async () => {
            fireEvent.change(fomInput, { target: { value: '' } });
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        await act(async () => {
            fireEvent.change(tomInput, { target: { value: '' } });
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        // DatePicker kaller ikke onChange for tomme verdier
        expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('håndterer delvise datoinput korrekt', async () => {
        await act(async () => {
            render(<PeriodeInputV2 {...defaultProps} />);
        });

        const fomInput = screen.getByLabelText('Fra og med');
        await act(async () => {
            fireEvent.change(fomInput, { target: { value: '01.01.2024' } });
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(mockOnChange).toHaveBeenCalledWith({
            fom: '2024-01-01',
            tom: null,
        });
    });
});
