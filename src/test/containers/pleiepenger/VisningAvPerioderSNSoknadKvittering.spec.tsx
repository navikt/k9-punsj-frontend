import { expect } from '@jest/globals';
import { shallow } from 'enzyme';
import { mocked } from 'jest-mock';
import * as React from 'react';
import { IntlShape, createIntl } from 'react-intl';

import VisningAvPerioderSNSoknadKvittering from '../../../app/components/soknadKvittering/VisningAvPerioderSNSoknadKvittering';
import { IPSBSoknadKvitteringSelvstendigNaeringsdrivendePeriode } from '../../../app/models/types/PSBSoknadKvittering';
import intlHelper from '../../../app/utils/intlUtils';

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

    return shallow(<VisningAvPerioderSNSoknadKvittering intl={intlMock} perioder={response} />);
};

describe('VisningAvPerioderSNSoknadKvittering', () => {
    const visningAvPerioderSNSoknadKvitteringFull = setupVisningAvPerioderSNSoknadKvittering(fullstendigResponse);
    const visningAvPerioderSNSoknadKvitteringVarigEndring = setupVisningAvPerioderSNSoknadKvittering(varigEndring);

    it('Viser orgnummer', () => {
        expect(visningAvPerioderSNSoknadKvitteringFull.text().includes('skjema.arbeid.arbeidstaker.orgnr')).toBe(true);
        expect(
            visningAvPerioderSNSoknadKvitteringFull.text().includes(fullstendigResponse[0].organisasjonsnummer),
        ).toBe(true);
    });

    it('Viser orgnavn', () => {
        expect(visningAvPerioderSNSoknadKvitteringFull.text().includes('skjema.arbeid.sn.virksomhetsnavn')).toBe(true);
        expect(visningAvPerioderSNSoknadKvitteringFull.text().includes(fullstendigResponse[0].virksomhetNavn)).toBe(
            true,
        );
    });

    it('Viser periode', () => {
        expect(visningAvPerioderSNSoknadKvitteringFull.text().includes('skjema.arbeid.sn.når')).toBe(true);
        expect(visningAvPerioderSNSoknadKvitteringFull.text().includes('01.06.2021 - 30.06.2021')).toBe(true);
    });

    it('Viser virksomhetstype', () => {
        expect(visningAvPerioderSNSoknadKvitteringFull.text().includes('skjema.arbeid.sn.type')).toBe(true);
        expect(visningAvPerioderSNSoknadKvitteringFull.text().includes('Fiske')).toBe(true);
    });

    it('Viser om virksomheten er registrert i Norge', () => {
        expect(visningAvPerioderSNSoknadKvitteringFull.text().includes('skjema.sn.registrertINorge')).toBe(true);
        expect(visningAvPerioderSNSoknadKvitteringFull.text().includes('Ja')).toBe(true);

        expect(visningAvPerioderSNSoknadKvitteringVarigEndring.text().includes('skjema.sn.registrertINorge')).toBe(
            true,
        );
        expect(visningAvPerioderSNSoknadKvitteringVarigEndring.text().includes('Nei')).toBe(true);
        expect(visningAvPerioderSNSoknadKvitteringVarigEndring.text().includes('skjema.sn.registrertLand')).toBe(true);
    });

    it('Viser att virksomheten er registrert i annet land', () => {
        expect(visningAvPerioderSNSoknadKvitteringVarigEndring.text().includes('skjema.sn.registrertINorge')).toBe(
            true,
        );
        expect(visningAvPerioderSNSoknadKvitteringVarigEndring.text().includes('Nei')).toBe(true);
        expect(visningAvPerioderSNSoknadKvitteringVarigEndring.text().includes('skjema.sn.registrertLand')).toBe(true);
    });

    it('Viser om ikke informasjon av varig endring da det ikke eksisterer', () => {
        expect(visningAvPerioderSNSoknadKvitteringFull.text().includes('skjema.sn.varigendring')).toBe(true);
        expect(visningAvPerioderSNSoknadKvitteringFull.text().includes('Nei')).toBe(true);
    });

    it('Viser om informasjon om varig endring', () => {
        expect(visningAvPerioderSNSoknadKvitteringVarigEndring.text().includes('skjema.sn.varigendring')).toBe(true);
        expect(visningAvPerioderSNSoknadKvitteringVarigEndring.text().includes('Ja')).toBe(true);

        expect(visningAvPerioderSNSoknadKvitteringVarigEndring.text().includes('skjema.sn.varigendringdato')).toBe(
            true,
        );
        expect(visningAvPerioderSNSoknadKvitteringVarigEndring.text().includes('16.03.2021')).toBe(true);

        expect(visningAvPerioderSNSoknadKvitteringVarigEndring.text().includes('skjema.sn.endringbegrunnelse')).toBe(
            true,
        );
        expect(visningAvPerioderSNSoknadKvitteringVarigEndring.text().includes('egrunnelse')).toBe(true);

        expect(visningAvPerioderSNSoknadKvitteringVarigEndring.text().includes('skjema.sn.endringbegrunnelse')).toBe(
            true,
        );
        expect(visningAvPerioderSNSoknadKvitteringVarigEndring.text().includes('egrunnelse')).toBe(true);
    });

    it('Viser om informasjon om brutto inntekt', () => {
        expect(visningAvPerioderSNSoknadKvitteringFull.text().includes('skjema.sn.bruttoinntekt')).toBe(true);
        expect(visningAvPerioderSNSoknadKvitteringFull.text().includes('100000')).toBe(true);
    });

    it('Viser om informasjon om regnskapsfører', () => {
        expect(visningAvPerioderSNSoknadKvitteringFull.text().includes('skjema.arbeid.sn.regnskapsførernavn')).toBe(
            true,
        );
        expect(visningAvPerioderSNSoknadKvitteringFull.text().includes('Ola Nordmann')).toBe(true);

        expect(visningAvPerioderSNSoknadKvitteringFull.text().includes('skjema.arbeid.sn.regnskapsførertlf')).toBe(
            true,
        );
        expect(visningAvPerioderSNSoknadKvitteringFull.text().includes('00000000')).toBe(true);
    });
});
