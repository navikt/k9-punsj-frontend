import React from 'react';
import { render } from '@testing-library/react';
import { createIntl, createIntlCache, IntlShape } from 'react-intl';
import VisningAvPerioderSoknadKvittering from '../../../app/components/soknadKvittering/VisningAvPerioderSoknadKvittering';
import { formattereTimerForArbeidstakerPerioder } from '../../../app/søknader/pleiepenger/containers/SoknadKvittering/soknadKvitteringUtils';
import { IPSBSoknadKvitteringArbeidstidInfo } from '../../../app/models/types/PSBSoknadKvittering';
import { mocked } from 'jest-mock';
import intlHelper from '../../../app/utils/intlUtils';

// Mocks and data
jest.mock('react-intl');
jest.mock('react-router');
jest.mock('app/utils/browserUtils');
jest.mock('app/utils/envUtils');
jest.mock('app/utils/intlUtils');

const enPeriode: IPSBSoknadKvitteringArbeidstidInfo = {
    '2021-06-01/2021-06-30': {
        jobberNormaltTimerPerDag: 'PT8H',
        faktiskArbeidTimerPerDag: 'PT4H',
    },
};

const flerePerioder: IPSBSoknadKvitteringArbeidstidInfo = {
    '2021-06-01/2021-06-30': {
        jobberNormaltTimerPerDag: 'PT8H',
        faktiskArbeidTimerPerDag: 'PT4H',
    },
    '2021-07-01/2021-07-30': {
        jobberNormaltTimerPerDag: 'PT7H30M',
        faktiskArbeidTimerPerDag: 'PT6H15M',
    },
};

const setupVisningAvPerioderSoknadKvittering = (response: IPSBSoknadKvitteringArbeidstidInfo, locale: string) => {
    const cache = createIntlCache();
    const intlMock = createIntl({ locale, defaultLocale: 'nb' }, cache);

    mocked(intlHelper).mockImplementation((intl: IntlShape, id: string) => id);
    return render(
        <VisningAvPerioderSoknadKvittering
            intl={intlMock}
            perioder={formattereTimerForArbeidstakerPerioder(response)}
            tittel={[
                'skjema.periode.overskrift',
                'skjema.arbeid.arbeidstaker.timernormalt',
                'skjema.arbeid.arbeidstaker.timerfaktisk',
            ]}
            properties={['jobberNormaltTimerPerDag', 'faktiskArbeidTimerPerDag']}
        />,
    );
};

describe('VisningAvPerioderSoknadKvittering', () => {
    it('Viser overskrifter', () => {
        const { getByText } = setupVisningAvPerioderSoknadKvittering(enPeriode, 'nb');
        expect(getByText(/skjema\.periode\.overskrift/i)).toBeInTheDocument();
        expect(getByText(/skjema\.arbeid\.arbeidstaker\.timernormalt/i)).toBeInTheDocument();
        expect(getByText(/skjema\.arbeid\.arbeidstaker\.timerfaktisk/i)).toBeInTheDocument();
    });

    it('Viser dato, forventet arbeidstid og verklig arbeidstid', () => {
        const { getByText } = setupVisningAvPerioderSoknadKvittering(enPeriode, 'nb'); // Set to Arabic for RTL

        expect(getByText('01.06.2021 - 30.06.2021')).toBeInTheDocument();
        expect(getByText('8 timer')).toBeInTheDocument();
        expect(getByText('4 timer')).toBeInTheDocument();
    });

    it('Viser dato, forventet arbeidstid og verklig arbeidstid flere perioder', () => {
        const { getByText: getByTextFlerePerioder } = setupVisningAvPerioderSoknadKvittering(flerePerioder, 'ar');
        expect(getByTextFlerePerioder('01.06.2021 - 30.06.2021')).toBeInTheDocument();
        expect(getByTextFlerePerioder('8 timer')).toBeInTheDocument();
        expect(getByTextFlerePerioder('4 timer')).toBeInTheDocument();

        expect(getByTextFlerePerioder('01.07.2021 - 30.07.2021')).toBeInTheDocument();
        expect(getByTextFlerePerioder('7 timer og 30 minutter')).toBeInTheDocument();
        expect(getByTextFlerePerioder('6 timer og 15 minutter')).toBeInTheDocument();
    });
});
