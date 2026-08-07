import React from 'react';

import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import TidsbrukKalenderContainer from 'app/components/calendar/TidsbrukKalenderContainer';
import { renderWithIntl } from '../../testUtils';

const TestModalContent = () => <div>Modal content</div>;

const clickExpansionCardByText = async (text: string) => {
    const expansionHeading = await screen.findByText(text);
    const expansionCard = expansionHeading.closest('section');
    const expansionButton = expansionCard?.querySelector('button');

    expect(expansionButton).toBeInTheDocument();

    await userEvent.click(expansionButton as HTMLButtonElement);
};

describe('TidsbrukKalenderContainer', () => {
    it('åpner år og måneder automatisk når de har registrerte dager', () => {
        renderWithIntl(
            <TidsbrukKalenderContainer
                gyldigePerioder={[
                    { fom: '2026-01-15', tom: '2026-01-16' },
                    { fom: '2026-02-16', tom: '2026-02-17' },
                ]}
                kalenderdager={[
                    {
                        date: new Date('2026-01-15T00:00:00.000Z'),
                        tid: { timer: '4', minutter: '0' },
                        tidOpprinnelig: { timer: '7', minutter: '30' },
                    },
                ]}
                ModalContent={<TestModalContent />}
                dateContentRenderer={() => () => null}
                slettPeriode={() => undefined}
            />,
        );

        expect(screen.getByText('1 dag registrert i år')).toBeInTheDocument();
        expect(screen.getByText('1 dag registrert')).toBeInTheDocument();
        expect(screen.getByTestId('calendar-grid-date-2026-01-15')).toBeInTheDocument();
        expect(screen.queryByTestId('calendar-grid-date-2026-02-16')).not.toBeInTheDocument();
    });

    it('beholder markerte dager når en annen måned åpnes', async () => {
        renderWithIntl(
            <TidsbrukKalenderContainer
                gyldigePerioder={[
                    { fom: '2026-01-15', tom: '2026-01-16' },
                    { fom: '2026-02-16', tom: '2026-02-17' },
                ]}
                kalenderdager={[]}
                ModalContent={<TestModalContent />}
                dateContentRenderer={() => () => null}
                slettPeriode={() => undefined}
            />,
        );

        await clickExpansionCardByText('2026');
        await clickExpansionCardByText('Januar 2026');

        fireEvent.click(screen.getByTestId('calendar-grid-date-2026-01-15'));
        expect(screen.getByTestId('calendar-grid-date-2026-01-15')).toHaveClass('calendarGrid__day--selected');
        expect(screen.getByText('Valgte dager: 1')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Registrer tid' })).toBeInTheDocument();

        await clickExpansionCardByText('Februar 2026');

        expect(screen.getByTestId('calendar-grid-date-2026-01-15')).toHaveClass('calendarGrid__day--selected');

        fireEvent.click(screen.getByTestId('calendar-grid-date-2026-02-16'));

        expect(screen.getByTestId('calendar-grid-date-2026-01-15')).toHaveClass('calendarGrid__day--selected');
        expect(screen.getByTestId('calendar-grid-date-2026-02-16')).toHaveClass('calendarGrid__day--selected');
        expect(screen.getByText('Valgte dager: 2')).toBeInTheDocument();
    });

    it('åpner den delte modalen fra action bar under kalenderne', async () => {
        renderWithIntl(
            <TidsbrukKalenderContainer
                gyldigePerioder={[
                    { fom: '2026-01-15', tom: '2026-01-16' },
                    { fom: '2026-02-16', tom: '2026-02-17' },
                ]}
                kalenderdager={[]}
                ModalContent={<TestModalContent />}
                dateContentRenderer={() => () => null}
                slettPeriode={() => undefined}
            />,
        );

        await clickExpansionCardByText('2026');
        await clickExpansionCardByText('Januar 2026');

        fireEvent.click(screen.getByTestId('calendar-grid-date-2026-01-15'));
        await userEvent.click(screen.getByRole('button', { name: 'Registrer tid' }));

        const dialog = document.querySelector('dialog[open]');

        expect(dialog).toBeInTheDocument();
        expect(dialog).toHaveAttribute('aria-label', 'Modal');
    });
});
