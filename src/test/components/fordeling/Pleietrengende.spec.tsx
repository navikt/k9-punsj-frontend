import React, { useState } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Pleietrengende from 'app/fordeling/Komponenter/Pleietrengende';
import { renderWithIntl } from '../../testUtils';

const PleietrengendeKontrollert = () => {
    const [barnetHarIkkeFnr, setBarnetHarIkkeFnr] = useState(false);
    const [komponentNøkkel, setKomponentNøkkel] = useState(0);

    return (
        <>
            <button type="button" onClick={() => setKomponentNøkkel((nøkkel) => nøkkel + 1)}>
                Remonter pleietrengende
            </button>
            <Pleietrengende
                key={komponentNøkkel}
                identState={{
                    søkerId: '12345678910',
                    pleietrengendeId: '',
                    annenSokerIdent: null,
                    annenPart: '',
                }}
                fellesState={{ hentBarnSuccess: true, barn: [] }}
                toSokereIJournalpost={false}
                visPleietrengende
                skalHenteBarn={false}
                barnetHarIkkeFnr={barnetHarIkkeFnr}
                setBarnetHarIkkeFnr={setBarnetHarIkkeFnr}
                setIdentAction={() => undefined}
                henteBarn={() => undefined}
            />
        </>
    );
};

describe('Pleietrengende', () => {
    it('styrer checkbox, identfelt og informasjon fra forelderen også etter remount', async () => {
        const user = userEvent.setup();
        renderWithIntl(<PleietrengendeKontrollert />);

        const checkbox = screen.getByRole('checkbox', { name: 'Pleietrengende har ikke fødselsnummer' });
        const identfelt = screen.getByLabelText('Pleietrengendes fødselsnummer:');

        await user.click(checkbox);
        expect(checkbox).toBeChecked();
        expect(identfelt).toBeDisabled();
        expect(screen.getByText(/Dokumentet kan ikke sendes til K9/)).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Remonter pleietrengende' }));
        expect(screen.getByRole('checkbox', { name: 'Pleietrengende har ikke fødselsnummer' })).toBeChecked();
        expect(screen.getByLabelText('Pleietrengendes fødselsnummer:')).toBeDisabled();
        expect(screen.getByText(/Dokumentet kan ikke sendes til K9/)).toBeInTheDocument();

        await user.click(screen.getByRole('checkbox', { name: 'Pleietrengende har ikke fødselsnummer' }));
        expect(screen.getByRole('checkbox', { name: 'Pleietrengende har ikke fødselsnummer' })).not.toBeChecked();
        expect(screen.getByLabelText('Pleietrengendes fødselsnummer:')).toBeEnabled();
        expect(screen.queryByText(/Dokumentet kan ikke sendes til K9/)).not.toBeInTheDocument();
    });

    it('renders controlled select without controlled or uncontrolled warning', () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

        renderWithIntl(
            <Pleietrengende
                identState={{
                    søkerId: '12345678910',
                    pleietrengendeId: '10987654321',
                    annenSokerIdent: null,
                    annenPart: '',
                }}
                fellesState={{
                    hentBarnSuccess: true,
                    barn: [
                        {
                            identitetsnummer: '10987654321',
                            fødselsdato: '2015-01-01',
                            fornavn: 'Test',
                            etternavn: 'Barn',
                            sammensattNavn: 'Test Barn',
                        },
                    ],
                }}
                toSokereIJournalpost={false}
                visPleietrengende
                skalHenteBarn={false}
                setIdentAction={() => undefined}
                henteBarn={() => undefined}
            />,
        );

        expect(errorSpy.mock.calls.flat().join(' ')).not.toContain(
            'Select elements must be either controlled or uncontrolled',
        );

        errorSpy.mockRestore();
    });
});
