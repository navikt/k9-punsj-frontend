import * as React from 'react';
import {createIntl, IntlShape, WrappedComponentProps} from "react-intl";
import {IJournalpost} from "../../../app/models/types";
import {JaNei} from "../../../app/models/enums";
import {IIdentState} from "../../../app/models/types/IdentState";
import {mocked} from "ts-jest/utils";
import intlHelper from "../../../app/utils/intlUtils";
import {shallow} from "enzyme";
import {
    ISokersBarn,
    ISokersBarnDispatchProps,
    ISokersBarnStateProps, SokersBarnComponent
} from "../../../app/containers/pleiepenger/Fordeling/Komponenter/SokersBarn";

jest.mock('react-intl');
jest.mock('react-router');
jest.mock('app/utils/browserUtils');
jest.mock('app/utils/envUtils');
jest.mock('app/utils/intlUtils');
jest.mock('app/utils/pathUtils');

const setupSokersBarn = (
    sokersBarnComponentPropsPartial?: Partial<ISokersBarn>,
    dispatchPropsPartial?: Partial<ISokersBarnDispatchProps>,
    sokersBarnStatePropsPartial?: Partial<ISokersBarnStateProps>,
) => {
    const wrappedComponentProps: WrappedComponentProps = {
        intl: createIntl({locale: 'nb', defaultLocale: 'nb'}),
    };

    const dispatchProps: ISokersBarnDispatchProps = {
        setIdentAction: jest.fn(),
        hentBarn: jest.fn(),
        ...dispatchPropsPartial
    };

    const journalpost: IJournalpost = {
        dokumenter: [{dokumentId: '123'}],
        journalpostId: '11111111111',
        norskIdent: '12345678901',
        kanSendeInn: true,
        erSaksbehandler: true
    };

    const identState: IIdentState = {
        ident1: '12345678901',
        ident2: '',
        annenSokerIdent: ''
    };

    const sokersBarnStateProps: ISokersBarnStateProps = {
        journalpost,
        identState,
        fellesState: {
            dedupKey: '',
        },
        dedupkey: '',
        ...sokersBarnStatePropsPartial
    };

    const sokersBarnComponentProps: ISokersBarn = {
        sokersIdent: '12345678910',
        barnetHarInteFnrFn: jest.fn(),
        erBarnUtdatert: false,
        riktigIdentIJournalposten: JaNei.JA,
        ...sokersBarnComponentPropsPartial
    };

    mocked(intlHelper).mockImplementation(
        (intl: IntlShape, id: string, value?: { [key: string]: string }) => id
    );

    return shallow(
        <SokersBarnComponent
            {...wrappedComponentProps}
            {...dispatchProps}
            {...sokersBarnStateProps}
            {...sokersBarnComponentProps}
        />
    );
};
describe('Sokers barn', () => {
    it('Kan fylle in barns identitetsnummer manuellt dersom barn fra apikall går galt', () => {
        const sokersBarn = setupSokersBarn({}, {}, {fellesState: {hentBarnError: true, dedupKey: ''}});
        expect(sokersBarn.find('.fyllUtIdentAnnetBarnContainer')).toHaveLength(1);
        sokersBarn.find('Input').simulate('change', {target: {value: '12345678910'}});
        expect(sokersBarn.find('.dobbelSjekkIdent')).toHaveLength(1);
    });

    it('Kan fylle in barns identitetsnummer manuellt dersom barn fra apikall er tom', () => {
        const sokersBarn = setupSokersBarn({}, {}, {fellesState: {hentBarnSuccess: true, barn: [], dedupKey: ''}});
        expect(sokersBarn.find('.fyllUtIdentAnnetBarnContainer')).toHaveLength(1);
        sokersBarn.find('Input').simulate('change', {target: {value: '12345678910'}});
        expect(sokersBarn.find('.dobbelSjekkIdent')).toHaveLength(1);
    });

    it('Viser barn i dropdown dersom det eksisterer', () => {
        const sokersBarn = setupSokersBarn({}, {}, {
            fellesState:
                {
                    hentBarnSuccess: true, barn: [{
                        identitetsnummer: '12345678910',
                        fødselsdato: '1232333',
                        fornavn: 'Ella',
                        etternavn: 'Nordmann',
                        sammensattNavn: 'Ella Nordmann',
                    }], dedupKey: ''
                }
        });
        expect(sokersBarn.find('Select')).toHaveLength(1);
        expect(sokersBarn.find('Select').html()).toContain('Ella Nordmann');
        expect(sokersBarn.find('Select').html()).toContain('12345678910');
    });

    it('Får varselsboks om man velger annet barn og barnet har ikke fnr', () => {
        const sokersBarn = setupSokersBarn({}, {}, {
            fellesState:
                {
                    hentBarnSuccess: true, barn: [{
                        identitetsnummer: '12345678910',
                        fødselsdato: '1232333',
                        fornavn: 'Ella',
                        etternavn: 'Nordmann',
                        sammensattNavn: 'Ella Nordmann',
                    }], dedupKey: ''
                }
        });

        sokersBarn.find({label: 'ident.identifikasjon.annetBarn'}).simulate('change', {target: {checked: true}});
        expect(sokersBarn.find({label: 'ident.identifikasjon.barnHarIkkeFnr'})).toHaveLength(1);
        sokersBarn.find({label: 'ident.identifikasjon.barnHarIkkeFnr'}).simulate('change', {target: {checked: true}});
        expect(sokersBarn.find('.infotrygd_info')).toHaveLength(1);
    });
});

