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

const setupPunchForm = (
    punchFormStateSetup: Partial<IPunchFormState>,
    ident: string,
    mappeid: string,
    punchFormDispatchPropsSetup?: Partial<IPunchFormDispatchProps>
) => {

    const journalpostid = '200';

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
        const ident = '123';
        const mappeid = 'abc';
        const punchForm = setupPunchForm({}, ident, mappeid);
        expect(punchForm.find('h2')).toHaveLength(5);
    });

    it('Henter mappeinformasjon', () => {
        const ident = '123';
        const mappeid = 'abc';
        const getMappe = jest.fn();
        setupPunchForm({}, ident, mappeid, {getMappe});
        expect(getMappe).toHaveBeenCalledTimes(1);
        expect(getMappe).toHaveBeenCalledWith(mappeid);
    });

    it('Viser spinner når mappen lastes inn', () => {
        const ident = '123';
        const mappeid = 'abc';
        const punchForm = setupPunchForm({isMappeLoading: true}, ident, mappeid);
        expect(punchForm.find('NavFrontendSpinner')).toHaveLength(1);
    });

    it('Viser feilmelding når mappen ikke er funnet', () => {
        const ident = '123';
        const mappeid = 'abc';
        const punchForm = setupPunchForm({error: {status: 404}}, ident, mappeid);
        expect(punchForm.find('AlertStripeFeil')).toHaveLength(1);
        expect(punchForm.find('AlertStripeFeil').prop('children')).toEqual('skjema.feil.ikke_funnet');
    });

    it('Oppdaterer mappe når det gjøres endringer', () => {
        const ident = '123';
        const mappeid = 'abc';
        const updateSoknad = jest.fn();
        const newSprak = 'nn';
        const punchForm = setupPunchForm({}, ident, mappeid, {updateSoknad});
        const findSpraakSelect = () => punchForm.find('Select[label="skjema.spraak"]');
        findSpraakSelect().simulate('change', {target: {value: newSprak}});
        expect(updateSoknad).toHaveBeenCalledTimes(1);
        expect(updateSoknad).toHaveBeenCalledWith(mappeid, ident, expect.any(String), expect.objectContaining({spraak: newSprak}));
        expect(findSpraakSelect().prop('value')).toEqual(newSprak);
    });

    it('Skjemaet skal inneholde én periode i starten', () => {
        const punchForm = setupPunchForm({}, '123', 'abc');
        expect(punchForm.find('.periodepanel')).toHaveLength(1);
    });

    it('Legger til periode når man klikker på "Legg til periode"-knappen', () => {
        const ident = '123';
        const mappeid = 'abc';
        const updateSoknad = jest.fn();
        const punchForm = setupPunchForm({}, ident, mappeid, {updateSoknad});
        const numberOfPeriods = () => punchForm.find('.periodepanel').length;
        const numberOfPeriodsBefore = numberOfPeriods();
        punchForm.find('#addperiod').simulate('click');
        expect(updateSoknad).toHaveBeenCalledTimes(1);
        expect(updateSoknad).toHaveBeenCalledWith(mappeid, ident, expect.any(String), expect.objectContaining({perioder: expect.any(Array)}));
        expect(numberOfPeriods()).toEqual(numberOfPeriodsBefore + 1);
    });

    it('Sender inn søknad', () => {
        const ident = '123';
        const mappeid = 'abc';
        const submitSoknad = jest.fn();
        const punchForm = setupPunchForm({}, ident, mappeid, {submitSoknad});
        punchForm.find('.sendknapp-wrapper')
                 .find('Knapp')
                 .simulate('click');
        expect(submitSoknad).toHaveBeenCalledTimes(1);
        expect(submitSoknad).toHaveBeenCalledWith(mappeid, ident);
    });
});