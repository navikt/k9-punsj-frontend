import {
    FordelingComponent,
    IFordelingComponentProps,
    IFordelingDispatchProps,
    IFordelingStateProps
}                                                     from 'app/containers/punch-page/Fordeling';
import {Sakstype}                                     from 'app/models/enums';
import {IFordelingState, IJournalpost, IPunchState}   from 'app/models/types';
import intlHelper                                     from 'app/utils/intlUtils';
import {configure, shallow}                           from 'enzyme';
import Adapter                                        from 'enzyme-adapter-react-16';
import * as React                                     from 'react';
import {createIntl, IntlShape, WrappedComponentProps} from 'react-intl';
import {mocked}                                       from 'ts-jest/utils';

jest.mock('react-intl');
jest.mock('react-router');
jest.mock('app/utils/browserUtils');
jest.mock('app/utils/envUtils');
jest.mock('app/utils/intlUtils');
jest.mock('app/utils/pathUtils');

configure({adapter: new Adapter()});

const journalpostid = '200';
const ident = '678';

const setupFordeling = (
    fordelingStatePartial?: Partial<IFordelingState>,
    fordelingDispatchPropsPartial?: Partial<IFordelingDispatchProps>
) => {

    const wrappedComponentProps: WrappedComponentProps = {
        intl: createIntl({locale: 'nb', defaultLocale: 'nb'})
    };

    const fordelingDispatchProps: IFordelingDispatchProps = {
        setStepAction: jest.fn(),
        omfordel: jest.fn(),
        setSakstypeAction: jest.fn(),
        ...fordelingDispatchPropsPartial
    };

    const journalpost: IJournalpost = {
        dokumenter: [{dokument_id: '123'}],
        journalpost_id: journalpostid,
        norsk_ident: '12345678901'
    };

    const punchState: IPunchState = {
        journalpost,
        ident,
        step: 2,
        isJournalpostLoading: false
    };

    const fordelingState: IFordelingState = {
        omfordelingDone: false,
        isAwaitingOmfordelingResponse: false,
        sakstype: Sakstype.PLEIEPENGER_SYKT_BARN,
        ...fordelingStatePartial
    };

    const fordelingStateProps: IFordelingStateProps = {
        punchState,
        fordelingState
    };

    const fordelingComponentProps: IFordelingComponentProps = {
        getPunchPath: jest.fn()
    };

    mocked(intlHelper).mockImplementation((intl: IntlShape, id: string, value?: {[key: string]: string}) => id);

    return shallow(
        <FordelingComponent
            {...fordelingComponentProps}
            {...wrappedComponentProps}
            {...fordelingStateProps}
            {...fordelingDispatchProps}
        />
    );
};

describe('Fordeling', () => {

    it('Viser radioknappgruppe', () => {
        const fordeling = setupFordeling();
        expect(fordeling.find('RadioPanelGruppe')).toHaveLength(1);
    });

    it('Viser radioknapp for hver kategori', () => {
        const fordeling = setupFordeling();
        const optionProps = (sakstype: Sakstype) => ({label: `fordeling.sakstype.${sakstype}`, value: sakstype});
        const radios = fordeling.find('RadioPanelGruppe').prop('radios');
        expect(radios).toContainEqual(optionProps(Sakstype.PLEIEPENGER_SYKT_BARN));
        expect(radios).toContainEqual(optionProps(Sakstype.OMSORGSPENGER));
        expect(radios).toContainEqual(optionProps(Sakstype.OPPLAERINGSPENGER));
        expect(radios).toContainEqual(optionProps(Sakstype.PLEIEPENGER_I_LIVETS_SLUTTFASE));
        expect(radios).toContainEqual(optionProps(Sakstype.ANNET));
        expect(radios).toHaveLength(5);
    });

    it('Kaller setSakstypeAction', () => {
        const setSakstypeAction = jest.fn();
        const fordeling = setupFordeling(undefined, {setSakstypeAction});
        const newSakstype = Sakstype.ANNET;
        fordeling.find('RadioPanelGruppe').simulate('change', {target: {value: newSakstype}});
        expect(setSakstypeAction).toHaveBeenCalledTimes(1);
        expect(setSakstypeAction).toHaveBeenCalledWith(newSakstype);
    });

    it('Omfordeler', () => {
        const omfordel = jest.fn();
        const sakstype = Sakstype.ANNET;
        const fordeling = setupFordeling({sakstype}, {omfordel});
        fordeling.find('Knapp').simulate('click');
        expect(omfordel).toHaveBeenCalledTimes(1);
        expect(omfordel).toHaveBeenCalledWith(journalpostid, sakstype);
    });

    it('Viser spinner mens svar avventes', () => {
        const fordeling = setupFordeling({isAwaitingOmfordelingResponse: true});
        expect(fordeling.find('NavFrontendSpinner')).toHaveLength(1);
    });

    it('Viser suksessmelding når omfordeling er utført', () => {
        const fordeling = setupFordeling({omfordelingDone: true});
        expect(fordeling.find('AlertStripeSuksess')).toHaveLength(1);
        expect(fordeling.find('AlertStripeSuksess').children().text()).toEqual('fordeling.omfordeling.utfort');
    });

    it('Viser feilmelding for omfordeling', () => {
        const fordeling = setupFordeling({omfordelingError: {status: 404}});
        expect(fordeling.find('AlertStripeFeil')).toHaveLength(1);
        expect(fordeling.find('AlertStripeFeil').children().text()).toEqual('fordeling.omfordeling.feil');
    });
});