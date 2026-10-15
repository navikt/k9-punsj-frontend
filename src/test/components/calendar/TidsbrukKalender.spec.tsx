import React from 'react';

import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import TidsbrukKalender from 'app/components/calendar/TidsbrukKalender';
import { renderWithIntl } from '../../testUtils';

const gyldigPeriode = {
    fom: new Date('2026-01-15T00:00:00.000Z'),
    tom: new Date('2026-01-16T00:00:00.000Z'),
};

const ControlledTidsbrukKalender = ({ gyldigePerioder = [gyldigPeriode] }: { gyldigePerioder?: typeof gyldigPeriode[] }) => {
    const [selectedDates, setSelectedDates] = React.useState<Date[]>([]);

    return (
        <TidsbrukKalender
            gyldigePerioder={gyldigePerioder}
            dateContentRenderer={() => null}
            tittelRenderer={() => 'Test month'}
            selectedDates={selectedDates}
            setSelectedDates={setSelectedDates}
        />
    );
};

const renderKalender = () =>
    renderWithIntl(<ControlledTidsbrukKalender />);

const åpneKalender = async () => {
    await userEvent.click(screen.getByRole('button', { name: /Vis mer/i }));
};

describe('TidsbrukKalender', () => {
    it('renders nothing when gyldigePerioder is empty', () => {
        const { container } = renderWithIntl(
            <ControlledTidsbrukKalender gyldigePerioder={[]} />,
        );

        expect(container).toBeEmptyDOMElement();
    });

    it('clears selected dates on escape', async () => {
        renderKalender();
        await åpneKalender();

        fireEvent.click(screen.getByTestId('calendar-grid-date-2026-01-15'));
        expect(screen.getByTestId('calendar-grid-date-2026-01-15')).toHaveClass('calendarGrid__day--selected');

        fireEvent.keyDown(document, { key: 'Escape' });
        expect(screen.getByTestId('calendar-grid-date-2026-01-15')).not.toHaveClass('calendarGrid__day--selected');
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

    it('renders selection without local action buttons', async () => {
        renderKalender();
        await åpneKalender();

        fireEvent.click(screen.getByTestId('calendar-grid-date-2026-01-15'));

        expect(screen.getByTestId('calendar-grid-date-2026-01-15')).toHaveClass('calendarGrid__day--selected');
        expect(screen.getByText('Valgt i denne måneden: 1 dag')).toBeInTheDocument();
        expect(screen.getByText('Fortsett nederst for å registrere')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Registrer tid' })).not.toBeInTheDocument();
    });
});
