import React from 'react';
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithIntl } from '../../testUtils';
import FaktiskOgNormalTid from '../../../app/components/timefoering/FaktiskOgNormalTid';

describe('FaktiskOgNormalTid', () => {
    const mockLagre = jest.fn();
    const mockToggleModal = jest.fn();
    const mockClearSelectedDates = jest.fn();

    it('renderWithIntls without crashing', () => {
        renderWithIntl(<FaktiskOgNormalTid lagre={mockLagre} toggleModal={mockToggleModal} selectedDates={[]} />);
    });

    it('updates value when input is changed', async () => {
        const { getAllByLabelText } = renderWithIntl(
            <FaktiskOgNormalTid lagre={mockLagre} toggleModal={mockToggleModal} selectedDates={[]} />,
        );
        const input = getAllByLabelText('Timer')[0];
        await userEvent.type(input, '7');

        expect(input.value).toBe('7');
    });

    it('toggles time format and converts time correctly', async () => {
        const { getByLabelText, getByText, getAllByLabelText } = renderWithIntl(
            <FaktiskOgNormalTid
                lagre={mockLagre}
                toggleModal={mockToggleModal}
                selectedDates={[]}
                clearSelectedDates={mockClearSelectedDates}
            />,
        );
        // Initialize the time
        const normalArbeidstidTimer = getAllByLabelText('Timer')[0];
        const normalArbeidstidMinutter = getAllByLabelText('Minutter')[0];
        await userEvent.type(normalArbeidstidTimer, '2');
        await userEvent.type(normalArbeidstidMinutter, '30');

        // Toggle to decimal format
        const desimaltallToggle = getByText('Desimaltall');
        await userEvent.click(desimaltallToggle);

        // Verify time has been converted to decimal
        const normalArbeidstidDesimaler = getByLabelText('Normal arbeidstid');
        expect(normalArbeidstidDesimaler.value).toBe('2.5');

        // Toggle back to hours and minutes format
        const timerOgMinutterToggle = getByText('Timer og minutter');
        await userEvent.click(timerOgMinutterToggle);

        // Verify time has been converted back to hours and minutes
        expect(normalArbeidstidTimer.value).toBe('2');
        expect(normalArbeidstidMinutter.value).toBe('30');
    });

    it('converts correctly after changing numbers', async () => {
        const { getByLabelText, getByRole, getAllByLabelText } = renderWithIntl(
            <FaktiskOgNormalTid
                lagre={mockLagre}
                toggleModal={mockToggleModal}
                selectedDates={[]}
                clearSelectedDates={mockClearSelectedDates}
            />,
        );

        // Initialize the time
        const normalArbeidstidTimer = getAllByLabelText('Timer')[0];
        const normalArbeidstidMinutter = getAllByLabelText('Minutter')[0];
        await userEvent.type(normalArbeidstidTimer, '3');
        await userEvent.type(normalArbeidstidMinutter, '45');

        // Toggle to decimal format
        const desimaltallToggle = getByRole('radio', { name: /Desimaltall/i });
        await userEvent.click(desimaltallToggle);

        // Check that time has been converted to decimal format
        const normalArbeidstidDesimaler = getByLabelText('Normal arbeidstid');
        expect(normalArbeidstidDesimaler.value).toBe('3.75');

        await userEvent.clear(normalArbeidstidDesimaler);
        await userEvent.type(normalArbeidstidDesimaler, '4');

        // Verify time has been converted to decimal format
        const normalArbeidstidDesimalerAfter = getByLabelText('Normal arbeidstid');

        await waitFor(() => {
            expect(normalArbeidstidDesimalerAfter.value).toBe('4');
        });
        // Toggle back to hours and minutes format
        const timerOgMinutterToggle = getByRole('radio', { name: /Timer og minutter/i });
        await userEvent.click(timerOgMinutterToggle);

        // Verify time has been converted back to hours and minutes

        const normalArbeidstidTimer2 = getAllByLabelText('Timer')[0];
        const normalArbeidstidMinutter2 = getAllByLabelText('Minutter')[0];

        await waitFor(() => {
            expect(normalArbeidstidTimer2.value).toBe('4');
            expect(normalArbeidstidMinutter2.value).toBe('0');
        });
    });
});
