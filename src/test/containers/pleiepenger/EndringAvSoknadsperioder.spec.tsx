import React from 'react';
import { Accordion } from '@navikt/ds-react';
import { renderWithIntl } from '../../testUtils';
import EndringAvSøknadsperioder from '../../../app/søknader/pleiepenger/containers/EndringAvSøknadsperioder/EndringAvSøknadsperioder';
import { IPSBSoknad } from '../../../app/models/types/PSBSoknad';

const baseSoknad: IPSBSoknad = {
    soekerId: '123',
    journalposter: new Set([]),
    barn: {
        foedselsdato: '',
        norskIdent: '456',
    },
    soeknadsperiode: [],
    opptjeningAktivitet: {},
};

const renderComponent = (trekkKravPerioder: IPSBSoknad['trekkKravPerioder'], eksisterendePerioder: IPSBSoknad['soeknadsperiode']) =>
    renderWithIntl(
        <Accordion>
            <EndringAvSøknadsperioder
                isOpen
                onClick={jest.fn()}
                getErrorMessage={() => undefined}
                soknad={{ ...baseSoknad, trekkKravPerioder }}
                updateSoknad={jest.fn()}
                updateSoknadState={jest.fn()}
                eksisterendePerioder={eksisterendePerioder}
            />
        </Accordion>,
    );

describe('EndringAvSøknadsperioder', () => {
    it('viser varsel for start uten listen over berørte perioder', () => {
        const { queryByText, getByText } = renderComponent(
            [{ fom: '2026-01-01', tom: '2026-01-05' }],
            [{ fom: '2026-01-01', tom: '2026-01-31' }],
        );

        expect(getByText(/Du vil fjerne en periode i/)).toBeInTheDocument();
        expect(queryByText('Berørte perioder:')).not.toBeInTheDocument();
        expect(queryByText('01.01.2026 - 31.01.2026')).not.toBeInTheDocument();
    });

    it('viser fortsatt listen over perioder som fjernes helt', () => {
        const { getByText } = renderComponent(
            [{ fom: '2026-01-01', tom: '2026-01-31' }],
            [{ fom: '2026-01-01', tom: '2026-01-31' }],
        );

        expect(getByText('Perioder som fjernes helt:')).toBeInTheDocument();
        expect(getByText('01.01.2026 - 31.01.2026')).toBeInTheDocument();
    });
});
