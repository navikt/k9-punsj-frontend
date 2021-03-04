import {
    IPunchFormComponentProps,
    IPunchFormDispatchProps,
    IPunchFormStateProps,
    PunchFormComponent,
} from 'app/containers/pleiepenger/PunchForm';
import { JaNeiVetikke } from 'app/models/enums';
import {
    IMappe,
    IPleiepengerPunchState,
    IPunchFormState,
} from 'app/models/types';
import intlHelper from 'app/utils/intlUtils';
import { shallow } from 'enzyme';
import * as React from 'react';
import { createIntl, IntlShape, WrappedComponentProps } from 'react-intl';
import { mocked } from 'ts-jest/utils';
import {ISoknadV2} from "../../../app/models/types/Soknadv2";

jest.mock('react-intl');
jest.mock('react-router');
jest.mock('app/utils/envUtils');
jest.mock('app/utils/intlUtils');
jest.mock('app/utils/pathUtils');

const mappeid = 'abc';
const ident1 = '01015012345';
const ident2 = null;
const journalpostid = '200';

const setupPunchForm = (
    punchFormStateSetup?: Partial<IPunchFormState>,
    punchFormDispatchPropsSetup?: Partial<IPunchFormDispatchProps>
) => {
    const wrappedComponentProps: WrappedComponentProps = {
        intl: createIntl({ locale: 'nb', defaultLocale: 'nb' }),
    };

    const punchFormDispatchProps: IPunchFormDispatchProps = {
        setStepAction: jest.fn(),
        setIdentAction: jest.fn(),
        resetSoknadAction: jest.fn(),
        getSoknad: jest.fn(),
        resetPunchFormAction: jest.fn(),
        submitSoknad: jest.fn(),
        undoChoiceOfEksisterendeSoknadAction: jest.fn(),
        updateSoknad: jest.fn(),
        ...punchFormDispatchPropsSetup,
    };

    const punchState: IPleiepengerPunchState = {
        ident1,
        ident2,
        step: 3,
    };

    const punchFormState: IPunchFormState = {
        isSoknadLoading: false,
        ...punchFormStateSetup,
    };

    const punchFormStateProps: IPunchFormStateProps = {
        punchState,
        punchFormState,
    };

    const punchFormComponentProps: IPunchFormComponentProps = {
        getPunchPath: jest.fn(),
        journalpostid,
        id: mappeid,
    };

    mocked(intlHelper).mockImplementation(
        (intl: IntlShape, id: string, value?: { [key: string]: string }) => id
    );

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
        const getSoknad = jest.fn();
        setupPunchForm({}, { getSoknad });
        expect(getSoknad).toHaveBeenCalledTimes(1);
        expect(getSoknad).toHaveBeenCalledWith(mappeid);
    });

    it('Viser spinner når mappen lastes inn', () => {
        const punchForm = setupPunchForm({ isSoknadLoading: true });
        expect(punchForm.find('NavFrontendSpinner')).toHaveLength(1);
    });

    it('Viser feilmelding når mappen ikke er funnet', () => {
        const punchForm = setupPunchForm({ error: { status: 404 } });
        expect(punchForm.find('AlertStripeFeil')).toHaveLength(1);
        expect(punchForm.find('AlertStripeFeil').prop('children')).toEqual(
            'skjema.feil.ikke_funnet'
        );
    });

    it('Oppdaterer mappe når mottakelsesdato endres', () => {
        const updateSoknader = jest.fn();
        const newDato = '2020-02-11';
        const punchForm = setupPunchForm({}, { updateSoknader });
        punchForm
            .find('#soknad-dato')
            .simulate('blur', { target: { value: newDato } });
        expect(updateSoknader).toHaveBeenCalledTimes(1);
        const expectedUpdatedSoknad = expect.objectContaining({
            datoMottatt: newDato,
        });
        expect(updateSoknader).toHaveBeenCalledWith(
            mappeid,
            ident1,
            null,
            journalpostid,
            expectedUpdatedSoknad,
            null
        );
    });

    it('Oppdaterer felt når mottakelsesdato endres', () => {
        const newDato = '2020-02-11';
        const punchForm = setupPunchForm();
        punchForm
            .find('#soknad-dato')
            .simulate('change', { target: { value: newDato } });
        expect(punchForm.find('#soknad-dato').prop('value')).toEqual(newDato);
    });

    it('Oppdaterer mappe og felt når språk endres', () => {
        const updateSoknader = jest.fn();
        const newSprak = 'nn';
        const punchForm = setupPunchForm({}, { updateSoknader });
        const findSpraakSelect = () =>
            punchForm.find('Select[label="skjema.spraak"]');
        findSpraakSelect().simulate('change', { target: { value: newSprak } });
        expect(updateSoknader).toHaveBeenCalledTimes(1);
        expect(updateSoknader).toHaveBeenCalledWith(
            mappeid,
            ident1,
            ident2,
            journalpostid,
            expect.objectContaining({ spraak: newSprak }),
            null
        );
        expect(findSpraakSelect().prop('value')).toEqual(newSprak);
    });

    it('Oppdaterer mappe når barnets fødselsnummer endres', () => {
        const updateSoknader = jest.fn();
        const newIdent = '01012012345';
        const punchForm = setupPunchForm({}, { updateSoknader });
        punchForm
            .find('#barn-ident')
            .simulate('blur', { target: { value: newIdent } });
        expect(updateSoknader).toHaveBeenCalledTimes(1);
        const expectedUpdatedSoknad = expect.objectContaining({
            barn: expect.objectContaining({ norskIdent: newIdent }),
        });
        expect(updateSoknader).toHaveBeenCalledWith(
            mappeid,
            ident1,
            null,
            journalpostid,
            expectedUpdatedSoknad,
            null
        );
    });

    it('Oppdaterer felt når barnets fødselsnummer endres', () => {
        const newIdent = '01012012345';
        const punchForm = setupPunchForm();
        punchForm
            .find('#barn-ident')
            .simulate('change', { target: { value: newIdent } });
        expect(punchForm.find('#barn-ident').prop('value')).toEqual(newIdent);
    });

    it('Oppdaterer mappe når barnets fødselsdato endres', () => {
        const updateSoknader = jest.fn();
        const newFdato = '2020-01-01';
        const punchForm = setupPunchForm({}, { updateSoknader });
        punchForm
            .find('#barn-fdato')
            .simulate('blur', { target: { value: newFdato } });
        expect(updateSoknader).toHaveBeenCalledTimes(1);
        const expectedUpdatedSoknad = expect.objectContaining({
            barn: expect.objectContaining({ foedselsdato: newFdato }),
        });
        expect(updateSoknader).toHaveBeenCalledWith(
            mappeid,
            ident1,
            null,
            journalpostid,
            expectedUpdatedSoknad,
            null
        );
    });

    it('Oppdaterer felt når barnets fødselsdato endres', () => {
        const newFdato = '2020-01-01';
        const punchForm = setupPunchForm();
        punchForm
            .find('#barn-fdato')
            .simulate('change', { target: { value: newFdato } });
        expect(punchForm.find('#barn-fdato').prop('value')).toEqual(newFdato);
    });

    it('Viser radioknapper for tilsyn', () => {
        const punchForm = setupPunchForm();
        expect(punchForm.find('.tilsynsordning .horizontalRadios')).toHaveLength(1);
        expect(
            punchForm.find('.tilsynsordning .horizontalRadios').prop('radios')
        ).toHaveLength(3);
    });

    it('Viser perioder når tilsyn er satt til ja', () => {
        const soknad: ISoknadV2 = {
            personer: {
                '0101501234': {
                    soeknad: {
                        søknadId: '123',
                        tilsynsordning: {
                            iTilsynsordning: JaNeiVetikke.JA,
                            opphold: [{ periode: {} }],
                        },
                    },
                },
            },
        };
        const punchForm = setupPunchForm({ mappe });
        expect(
            punchForm.find('.tilsynsordning .horizontalRadios').prop('checked')
        ).toEqual(JaNeiVetikke.JA);
        expect(punchForm.find('.tilsynsordning Periodepaneler')).toHaveLength(1);
    });

    it('Viser ikke perioder når tilsyn er satt til nei', () => {
        const mappe: IMappe = {
            personer: {
                '0101501234': {
                    soeknad: {
                        søknadId: '123',
                        tilsynsordning: {
                            iTilsynsordning: JaNeiVetikke.NEI,
                            opphold: [{ periode: {} }],
                        },
                    },
                },
            },
        };
        const punchForm = setupPunchForm({ mappe });
        expect(
            punchForm.find('.tilsynsordning .horizontalRadios').prop('checked')
        ).toEqual(JaNeiVetikke.NEI);
        expect(punchForm.find('.tilsynsordning Periodepaneler')).toHaveLength(0);
    });

    it('Viser perioder når tilsyn er satt til vet ikke', () => {
        const soknad: ISoknadV2 = {
            personer: {
                '0101501234': {
                    soeknad: {
                        søknadId: '123',
                        tilsynsordning: {
                            iTilsynsordning: JaNeiVetikke.VET_IKKE,
                            opphold: [{ periode: {} }],
                        },
                    },
                },
            },
        };
        const punchForm = setupPunchForm({ soknad });
        expect(
            punchForm.find('.tilsynsordning .horizontalRadios').prop('checked')
        ).toEqual(JaNeiVetikke.VET_IKKE);
        expect(punchForm.find('.tilsynsordning Periodepaneler')).toHaveLength(1);
    });

    it('Viser beredskap og nattevåk når tilsyn er satt til ja', () => {
        const mappe: IMappe = {
            personer: {
                '0101501234': {
                    soeknad: {
                        søknadId: '123',
                        tilsynsordning: {
                            iTilsynsordning: JaNeiVetikke.JA,
                            opphold: [{ periode: {} }],
                        },
                    },
                },
            },
        };
        const punchForm = setupPunchForm({ mappe });
        expect(punchForm.find('.beredskapsperioder')).toHaveLength(1);
        expect(punchForm.find('.nattevaaksperioder')).toHaveLength(1);
    });

    it('Viser ikke beredskap eller nattevåk når tilsyn er satt til nei', () => {
        const soknad: ISoknadV2 = {
            soeknadId: '1',
            soekerId: '22',
            erFraK9: false,
            mottattDato: '',
            journalposter: [],
            sendtInn: false,
            barn: {
                norskIdent: '',
                foedselsdato: '',
            },
            arbeidAktivitet: {},
            arbeidstid: {},
            omsorg: {
                samtykketOmsorgForBarnet: false,
                beskrivelseAvOmsorgsrollen: '',
                relasjonTilBarnet: ''
            }
        };
        const punchForm = setupPunchForm({ soknad });
        expect(punchForm.find('.beredskapsperioder')).toHaveLength(0);
        expect(punchForm.find('.nattevaaksperioder')).toHaveLength(0);
    });

    it('Viser beredskap og nattevåk når tilsyn er satt til vet ikke', () => {
        const soknad: ISoknadV2 = {
            soeknadId: '',
            soekerId: '',
            erFraK9: false,
            mottattDato: '',
            journalposter: [],
            sendtInn: false,
            barn: {
                norskIdent: '',
                foedselsdato: '',
            },
            arbeidAktivitet: {},
            arbeidstid: {},

            omsorg: {
                samtykketOmsorgForBarnet: false,
                beskrivelseAvOmsorgsrollen: '',
                relasjonTilBarnet: ''
            },
        };
        const punchForm = setupPunchForm({ mappe });
        expect(punchForm.find('.beredskapsperioder')).toHaveLength(1);
        expect(punchForm.find('.nattevaaksperioder')).toHaveLength(1);
    });

    it('Oppdaterer mappe og felt når itilsynsordning endres', () => {
        const updateSoknader = jest.fn();
        const mappe: IMappe = {
            personer: {
                '0101501234': {
                    soeknad: {
                        søknadId: '123',
                        tilsynsordning: {
                            iTilsynsordning: JaNeiVetikke.NEI,
                            opphold: [],
                        },
                    },
                },
            },
        };
        const newITilsynsordning = JaNeiVetikke.JA;
        const punchForm = setupPunchForm({ mappe }, { updateSoknader });
        punchForm
            .find('.tilsynsordning .horizontalRadios')
            .simulate('change', { target: { value: newITilsynsordning } });
        expect(updateSoknader).toHaveBeenCalledTimes(1);
        const expectedUpdatedSoknad = expect.objectContaining({
            tilsynsordning: expect.objectContaining({
                iTilsynsordning: newITilsynsordning,
            }),
        });
        expect(updateSoknader).toHaveBeenCalledWith(
            mappeid,
            ident1,
            null,
            journalpostid,
            expectedUpdatedSoknad,
            null
        );
        expect(
            punchForm.find('.tilsynsordning .horizontalRadios').prop('checked')
        ).toEqual(newITilsynsordning);
    });

    it('Sender inn søknad', () => {
        const submitSoknad = jest.fn();
        const punchForm = setupPunchForm({}, { submitSoknad });
        punchForm.find('.sendknapp-wrapper').find('Knapp').simulate('click');
        expect(submitSoknad).toHaveBeenCalledTimes(1);
        expect(submitSoknad).toHaveBeenCalledWith(mappeid, ident1);
    });
});
