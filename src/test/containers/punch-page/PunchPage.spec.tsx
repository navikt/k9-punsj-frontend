import {
    IPunchPageComponentProps,
    IPunchPageDispatchProps,
    IPunchPageStateProps,
    PunchPageComponent
}                                                     from 'app/containers/punch-page/PunchPage';
import {IJournalpost, IPunchState}                    from 'app/models/types';
import intlHelper                                     from 'app/utils/intlUtils';
import {configure, shallow}                           from 'enzyme';
import Adapter                                        from 'enzyme-adapter-react-16';
import {createMemoryHistory}                          from 'history';
import * as React                                     from 'react';
import {createIntl, IntlShape, WrappedComponentProps} from 'react-intl';
import {mocked}                                       from 'ts-jest/utils';

jest.mock('react-intl');
jest.mock('react-router');
jest.mock('app/utils/envUtils');
jest.mock('app/utils/intlUtils');
jest.mock('app/utils/pathUtils');
jest.mock('app/containers/punch-page/Fordeling', () => ({Fordeling: () => <></>}));
jest.mock('app/containers/punch-page/MapperOgFagsaker', () => ({MapperOgFagsaker: () => <></>}));
jest.mock('app/containers/punch-page/PunchForm', () => ({PunchForm: () => <></>}));

configure({adapter: new Adapter()});

const setupPunchPage = (journalpostid: string, hash: string, punchState: IPunchState, mappeid?: string) => {

    const routeComponentProps = {
        match: {params: {id: mappeid}},
        history: createMemoryHistory({}),
        location: {pathname: `/${journalpostid}`, hash, search: '', state: ''}
    };

    const wrappedComponentProps: WrappedComponentProps = {
        intl: createIntl({locale: 'nb', defaultLocale: 'nb'})
    };

    const punchPageDispatchProps: IPunchPageDispatchProps = {
        getJournalpost: jest.fn(),
        setIdentAction: jest.fn(),
        setStepAction: jest.fn()
    };

    const journalpost: IJournalpost = {
        dokumenter: [{dokument_id: '123'}],
        journalpost_id: journalpostid,
        norsk_ident: '12345678901'
    };

    punchState = {
        journalpost,
        isJournalpostLoading: false,
        ...punchState
    };

    const punchPageStateProps: IPunchPageStateProps = {
        punchState
    };

    const punchPageComponentProps: IPunchPageComponentProps = {
        step: punchState.step,
        journalpostid,
        paths: []
    };

    mocked(intlHelper).mockImplementation((intl: IntlShape, id: string, value?: {[key: string]: string}) => id);

    return shallow(
        <PunchPageComponent
            {...punchPageComponentProps}
            {...wrappedComponentProps}
            {...routeComponentProps}
            {...punchPageStateProps}
            {...punchPageDispatchProps}
        />
    );
};

describe('PunchPage', () => {

    it('Laster inn fordelingsskjema', () => {

        const journalpostid = '200';

        const punchPage = setupPunchPage(journalpostid,'#/', {
            step: 0,
            ident: ''
        });

        expect(punchPage.find('Fordeling')).toHaveLength(1);
    });

    it('Laster inn IdentPage', () => {

        const journalpostid = '200';

        const punchPage = setupPunchPage(journalpostid, '#/ident', {
            step: 1,
            ident: ''
        });

        expect(punchPage.find('Input')).toHaveLength(1);
        expect(punchPage.find('IdentPage')).toHaveLength(1);
        expect(mocked(intlHelper)).toHaveBeenCalledWith(undefined, 'skjema.ident');
    });

    it('Laster inn oversikt over ufullstendige søknader', () => {

        const journalpostid = '200';
        const ident = '12345678901';

        const punchPage = setupPunchPage(journalpostid, `#/hentsoknad/${ident}`, {
            step: 2,
            ident
        });

        expect(punchPage.find('MapperOgFagsaker')).toHaveLength(1);
        expect(punchPage.find('MapperOgFagsaker').prop('journalpostid')).toEqual(journalpostid);
    });

    it('Laster inn søknadsskjema', () => {

        const journalpostid = '200';
        const ident = '12345678901';
        const mappeid = 'abc';

        const punchPage = setupPunchPage(journalpostid, `#/hentsoknad/${mappeid}`, {
            step: 3,
            ident
        }, mappeid);

        expect(punchPage.find('PunchForm')).toHaveLength(1);
        expect(punchPage.find('PunchForm').prop('journalpostid')).toEqual(journalpostid);
        expect(punchPage.find('PunchForm').prop('id')).toEqual(mappeid);
    });

    it('Viser fullførtmelding', () => {

        const journalpostid = '200';

        const punchPage = setupPunchPage(journalpostid, `#/fullfort`, {
            step: 4,
            ident: ''
        });

        expect(punchPage.find('AlertStripeSuksess')).toHaveLength(1);
    });
});