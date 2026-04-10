import React from 'react';

import Pleietrengende from 'app/fordeling/Komponenter/Pleietrengende';
import { renderWithIntl } from '../../testUtils';

describe('Pleietrengende', () => {
    it('renders controlled select without controlled or uncontrolled warning', () => {
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

        renderWithIntl(
            <Pleietrengende
                identState={{
                    søkerId: '12345678910',
                    pleietrengendeId: '10987654321',
                    annenSokerIdent: null,
                    annenPart: '',
                }}
                fellesState={{
                    dedupKey: 'dedup-key',
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
