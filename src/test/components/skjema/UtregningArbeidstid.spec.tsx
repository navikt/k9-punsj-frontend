import React from 'react';
import { screen } from '@testing-library/react';
import UtregningArbeidstid from 'app/containers/pleiepenger/UtregningArbeidstid';
import { renderWithIntl } from '../../testUtils';

jest.mock('app/utils/envUtils');

describe('utregning av arbeidstid', () => {
    test('viser timer per uke', () => {
        renderWithIntl(<UtregningArbeidstid arbeidstid="7,5" />);

        expect(screen.getByText('= 37.5 timer per uke')).toBeInTheDocument();
    });
    test('viser prosent av normal arbeidstid', () => {
        renderWithIntl(<UtregningArbeidstid arbeidstid="5" normalArbeidstid="7,5" />);

        expect(screen.getByText('= 25 timer per uke')).toBeInTheDocument();
        expect(screen.getByText('(tilsvarer 66.667% arbeid)')).toBeInTheDocument();
    });
    test('skjuler prosent av normal arbeidstid når utregning er ∞', () => {
        renderWithIntl(<UtregningArbeidstid arbeidstid="1" normalArbeidstid="0" />);

        expect(screen.getByText('= 5 timer per uke')).toBeInTheDocument();
        expect(screen.queryByText('(tilsvarer ∞% arbeid)')).not.toBeInTheDocument();
    });
    test('skjuler prosent av normal arbeidstid når utregning er ∞', () => {
        renderWithIntl(<UtregningArbeidstid arbeidstid="0" normalArbeidstid="0" />);

        expect(screen.getByText('= 0 timer per uke')).toBeInTheDocument();
        expect(screen.queryByText('(tilsvarer NaN% arbeid)')).not.toBeInTheDocument();
    });
});
