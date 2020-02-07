import {
    IPunchFormComponentProps,
    IPunchFormDispatchProps,
    IPunchFormStateProps,
    PunchFormComponent
}                                                           from 'app/containers/punch-page/PunchForm';
import {JaNeiVetikke}                                       from 'app/models/enums';
import {IJournalpost, IMappe, IPunchFormState, IPunchState} from 'app/models/types';
import intlHelper                                           from 'app/utils/intlUtils';
import {configure, shallow}                                 from 'enzyme';
import Adapter                                              from 'enzyme-adapter-react-16';
import * as React                                           from 'react';
import {createIntl, IntlShape, WrappedComponentProps}       from 'react-intl';
import {mocked}                                             from 'ts-jest/utils';

jest.mock('react-intl');
jest.mock('react-router');
jest.mock('app/utils/envUtils');
jest.mock('app/utils/intlUtils');
jest.mock('app/utils/pathUtils');

configure({adapter: new Adapter()});

const mappeid = 'abc';
const ident1 = '01015012345';
const ident2 = null;
const journalpostid = '200';

const setupPunchForm = (
    punchFormStateSetup?: Partial<IPunchFormState>,
    punchFormDispatchPropsSetup?: Partial<IPunchFormDispatchProps>
) => {

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
        updateSoknader: jest.fn(),
        ...punchFormDispatchPropsSetup
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
        expect(punchForm.find('h2')).toHaveLength(4);
    });

    it('Henter mappeinformasjon', () => {
        const getMappe = jest.fn();
        setupPunchForm({}, {getMappe});
        expect(getMappe).toHaveBeenCalledTimes(1);
        expect(getMappe).toHaveBeenCalledWith(mappeid);
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

    it('Oppdaterer mappe og felt når språk endres', () => {
        const updateSoknader = jest.fn();
        const newSprak = 'nn';
        const punchForm = setupPunchForm({}, {updateSoknader});
        const findSpraakSelect = () => punchForm.find('Select[label="skjema.spraak"]');
        findSpraakSelect().simulate('change', {target: {value: newSprak}});
        expect(updateSoknader).toHaveBeenCalledTimes(1);
        expect(updateSoknader).toHaveBeenCalledWith(mappeid, ident1, ident2, journalpostid, expect.objectContaining({spraak: newSprak}), null);
        expect(findSpraakSelect().prop('value')).toEqual(newSprak);
    });

    it('Oppdaterer mappe når barnets fødselsnummer endres', () => {
        const updateSoknader = jest.fn();
        const newIdent = '01012012345';
        const punchForm = setupPunchForm({}, {updateSoknader});
        punchForm.find('#barn-ident').simulate('blur', {target: {value: newIdent}});
        expect(updateSoknader).toHaveBeenCalledTimes(1);
        const expectedUpdatedSoknad = expect.objectContaining({barn: expect.objectContaining({norskIdent: newIdent})});
        expect(updateSoknader).toHaveBeenCalledWith(mappeid, ident1, null, journalpostid, expectedUpdatedSoknad, null);
    });

    it('Oppdaterer felt når barnets fødselsnummer endres', () => {
        const newIdent = '01012012345';
        const punchForm = setupPunchForm();
        punchForm.find('#barn-ident').simulate('change', {target: {value: newIdent}});
        expect(punchForm.find('#barn-ident').prop('value')).toEqual(newIdent);
    });

    it('Oppdaterer mappe når barnets fødselsdato endres', () => {
        const updateSoknader = jest.fn();
        const newFdato = '2020-01-01';
        const punchForm = setupPunchForm({}, {updateSoknader});
        punchForm.find('#barn-fdato').simulate('blur', {target: {value: newFdato}});
        expect(updateSoknader).toHaveBeenCalledTimes(1);
        const expectedUpdatedSoknad = expect.objectContaining({barn: expect.objectContaining({foedselsdato: newFdato})});
        expect(updateSoknader).toHaveBeenCalledWith(mappeid, ident1, null, journalpostid, expectedUpdatedSoknad, null);
    });

    it('Oppdaterer felt når barnets fødselsdato endres', () => {
        const newFdato = '2020-01-01';
        const punchForm = setupPunchForm();
        punchForm.find('#barn-fdato').simulate('change', {target: {value: newFdato}});
        expect(punchForm.find('#barn-fdato').prop('value')).toEqual(newFdato);
    });

    it('Viser radioknapper for tilsyn', () => {
        const punchForm = setupPunchForm();
        expect(punchForm.find('.tilsynsordning .horizontalRadios')).toHaveLength(1);
        expect(punchForm.find('.tilsynsordning .horizontalRadios').prop('radios')).toHaveLength(3);
    });

    it('Viser perioder når tilsyn er satt til ja', () => {
        const mappe: IMappe = {
            personer: {
                '0101501234': {
                    soeknad: {
                        tilsynsordning: {
                            iTilsynsordning: JaNeiVetikke.JA,
                            opphold: [{periode: {}}]
                        }
                    }
                }
            }
        };
        const punchForm = setupPunchForm({mappe});
        expect(punchForm.find('.tilsynsordning .horizontalRadios').prop('checked')).toEqual(JaNeiVetikke.JA);
        expect(punchForm.find('.tilsynsordning Periodepaneler')).toHaveLength(1);
    });

    it('Viser ikke perioder når tilsyn er satt til nei', () => {
        const mappe: IMappe = {
            personer: {
                '0101501234': {
                    soeknad: {
                        tilsynsordning: {
                            iTilsynsordning: JaNeiVetikke.NEI,
                            opphold: [{periode: {}}]
                        }
                    }
                }
            }
        };
        const punchForm = setupPunchForm({mappe});
        expect(punchForm.find('.tilsynsordning .horizontalRadios').prop('checked')).toEqual(JaNeiVetikke.NEI);
        expect(punchForm.find('.tilsynsordning Periodepaneler')).toHaveLength(0);
    });

    it('Viser perioder når tilsyn er satt til vet ikke', () => {
        const mappe: IMappe = {
            personer: {
                '0101501234': {
                    soeknad: {
                        tilsynsordning: {
                            iTilsynsordning: JaNeiVetikke.VET_IKKE,
                            opphold: [{periode: {}}]
                        }
                    }
                }
            }
        };
        const punchForm = setupPunchForm({mappe});
        expect(punchForm.find('.tilsynsordning .horizontalRadios').prop('checked')).toEqual(JaNeiVetikke.VET_IKKE);
        expect(punchForm.find('.tilsynsordning Periodepaneler')).toHaveLength(1);
    });

    it('Oppdaterer mappe og felt når itilsynsordning endres', () => {
        const updateSoknader = jest.fn();
        const mappe: IMappe = {
            personer: {
                '0101501234': {
                    soeknad: {
                        tilsynsordning: {
                            iTilsynsordning: JaNeiVetikke.NEI,
                            opphold: []
                        }
                    }
                }
            }
        };
        const newITilsynsordning = JaNeiVetikke.JA;
        const punchForm = setupPunchForm({mappe}, {updateSoknader});
        punchForm.find('.tilsynsordning .horizontalRadios').simulate('change', {target: {value: newITilsynsordning}});
        expect(updateSoknader).toHaveBeenCalledTimes(1);
        const expectedUpdatedSoknad = expect.objectContaining({tilsynsordning: expect.objectContaining({iTilsynsordning: newITilsynsordning})});
        expect(updateSoknader).toHaveBeenCalledWith(mappeid, ident1, null, journalpostid, expectedUpdatedSoknad, null);
        expect(punchForm.find('.tilsynsordning .horizontalRadios').prop('checked')).toEqual(newITilsynsordning);
    });

    it('Sender inn søknad', () => {
        const submitSoknad = jest.fn();
        const punchForm = setupPunchForm({}, {submitSoknad});
        punchForm.find('.sendknapp-wrapper')
                 .find('Knapp')
                 .simulate('click');
        expect(submitSoknad).toHaveBeenCalledTimes(1);
        expect(submitSoknad).toHaveBeenCalledWith(mappeid, ident1);
    });
});