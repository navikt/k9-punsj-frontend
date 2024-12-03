import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { createIntl, IntlShape } from 'react-intl';

import VisningAvPerioderSNSoknadKvittering from '../../../app/components/soknadKvittering/VisningAvPerioderSNSoknadKvittering';
import { IPSBSoknadKvitteringSelvstendigNaeringsdrivendePeriode } from '../../../app/models/types/PSBSoknadKvittering';
import intlHelper from '../../../app/utils/intlUtils';
import { mocked } from 'jest-mock';

jest.mock('react-intl');
jest.mock('react-router');
jest.mock('app/utils/browserUtils');
jest.mock('app/utils/envUtils');
jest.mock('app/utils/intlUtils');

const fullstendigResponse: IPSBSoknadKvitteringSelvstendigNaeringsdrivendePeriode[] = [
    {
        perioder: {
            '2021-06-01/2021-06-30': {
                virksomhetstyper: ['FISKE'],
                regnskapsførerNavn: 'Ola Nordmann',
                regnskapsførerTlf: '00000000',
                erVarigEndring: false,
                endringDato: '',
                endringBegrunnelse: '',
                bruttoInntekt: 100000,
                erNyoppstartet: false,
                registrertIUtlandet: false,
                landkode: null,
            },
        },
        organisasjonsnummer: '3243434',
        virksomhetNavn: 'Fiske AS',
    },
];

const varigEndring: IPSBSoknadKvitteringSelvstendigNaeringsdrivendePeriode[] = [
    {
        perioder: {
            '2021-06-01/2021-06-30': {
                virksomhetstyper: ['FISKE'],
                regnskapsførerNavn: 'Ola Nordmann',
                regnskapsførerTlf: '00000000',
                erVarigEndring: true,
                endringDato: '2021-03-16',
                endringBegrunnelse: 'Begrunnelse',
                bruttoInntekt: 100000,
                erNyoppstartet: false,
                registrertIUtlandet: true,
                landkode: 'USA',
            },
        },
        organisasjonsnummer: '3243434',
        virksomhetNavn: 'Fiske AS',
    },
];

const setupVisningAvPerioderSNSoknadKvittering = (
    response: IPSBSoknadKvitteringSelvstendigNaeringsdrivendePeriode[],
) => {
    const intlMock = createIntl({ locale: 'nb', defaultLocale: 'nb' });

    mocked(intlHelper).mockImplementation((intl: IntlShape, id: string) => id);

    return render(<VisningAvPerioderSNSoknadKvittering intl={intlMock} perioder={response} />);
};

describe('VisningAvPerioderSNSoknadKvittering', () => {
    it('Viser orgnummer', () => {
        setupVisningAvPerioderSNSoknadKvittering(fullstendigResponse);

        expect(screen.getByText('skjema.arbeid.arbeidstaker.orgnr:')).toBeInTheDocument();
        expect(screen.getByText(fullstendigResponse[0].organisasjonsnummer)).toBeInTheDocument();
    });

    it('Viser orgnavn', () => {
        setupVisningAvPerioderSNSoknadKvittering(fullstendigResponse);

        expect(screen.getByText('skjema.arbeid.sn.virksomhetsnavn')).toBeInTheDocument();
        expect(screen.getByText(fullstendigResponse[0].virksomhetNavn)).toBeInTheDocument();
    });

    it('Viser periode', () => {
        setupVisningAvPerioderSNSoknadKvittering(fullstendigResponse);

        expect(screen.getByText('skjema.arbeid.sn.når')).toBeInTheDocument();
        expect(screen.getByText('01.06.2021 - 30.06.2021')).toBeInTheDocument();
    });

    it('Viser virksomhetstype', () => {
        setupVisningAvPerioderSNSoknadKvittering(fullstendigResponse);

        expect(screen.getByText('skjema.arbeid.sn.type:')).toBeInTheDocument();
        expect(screen.getByText('Fiske')).toBeInTheDocument();
    });

    it('Viser om virksomheten er registrert i Norge', () => {
        const { rerender } = setupVisningAvPerioderSNSoknadKvittering(fullstendigResponse);

        expect(screen.getByText('skjema.sn.registrertINorge')).toBeInTheDocument();
        expect(screen.getByText('Ja')).toBeInTheDocument();

        const intlMock = createIntl({ locale: 'nb', defaultLocale: 'nb' });
        mocked(intlHelper).mockImplementation((intl: IntlShape, id: string) => id);

        rerender(<VisningAvPerioderSNSoknadKvittering intl={intlMock} perioder={varigEndring} />);
        expect(screen.getByText('skjema.sn.registrertINorge')).toBeInTheDocument();
        expect(screen.getByText('Nei')).toBeInTheDocument();
        expect(screen.getByText('skjema.sn.registrertLand')).toBeInTheDocument();
    });

    it('Viser att virksomheten er registrert i annet land', () => {
        const { rerender } = setupVisningAvPerioderSNSoknadKvittering(fullstendigResponse);
        const intlMock = createIntl({ locale: 'nb', defaultLocale: 'nb' });
        mocked(intlHelper).mockImplementation((intl: IntlShape, id: string) => id);
        rerender(<VisningAvPerioderSNSoknadKvittering intl={intlMock} perioder={varigEndring} />);
        expect(screen.getByText('skjema.sn.registrertINorge')).toBeInTheDocument();
        expect(screen.getByText('Nei')).toBeInTheDocument();
        expect(screen.getByText('skjema.sn.registrertLand')).toBeInTheDocument();
    });

    it('Viser om ikke informasjon av varig endring da det ikke eksisterer', () => {
        const { rerender } = setupVisningAvPerioderSNSoknadKvittering(fullstendigResponse);
        const intlMock = createIntl({ locale: 'nb', defaultLocale: 'nb' });
        mocked(intlHelper).mockImplementation((intl: IntlShape, id: string) => id);
        rerender(<VisningAvPerioderSNSoknadKvittering intl={intlMock} perioder={varigEndring} />);

        expect(screen.getByText('skjema.sn.varigendring')).toBeInTheDocument();
        expect(screen.getByText('Nei')).toBeInTheDocument();
    });

    it('Viser om informasjon om varig endring', () => {
        const { rerender } = setupVisningAvPerioderSNSoknadKvittering(fullstendigResponse);
        const intlMock = createIntl({ locale: 'nb', defaultLocale: 'nb' });
        mocked(intlHelper).mockImplementation((intl: IntlShape, id: string) => id);
        rerender(<VisningAvPerioderSNSoknadKvittering intl={intlMock} perioder={varigEndring} />);

        expect(screen.getByText('skjema.sn.varigendring')).toBeInTheDocument();
        expect(screen.getByText('Ja')).toBeInTheDocument();

        expect(screen.getByText('skjema.sn.varigendringdato')).toBeInTheDocument();
        expect(screen.getByText('16.03.2021')).toBeInTheDocument();

        expect(screen.getByText('skjema.sn.endringbegrunnelse:')).toBeInTheDocument();
        expect(screen.getByText('Begrunnelse')).toBeInTheDocument();
    });

    it('Viser informasjon om brutto inntekt', () => {
        setupVisningAvPerioderSNSoknadKvittering(fullstendigResponse);

        expect(screen.getByText('skjema.sn.bruttoinntekt:')).toBeInTheDocument();
        expect(screen.getByText('100000')).toBeInTheDocument();
    });

    it('Viser informasjon om regnskapsfører', () => {
        setupVisningAvPerioderSNSoknadKvittering(fullstendigResponse);

        expect(screen.getByText('skjema.arbeid.sn.regnskapsførernavn:')).toBeInTheDocument();
        expect(screen.getByText('Ola Nordmann')).toBeInTheDocument();

        expect(screen.getByText('skjema.arbeid.sn.regnskapsførertlf:')).toBeInTheDocument();
        expect(screen.getByText('00000000')).toBeInTheDocument();
    });
});
