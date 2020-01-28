import {
    IMapperOgFagsakerComponentProps,
    IMapperOgFagsakerDispatchProps,
    IMapperOgFagsakerStateProps,
    MapperOgFagsakerComponent
}                                                                  from 'app/containers/punch-page/MapperOgFagsaker';
import {IJournalpost, IMappe, IMapperOgFagsakerState, IPunchState} from 'app/models/types';
import intlHelper                                                  from 'app/utils/intlUtils';
import {configure, shallow}                                        from 'enzyme';
import Adapter                                                     from 'enzyme-adapter-react-16';
import * as React                                                  from 'react';
import {createIntl, IntlShape, WrappedComponentProps}              from 'react-intl';
import {mocked}                                                    from 'ts-jest/utils';

jest.mock('react-intl');
jest.mock('react-router');
jest.mock('app/containers/punch-page/FagsakReadMode', () => ({FagsakReadMode: () => <></>}));
jest.mock('app/containers/punch-page/SoknadReadMode', () => ({SoknadReadMode: () => <></>}));
jest.mock('app/utils/browserUtils', () => ({getHash: () => '#/hentsoknader/testident', setHash: jest.fn()}));
jest.mock('app/utils/envUtils');
jest.mock('app/utils/intlUtils');
jest.mock('app/utils/pathUtils');

configure({adapter: new Adapter()});

const ident1 = '1234';
const ident2 = null;

const mappe: IMappe = {
    mappeId: '567',
    personer: {[ident1]: {
        soeknad: {},
        innsendinger: [],
        mangler: []
    }}
};

const setupMapperOgFagsaker = (
    mapperOgFagsakerStatePartial?: Partial<IMapperOgFagsakerState>,
    mapperOgFagsakerDispatchPropsPartial?: Partial<IMapperOgFagsakerDispatchProps>
) => {

    const journalpostid = '200';

    const wrappedComponentProps: WrappedComponentProps = {
        intl: createIntl({locale: 'nb', defaultLocale: 'nb'})
    };

    const mapperOgFagsakerDispatchProps: IMapperOgFagsakerDispatchProps = {
        setIdentAction: jest.fn(),
        chooseMappeAction: jest.fn(),
        closeFagsakAction: jest.fn(),
        closeMappeAction: jest.fn(),
        createMappe: jest.fn(),
        findFagsaker: jest.fn(),
        findMapper: jest.fn(),
        openFagsakAction: jest.fn(),
        openMappeAction: jest.fn(),
        resetMappeidAction: jest.fn(),
        setStepAction: jest.fn(),
        undoSearchForMapperAction: jest.fn(),
        ...mapperOgFagsakerDispatchPropsPartial
    };

    const journalpost: IJournalpost = {
        dokumenter: [{dokumentId: '123'}],
        journalpostId: journalpostid,
        norskIdent: '12345678901'
    };

    const punchState: IPunchState = {
        journalpost,
        ident1,
        ident2,
        step: 2,
        isJournalpostLoading: false
    };

    const mapperOgFagsakerState: IMapperOgFagsakerState = {
        mapper: [mappe],
        fagsaker: [],
        ...mapperOgFagsakerStatePartial
    };

    const mapperOgFagsakerStateProps: IMapperOgFagsakerStateProps = {
        punchState,
        mapperOgFagsakerState
    };

    const mapperOgFagsakerComponentProps: IMapperOgFagsakerComponentProps = {
        getPunchPath: () => '#/hentsoknader/testident',
        journalpostid,
        ident1,
        ident2
    };

    mocked(intlHelper).mockImplementation((intl: IntlShape, id: string, value?: {[key: string]: string}) => id);

    return shallow(
        <MapperOgFagsakerComponent
            {...mapperOgFagsakerComponentProps}
            {...wrappedComponentProps}
            {...mapperOgFagsakerStateProps}
            {...mapperOgFagsakerDispatchProps}
        />
    );
};

describe('MapperOgFagsaker', () => {

    it('Viser tabell med ufullstendige søknader', () => {
        const mapperOgFagsaker = setupMapperOgFagsaker();
        expect(mapperOgFagsaker.find('.punch_mappetabell')).toHaveLength(1);
    });

    it('Velger en ufullstendig søknad', () => {
        const chooseMappeAction = jest.fn();
        const mapperOgFagsaker = setupMapperOgFagsaker({}, {chooseMappeAction});
        mapperOgFagsaker.find('ModalWrapper .punch_mappemodal_knapperad .knapp1').simulate('click');
        expect(chooseMappeAction).toHaveBeenCalledTimes(1);
        expect(chooseMappeAction).toHaveBeenCalledWith(mappe);
    });
});