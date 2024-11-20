import React from 'react';
import { expect } from '@jest/globals';
import { shallow } from 'enzyme';
import { mocked } from 'jest-mock';
import { IntlShape, createIntl } from 'react-intl';
import VisningAvPerioderSoknadKvittering from '../../../app/components/soknadKvittering/VisningAvPerioderSoknadKvittering';
import { formattereTimerForArbeidstakerPerioder } from '../../../app/søknader/pleiepenger/containers/SoknadKvittering/soknadKvitteringUtils';
import { IPSBSoknadKvitteringArbeidstidInfo } from '../../../app/models/types/PSBSoknadKvittering';
import intlHelper from '../../../app/utils/intlUtils';

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

const setupVisningAvPerioderSoknadKvittering = (response: IPSBSoknadKvitteringArbeidstidInfo) => {
    const intlMock = createIntl({ locale: 'nb', defaultLocale: 'nb' });
    mocked(intlHelper).mockImplementation((intl: IntlShape, id: string) => id);

    return shallow(
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
    const visningAvPerioderSoknadKvitteringEnPeriode = setupVisningAvPerioderSoknadKvittering(enPeriode);
    const visningAvPerioderSoknadKvitteringFlerePerioder = setupVisningAvPerioderSoknadKvittering(flerePerioder);

    it('Viser overskrifter', () => {
        expect(visningAvPerioderSoknadKvitteringEnPeriode.text().includes('skjema.periode.overskrift')).toBe(true);
        expect(
            visningAvPerioderSoknadKvitteringEnPeriode.text().includes('skjema.arbeid.arbeidstaker.timernormalt'),
        ).toBe(true);
        expect(
            visningAvPerioderSoknadKvitteringEnPeriode.text().includes('skjema.arbeid.arbeidstaker.timerfaktisk'),
        ).toBe(true);

        expect(visningAvPerioderSoknadKvitteringFlerePerioder.text().includes('skjema.periode.overskrift')).toBe(true);
        expect(
            visningAvPerioderSoknadKvitteringFlerePerioder.text().includes('skjema.arbeid.arbeidstaker.timernormalt'),
        ).toBe(true);
        expect(
            visningAvPerioderSoknadKvitteringFlerePerioder.text().includes('skjema.arbeid.arbeidstaker.timerfaktisk'),
        ).toBe(true);
    });

    it('Viser dato, forventet arbeidstid og verklig arbeidstid', () => {
        expect(visningAvPerioderSoknadKvitteringEnPeriode.text().includes('01.06.2021 - 30.06.2021')).toBe(true);
        expect(visningAvPerioderSoknadKvitteringEnPeriode.text().includes('8 timer')).toBe(true);
        expect(visningAvPerioderSoknadKvitteringEnPeriode.text().includes('4 timer')).toBe(true);

        expect(visningAvPerioderSoknadKvitteringFlerePerioder.text().includes('01.06.2021 - 30.06.2021')).toBe(true);
        expect(visningAvPerioderSoknadKvitteringFlerePerioder.text().includes('8 timer')).toBe(true);
        expect(visningAvPerioderSoknadKvitteringFlerePerioder.text().includes('4 timer')).toBe(true);

        expect(visningAvPerioderSoknadKvitteringFlerePerioder.text().includes('01.07.2021 - 30.07.2021')).toBe(true);
        expect(visningAvPerioderSoknadKvitteringFlerePerioder.text().includes('7 timer og 30 minutter')).toBe(true);
        expect(visningAvPerioderSoknadKvitteringFlerePerioder.text().includes('6 timer og 15 minutter')).toBe(true);
    });
});
