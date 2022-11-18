import React from 'react';
import { render, screen } from '@testing-library/react';
import { composeStories, Story } from '@storybook/react';
import userEvent from '@testing-library/user-event';
import * as stories from './ArbeidstidKalender.stories';
import ArbeidstidKalender from './ArbeidstidKalender';

const { Default, MedArbeidstidperiode } = composeStories(stories) as {
    [key: string]: Story<Partial<typeof ArbeidstidKalender>>;
};
describe('ArbeidstidKalender', () => {
    test('oppretter arbeidstidperioder for hver søknadsperiode som finnes', async () => {
        // Arrange
        render(<Default />);

        // Act
        await userEvent.click(screen.getByText(/registrer arbeidstid for en lengre periode/i));

        // Assert
        expect(
            screen.getByRole('button', {
                name: /legg til periode/i,
            })
        ).toBeDefined();
        expect(screen.getAllByText(/normal arbeidstid/i)).toHaveLength(2);
    });

    test('oppretter ikke arbeidstidperioder fra søknadsperioder hvis det finnes arbeidstidperioder fra før av', async () => {
        // Arrange
        render(<MedArbeidstidperiode />);

        // Act
        await userEvent.click(screen.getByText(/registrer arbeidstid for en lengre periode/i));

        // Assert
        expect(
            screen.getByRole('button', {
                name: /legg til periode/i,
            })
        ).toBeDefined();
        expect(screen.getAllByText(/normal arbeidstid/i)).toHaveLength(1);
    });

    test('Viser hele arbeidstidperioden i kalenderkomponenten', async () => {
        render(<MedArbeidstidperiode />);

        await userEvent.click(
            screen.getByRole('button', {
                name: /september 2022 5 dager registrert/i,
            })
        );
        expect(screen.getAllByText(/8 t 0 min/i)).toHaveLength(5);
    });
});
