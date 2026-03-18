import React from 'react';

import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import TidsbrukKalender from 'app/components/calendar/TidsbrukKalender';
import { renderWithIntl } from '../../testUtils';

const gyldigPeriode = {
    fom: new Date('2026-01-15T00:00:00.000Z'),
    tom: new Date('2026-01-16T00:00:00.000Z'),
};

const TestModalContent = ({ selectedDates = [] }: { selectedDates?: Date[] }) => <div>{`Valgte dager: ${selectedDates.length}`}</div>;

const renderKalender = () =>
    renderWithIntl(
        <div>
            <TidsbrukKalender
                gyldigePerioder={[gyldigPeriode]}
                ModalContent={<TestModalContent />}
                slettPeriode={() => undefined}
                dateContentRenderer={() => null}
                tittelRenderer={() => 'Test month'}
            />
            <button type="button" data-testid="outside">
                Outside
            </button>
        </div>,
    );

const åpneKalender = async () => {
    await userEvent.click(screen.getByRole('button', { name: /Vis mer/i }));
};

const hentRegistrerTidKnapp = () => screen.getByText('Registrer tid').closest('button') as HTMLButtonElement;

describe('TidsbrukKalender', () => {
    it('clears selected dates on escape and outside click', async () => {
        renderKalender();
        await åpneKalender();

        const registrerTidKnapp = hentRegistrerTidKnapp();

        fireEvent.click(screen.getByTestId('calendar-grid-date-2026-01-15'));
        expect(registrerTidKnapp).toBeVisible();

        fireEvent.keyDown(document, { key: 'Escape' });
        expect(registrerTidKnapp).not.toBeVisible();

        fireEvent.click(screen.getByTestId('calendar-grid-date-2026-01-15'));
        expect(registrerTidKnapp).toBeVisible();

        await userEvent.click(screen.getByTestId('outside'));
        expect(registrerTidKnapp).not.toBeVisible();
    });

    it('selects a date range with shift', async () => {
        renderKalender();
        await åpneKalender();

        fireEvent.click(screen.getByTestId('calendar-grid-date-2026-01-15'));
        fireEvent.keyDown(document, { key: 'Shift' });
        fireEvent.click(screen.getByTestId('calendar-grid-date-2026-01-16'));
        fireEvent.keyUp(document, { key: 'Shift' });

        expect(screen.getByTestId('calendar-grid-date-2026-01-15')).toHaveClass('calendarGrid__day--selected');
        expect(screen.getByTestId('calendar-grid-date-2026-01-16')).toHaveClass('calendarGrid__day--selected');
    });

    it('opens modal when a selected date is registered', async () => {
        renderKalender();
        await åpneKalender();

        fireEvent.click(screen.getByTestId('calendar-grid-date-2026-01-15'));
        await userEvent.click(screen.getByRole('button', { name: 'Registrer tid' }));

        const dialog = document.querySelector('dialog[open]');

        expect(dialog).toBeInTheDocument();
        expect(dialog).toHaveAttribute('aria-label', 'Modal');
    });
});
