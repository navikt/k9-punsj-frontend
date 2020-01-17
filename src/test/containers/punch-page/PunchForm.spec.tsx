import {
    IPunchFormComponentProps,
    IPunchFormDispatchProps,
    IPunchFormStateProps,
    PunchFormComponent
}                                                     from 'app/containers/punch-page/PunchForm';
import {IJournalpost, IPunchFormState, IPunchState}   from 'app/models/types';
import intlHelper                                     from 'app/utils/intlUtils';
import {configure, shallow}                           from 'enzyme';
import Adapter                                        from 'enzyme-adapter-react-16';
import * as React                                     from 'react';
import {createIntl, IntlShape, WrappedComponentProps} from 'react-intl';
import {mocked}                                       from 'ts-jest/utils';

jest.mock('react-intl');
jest.mock('react-router');
jest.mock('app/utils/envUtils');
jest.mock('app/utils/intlUtils');
jest.mock('app/utils/pathUtils');

configure({adapter: new Adapter()});

const testMappeid = 'abc';
const testIdent = '01015012345';
const testJournalpostid = '200';

const setupPunchForm = (
    punchFormStateSetup?: Partial<IPunchFormState>,
    punchFormDispatchPropsSetup?: Partial<IPunchFormDispatchProps>,
    identSetup?: string,
    mappeidSetup?: string
) => {

    const journalpostid = testJournalpostid;
    const ident = identSetup || testIdent;
    const mappeid = mappeidSetup || testMappeid;

    const wrappedComponentProps: WrappedComponentProps = {
        intl: createIntl({locale: 'nb', defaultLocale: 'nb'})
    };

    const punchFormDispatchProps: IPunchFormDispatchProps = {
        setStepAction: jest.fn(),
        setIdentAction: jest.fn(),
        resetMappeAction: jest.fn(),
        getMappe: jest.fn(),
        resetPunchFormAction: jest.fn(),
        submitSoknad: jest.fn(),
        undoChoiceOfMappeAction: jest.fn(),
        updateSoknad: jest.fn(),
        ...punchFormDispatchPropsSetup
    };

    const journalpost: IJournalpost = {
        dokumenter: [{dokument_id: '123'}],
        journalpost_id: journalpostid,
        norsk_ident: '12345678901'
    };

    const punchState: IPunchState = {
        journalpost,
        ident,
        step: 3,
        isJournalpostLoading: false
    };

    const punchFormState: IPunchFormState = {
        isMappeLoading: false,
        ...punchFormStateSetup
    };

    const punchFormStateProps: IPunchFormStateProps = {
        punchState,
        punchFormState
    };

    const punchFormComponentProps: IPunchFormComponentProps = {
        getPunchPath: jest.fn(),
        journalpostid,
        id: mappeid
    };

    mocked(intlHelper).mockImplementation((intl: IntlShape, id: string, value?: {[key: string]: string}) => id);

    return shallow(
        <PunchFormComponent
            {...punchFormComponentProps}
            {...wrappedComponentProps}
            {...punchFormStateProps}
            {...punchFormDispatchProps}
        />
    );
};

describe('PunchForm', () => {

    it('Viser skjema', () => {
        const punchForm = setupPunchForm();
        expect(punchForm.find('h2')).toHaveLength(5);
    });

    it('Henter mappeinformasjon', () => {
        const getMappe = jest.fn();
        setupPunchForm({}, {getMappe});
        expect(getMappe).toHaveBeenCalledTimes(1);
        expect(getMappe).toHaveBeenCalledWith(testMappeid);
    });

    it('Viser spinner når mappen lastes inn', () => {
        const punchForm = setupPunchForm({isMappeLoading: true});
        expect(punchForm.find('NavFrontendSpinner')).toHaveLength(1);
    });

    it('Viser feilmelding når mappen ikke er funnet', () => {
        const punchForm = setupPunchForm({error: {status: 404}});
        expect(punchForm.find('AlertStripeFeil')).toHaveLength(1);
        expect(punchForm.find('AlertStripeFeil').prop('children')).toEqual('skjema.feil.ikke_funnet');
    });

    it('Oppdaterer mappe når språk endres', () => {
        const updateSoknad = jest.fn();
        const newSprak = 'nn';
        const punchForm = setupPunchForm({}, {updateSoknad});
        const findSpraakSelect = () => punchForm.find('Select[label="skjema.spraak"]');
        findSpraakSelect().simulate('change', {target: {value: newSprak}});
        expect(updateSoknad).toHaveBeenCalledTimes(1);
        expect(updateSoknad).toHaveBeenCalledWith(testMappeid, testIdent, testJournalpostid, expect.objectContaining({spraak: newSprak}));
        expect(findSpraakSelect().prop('value')).toEqual(newSprak);
    });

    it('Oppdaterer mappe når barnets fødselsnummer endres', () => {
        const updateSoknad = jest.fn();
        const newIdent = '01010012345';
        const punchForm = setupPunchForm({}, {updateSoknad});
        punchForm.find('#barn-ident').simulate('blur', {target: {value: newIdent}});
        expect(updateSoknad).toHaveBeenCalledTimes(1);
        expect(updateSoknad).toHaveBeenCalledWith(testMappeid, testIdent, testJournalpostid, {barn: expect.objectContaining({norsk_ident: newIdent})});
    });

    it('Oppdaterer felt når barnets fødselsnummer endres', () => {
        const newIdent = '01010012345';
        const punchForm = setupPunchForm();
        punchForm.find('#barn-ident').simulate('change', {target: {value: newIdent}});
        expect(punchForm.find('#barn-ident').prop('value')).toEqual(newIdent);
    });

    it('Sender inn søknad', () => {
        const submitSoknad = jest.fn();
        const punchForm = setupPunchForm({}, {submitSoknad});
        punchForm.find('.sendknapp-wrapper')
                 .find('Knapp')
                 .simulate('click');
        expect(submitSoknad).toHaveBeenCalledTimes(1);
        expect(submitSoknad).toHaveBeenCalledWith(testMappeid, testIdent);
    });
});