import {
    IMapperOgFagsakerComponentProps,
    IMapperOgFagsakerDispatchProps,
    IMapperOgFagsakerStateProps,
    MapperOgFagsakerComponent
}                                                                  from 'app/containers/punch-page/MapperOgFagsaker';
import {IJournalpost, IMappe, IMapperOgFagsakerState, IPunchState} from 'app/models/types';
import {configure, shallow}                                        from 'enzyme';
import Adapter                                                     from 'enzyme-adapter-react-16';
import * as React                                                  from 'react';
import {createIntl, WrappedComponentProps}                         from 'react-intl';

jest.mock('react-intl');
jest.mock('react-router');
jest.mock('app/containers/punch-page/FagsakReadMode', () => ({FagsakReadMode: () => <></>}));
jest.mock('app/containers/punch-page/SoknadReadMode', () => ({SoknadReadMode: () => <></>}));
jest.mock('app/utils/browserUtils', () => ({getHash: () => '#/hentsoknader/testident', setHash: jest.fn()}));
jest.mock('app/utils/envUtils');
jest.mock('app/utils/pathUtils');

configure({adapter: new Adapter()});

const setupMapperOgFagsaker = (
    ident: string,
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

    const mapperOgFagsakerState: IMapperOgFagsakerState = {
        mapper: [],
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
        ident
    };

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

        const ident = '1234';
        const mappe: IMappe = {
            mappe_id: '567',
            personer: {[ident]: {
                innhold: {},
                innsendinger: [],
                mangler: []
            }}
        };

        const mapperOgFagsaker = setupMapperOgFagsaker(ident, {mapper: [mappe]});

        expect(mapperOgFagsaker.find('.punch_mappetabell')).toHaveLength(1);
    });

    it('Velger en ufullstendig søknad', () => {

        const ident = '1234';
        const mappe: IMappe = {
            mappe_id: '567',
            personer: {[ident]: {
                    innhold: {},
                    innsendinger: [],
                    mangler: []
                }}
        };
        const chooseMappeAction = jest.fn();

        const mapperOgFagsaker = setupMapperOgFagsaker(ident, {mapper: [mappe]}, {chooseMappeAction});

        mapperOgFagsaker.find('ModalWrapper .punch_mappemodal_knapperad .knapp1')
                        .simulate('click');

        expect(chooseMappeAction).toHaveBeenCalledTimes(1);
        expect(chooseMappeAction).toHaveBeenCalledWith(mappe);
    });
});