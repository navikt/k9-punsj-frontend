import React from 'react';

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ArbeidstidKalender from 'app/components/arbeidstid/ArbeidstidKalender';
import { renderWithIntl } from '../../testUtils';

describe('ArbeidstidKalender', () => {
    it('renders when arbeidstidInfo is missing', async () => {
        renderWithIntl(
            <ArbeidstidKalender
                arbeidstidInfo={null}
                updateSoknad={() => undefined}
                søknadsperioder={[{ fom: '2026-01-15', tom: '2026-01-16' }]}
            />,
        );

        expect(screen.getByText('Arbeidstid i søknadsperioden')).toBeInTheDocument();
        expect(screen.getByText('Registrer arbeidstid for en lengre periode')).toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: /Vis mer/i }));
        expect(screen.getByText('Ingen dager registrert')).toBeInTheDocument();
    });
});
