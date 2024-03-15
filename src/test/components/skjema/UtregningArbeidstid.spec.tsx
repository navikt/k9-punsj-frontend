import React from 'react';

import { expect } from '@jest/globals';
import { screen } from '@testing-library/react';

import { renderWithIntl } from '../../testUtils';
import UtregningArbeidstid from '../../../app/components/timefoering/UtregningArbeidstid';

jest.mock('app/utils/envUtils');

describe('utregning av arbeidstid', () => {
    renderWithIntl(<UtregningArbeidstid arbeidstid={{ timer: '7', minutter: '30' }} />);

    test('skjuler prosent av normal arbeidstid når utregning er ∞', () => {
        renderWithIntl(
            <UtregningArbeidstid
                arbeidstid={{ timer: '1', minutter: '0' }}
                normalArbeidstid={{ timer: '0', minutter: '0' }}
            />,
        );

        expect(screen.getByText('= 5 timer og 0 minutter per uke')).toBeInTheDocument();
        expect(screen.queryByText('(tilsvarer ∞% arbeid)')).not.toBeInTheDocument();
    });
    test('skjuler prosent av normal arbeidstid når utregning er NaN', () => {
        renderWithIntl(
            <UtregningArbeidstid
                arbeidstid={{ timer: '0', minutter: '0' }}
                normalArbeidstid={{ timer: '0', minutter: '0' }}
            />,
        );

        expect(screen.getByText('= 0 timer og 0 minutter per uke')).toBeInTheDocument();
        expect(screen.queryByText('(tilsvarer NaN% arbeid)')).not.toBeInTheDocument();
    });
});
