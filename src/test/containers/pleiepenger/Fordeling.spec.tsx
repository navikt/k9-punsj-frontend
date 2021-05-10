import {
    FordelingComponent,
    IFordelingDispatchProps,
    IFordelingStateProps,
} from 'app/containers/pleiepenger/Fordeling';
import {Sakstype} from 'app/models/enums';
import {IFordelingState, IJournalpost} from 'app/models/types';
import intlHelper from 'app/utils/intlUtils';
import {shallow} from 'enzyme';
import * as React from 'react';
import {createIntl, IntlShape, WrappedComponentProps} from 'react-intl';
import {mocked} from 'ts-jest/utils';
import {IIdentState} from "../../../app/models/types/IdentState";

jest.mock('react-intl');
jest.mock('react-router');
jest.mock('app/utils/browserUtils');
jest.mock('app/utils/envUtils');
jest.mock('app/utils/intlUtils');
jest.mock('app/utils/pathUtils');

const journalpostid = '200';

const setupFordeling = (
    fordelingStatePartial?: Partial<IFordelingState>,
    fordelingDispatchPropsPartial?: Partial<IFordelingDispatchProps>
) => {
    const wrappedComponentProps: WrappedComponentProps = {
        intl: createIntl({locale: 'nb', defaultLocale: 'nb'}),
    };

    const fordelingDispatchProps: IFordelingDispatchProps = {
        omfordel: jest.fn(),
        setSakstypeAction: jest.fn(),
        setIdentAction: jest.fn(),
        ...fordelingDispatchPropsPartial,
    };

    const journalpost: IJournalpost = {
        dokumenter: [{dokumentId: '123'}],
        journalpostId: journalpostid,
        norskIdent: '12345678901',
    };

    const fordelingState: IFordelingState = {
        omfordelingDone: false,
        isAwaitingOmfordelingResponse: false,
        sakstype: Sakstype.PLEIEPENGER_SYKT_BARN,
        ...fordelingStatePartial,
    };

    const identState: IIdentState = {
        ident1: '',
        ident2: '',
    };

    const fordelingStateProps: IFordelingStateProps = {
        journalpost,
        fordelingState,
        journalpostId: journalpostid,
        identState
    };

    mocked(intlHelper).mockImplementation(
        (intl: IntlShape, id: string, value?: { [key: string]: string }) => id
    );

    return shallow(
        <FordelingComponent
            {...wrappedComponentProps}
            {...fordelingStateProps}
            {...fordelingDispatchProps}
        />
    );
};

describe('Fordeling', () => {
    it('Viser radioknappgruppe', () => {
        const fordeling = setupFordeling();
        expect(fordeling.find('RadioGruppe')).toHaveLength(1);
    });

    it('Viser radioknapp for hver kategori', () => {
        const fordeling = setupFordeling();
        const radios = fordeling.find('RadioPanel');
        const radioForSakstype = (sakstype: Sakstype) =>
            radios.findWhere((radio) => radio.prop('value') === sakstype);

        expect(radios).toHaveLength(5);
        expect(radioForSakstype(Sakstype.PLEIEPENGER_SYKT_BARN)).toHaveLength(1);
        expect(radioForSakstype(Sakstype.OMSORGSPENGER)).toHaveLength(1);
        expect(radioForSakstype(Sakstype.OPPLAERINGSPENGER)).toHaveLength(1);
        expect(
            radioForSakstype(Sakstype.PLEIEPENGER_I_LIVETS_SLUTTFASE)
        ).toHaveLength(1);
        expect(radioForSakstype(Sakstype.ANNET)).toHaveLength(1);
    });

    it('Kaller setSakstypeAction', () => {
        const setSakstypeAction = jest.fn();
        const fordeling = setupFordeling(undefined, {setSakstypeAction});
        const newSakstype = Sakstype.ANNET;
        fordeling.find('RadioPanel').at(4).simulate('change');
        expect(setSakstypeAction).toHaveBeenCalledTimes(1);
        expect(setSakstypeAction).toHaveBeenCalledWith(newSakstype);
    });

    it('Omfordeler', () => {
        const omfordel = jest.fn();
        const sakstype = Sakstype.ANNET;
        const fordeling = setupFordeling({sakstype}, {omfordel});
        fordeling.find('Behandlingsknapp').dive().simulate('click');
        expect(omfordel).toHaveBeenCalledTimes(1);
        expect(omfordel).toHaveBeenCalledWith(journalpostid, "12345678901");
    });

    it('Viser spinner mens svar avventes', () => {
        const fordeling = setupFordeling({isAwaitingOmfordelingResponse: true});
        expect(fordeling.find('NavFrontendSpinner')).toHaveLength(1);
    });

    it('Viser suksessmelding når omfordeling er utført', () => {
        const fordeling = setupFordeling({omfordelingDone: true});
        expect(fordeling.find('AlertStripeSuksess')).toHaveLength(1);
        expect(fordeling.find('AlertStripeSuksess').children().text()).toEqual(
            'fordeling.omfordeling.utfort'
        );
    });

    it('Viser feilmelding for omfordeling', () => {
        const fordeling = setupFordeling({omfordelingError: {status: 404}});
        expect(fordeling.find('AlertStripeFeil')).toHaveLength(1);
        expect(fordeling.find('AlertStripeFeil').children().text()).toEqual(
            'fordeling.omfordeling.feil'
        );
    });
});
