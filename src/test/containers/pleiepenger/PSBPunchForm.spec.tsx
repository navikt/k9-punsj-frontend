import {
    IPunchFormComponentProps,
    IPunchFormDispatchProps,
    IPunchFormStateProps,
    PunchFormComponent,
} from 'app/containers/pleiepenger/PSBPunchForm';
import { IPSBSoknad, IPunchPSBFormState, ISignaturState } from 'app/models/types';
import intlHelper from 'app/utils/intlUtils';
import { shallow, ShallowWrapper } from 'enzyme';
import * as React from 'react';
import { createIntl, IntlShape, WrappedComponentProps } from 'react-intl';
import * as reactRedux from 'react-redux';
import { mocked } from 'jest-mock';
import OpplysningerOmSoknad from '../../../app/containers/pleiepenger/PSBPunchForm/OpplysningerOmSoknad/OpplysningerOmSoknad';
import { JaNeiIkkeRelevant } from '../../../app/models/enums/JaNeiIkkeRelevant';
import { IIdentState } from '../../../app/models/types/IdentState';
import { IJournalposterPerIdentState } from '../../../app/models/types/Journalpost/JournalposterPerIdentState';
import { IPSBSoknadKvittering } from '../../../app/models/types/PSBSoknadKvittering';

jest.mock('react-intl');
jest.mock('react-router');
jest.mock('app/utils/envUtils');
jest.mock('app/utils/intlUtils');
jest.mock('app/utils/pathUtils');

const soknadId = 'abc';
const ident1 = '01015012345';
const ident2 = '22082067856';
const journalpostid = '200';

const initialSoknad: IPSBSoknad = {
    arbeidstid: {
        arbeidstakerList: [],
        frilanserArbeidstidInfo: null,
        selvstendigNæringsdrivendeArbeidstidInfo: {},
    },
    barn: {
        foedselsdato: '',
        norskIdent: ident2,
    },
    beredskap: [],
    bosteder: [],
    harInfoSomIkkeKanPunsjes: false,
    harMedisinskeOpplysninger: false,
    journalposter: new Set([]),
    klokkeslett: '',
    lovbestemtFerie: [],
    mottattDato: '',
    nattevaak: [],
    omsorg: {},
    opptjeningAktivitet: {
        arbeidstaker: [],
        frilanser: null,
        selvstendigNaeringsdrivende: null,
    },
    soekerId: ident1,
    soeknadId: '123',
    soeknadsperiode: null,
    soknadsinfo: {
        harMedsøker: null,
        samtidigHjemme: null,
    },
    tilsynsordning: {},
    utenlandsopphold: [],
    uttak: [],
};

const validertSoknad: IPSBSoknadKvittering = {
    journalposter: [],
    mottattDato: '',
    ytelse: {
        type: '',
        barn: {
            norskIdentitetsnummer: '',
            fødselsdato: null,
        },
        søknadsperiode: [],
        bosteder: { perioder: {} },
        utenlandsopphold: { perioder: {} },
        beredskap: { perioder: {} },
        nattevåk: { perioder: {} },
        tilsynsordning: { perioder: {} },
        lovbestemtFerie: { perioder: {} },
        arbeidstid: {
            arbeidstakerList: [
                {
                    norskIdentitetsnummer: null,
                    organisasjonsnummer: '',
                    arbeidstidInfo: { perioder: {} },
                },
            ],
            frilanserArbeidstidInfo: null,
            selvstendigNæringsdrivendeArbeidstidInfo: null,
        },
        uttak: { perioder: {} },
        omsorg: {
            relasjonTilBarnet: null,
            beskrivelseAvOmsorgsrollen: null,
        },
        opptjeningAktivitet: {},
        trekkKravPerioder: ['2021-06-01/2021-06-30'],
    },
};

const setupPunchForm = (
    punchFormStateSetup?: Partial<IPunchPSBFormState>,
    punchFormDispatchPropsSetup?: Partial<IPunchFormDispatchProps>
) => {
    const wrappedComponentProps: WrappedComponentProps = {
        intl: createIntl({ locale: 'nb', defaultLocale: 'nb' }),
    };

    const punchFormDispatchProps: IPunchFormDispatchProps = {
        getSoknad: jest.fn(),
        hentPerioder: jest.fn(),
        resetSoknadAction: jest.fn(),
        setStepAction: jest.fn(),
        setIdentAction: jest.fn(),
        resetPunchFormAction: jest.fn(),
        submitSoknad: jest.fn(),
        undoChoiceOfEksisterendeSoknadAction: jest.fn(),
        updateSoknad: jest.fn(),
        setSignaturAction: jest.fn(),
        settJournalpostPaaVent: jest.fn(),
        settPaaventResetAction: jest.fn(),
        validateSoknad: jest.fn(),
        validerSoknadReset: jest.fn(),
        ...punchFormDispatchPropsSetup,
    };

    const punchFormState: IPunchPSBFormState = {
        isSoknadLoading: false,
        ...punchFormStateSetup,
    };

    const identState: IIdentState = {
        ident1: '122345',
        ident2: '678908',
        annenSokerIdent: null,
    };

    const signaturState: ISignaturState = {
        isAwaitingUsignertRequestResponse: false,
        signert: JaNeiIkkeRelevant.IKKE_RELEVANT,
    };

    const journalposterState: IJournalposterPerIdentState = {
        journalposter: [
            {
                journalpostId: '200',
                dato: '2020-12-05',
                dokumenter: [
                    {
                        dokument_id: '587553',
                    },
                ],
                klokkeslett: '12:56',
                punsjInnsendingType: {
                    kode: 'PAPIRSØKNAD',
                    navn: 'Papirsøknad',
                    erScanning: false,
                },
            },
        ],
    };

    const punchFormStateProps: IPunchFormStateProps = {
        punchFormState,
        identState,
        signaturState,
        journalposterState,
    };

    const punchFormComponentProps: IPunchFormComponentProps = {
        getPunchPath: jest.fn(),
        journalpostid,
        id: soknadId,
    };

    mocked(intlHelper).mockImplementation((intl: IntlShape, id: string, value?: { [key: string]: string }) => id);

    return shallow(
        /* eslint-disable react/jsx-props-no-spreading */
        <PunchFormComponent
            {...punchFormComponentProps}
            {...wrappedComponentProps}
            {...punchFormStateProps}
            {...punchFormDispatchProps}
            /* eslint-enable react/jsx-props-no-spreading */
        />
    );
};

const getDateInputField = (punchFormComponent: ShallowWrapper, containerComponent: string, fieldId: string) =>
    punchFormComponent
        .find(containerComponent)
        .shallow()
        .findWhere((n) => n.name() === 'DateInput' && n.prop('id') === fieldId)
        .at(0)
        .shallow()
        .find('Datepicker')
        .dive()
        .find(`#${fieldId}`)
        .dive();

describe('PunchForm', () => {
    const useSelectorMock = jest.spyOn(reactRedux, 'useSelector');
    beforeEach(() => {
        useSelectorMock.mockClear();
    });

    it('Viser skjema', () => {
        const punchForm = setupPunchForm();
        expect(punchForm.find('EkspanderbartpanelBase')).toHaveLength(6);
        expect(punchForm.find('ArbeidsforholdPanel')).toHaveLength(1);
    });

    it('Henter søknadsinformasjon', () => {
        const getSoknad = jest.fn();
        setupPunchForm({}, { getSoknad });
        expect(getSoknad).toHaveBeenCalledTimes(1);
        expect(getSoknad).toHaveBeenCalledWith(soknadId);
    });

    it('Viser spinner når søknaden lastes inn', () => {
        const punchForm = setupPunchForm({ isSoknadLoading: true });
        expect(punchForm.find('NavFrontendSpinner')).toHaveLength(1);
    });

    it('Viser feilmelding når søknaden ikke er funnet', () => {
        const punchForm = setupPunchForm({ error: { status: 404 } });
        expect(punchForm.find('ForwardRef')).toHaveLength(1);
        expect(punchForm.find('ForwardRef').prop('children')).toEqual('skjema.feil.ikke_funnet');
    });

    it('Oppdaterer søknad når mottakelsesdato endres', () => {
        const updateSoknad = jest.fn();
        const newDato = '2020-02-11';
        const punchForm = setupPunchForm({ soknad: initialSoknad }, { updateSoknad });
        const inputField = getDateInputField(punchForm, 'OpplysningerOmSoknad', 'soknad-dato');
        inputField.simulate('blur', { target: { value: newDato } });
        expect(updateSoknad).toHaveBeenCalledTimes(1);
        const expectedUpdatedSoknad = expect.objectContaining({
            mottattDato: newDato,
        });
        expect(updateSoknad).toHaveBeenCalledWith(expectedUpdatedSoknad);
    });

    it('Oppdaterer felt når mottakelsesdato endres', () => {
        const newDato = '2020-02-11';
        const punchForm = setupPunchForm({ soknad: initialSoknad });
        const inputField = getDateInputField(punchForm, 'OpplysningerOmSoknad', 'soknad-dato');
        inputField.simulate('change', { target: { value: newDato } });
        expect(inputField.prop('value')).toEqual(newDato);
    });

    it('Viser dato for å legge til søknadsperiode når det ikke finnes en søknadsperiode fra før', () => {
        const punchForm = setupPunchForm({ soknad: initialSoknad }, {});
        useSelectorMock.mockReturnValue({});
        expect(punchForm.find('Soknadsperioder').dive().find('Periodepaneler')).toHaveLength(1);
    });

    it('Skjuler knapp for å legge til søknadsperiode når det finnes en søknadsperiode fra før', () => {
        const soknad = { ...initialSoknad, soeknadsperiode: [{ fom: '', tom: '' }] };
        const punchForm = setupPunchForm({ soknad }, {});
        expect(punchForm.find('.leggtilsoknadsperiode')).toHaveLength(0);
    });

    it('Viser checkboks for tilsyn', () => {
        const punchForm = setupPunchForm();
        expect(punchForm.find('.tilsynsordning CheckboksPanel')).toHaveLength(1);
    });

    it('Viser perioder når tilsyn er registrert', () => {
        const soknad = {
            ...initialSoknad,
            tilsynsordning: {
                perioder: [
                    {
                        periode: {
                            fom: '2020-12-06',
                            tom: '2021-01-15',
                        },
                        timer: 5,
                        minutter: 0,
                    },
                ],
            },
        };

        const punchForm = setupPunchForm({ soknad });
        expect(punchForm.find('.tilsynsordning CheckboksPanel').prop('checked')).toBeTruthy();
        expect(punchForm.find('.tilsynsordning PeriodeinfoPaneler')).toHaveLength(1);
    });

    it('Viser ikke perioder når tilsyn er undefined', () => {
        const punchForm = setupPunchForm({ soknad: initialSoknad });
        expect(punchForm.find('.tilsynsordning CheckboksPanel').prop('checked')).toEqual(false);
        expect(punchForm.find('.tilsynsordning PeriodeinfoPaneler')).toHaveLength(0);
    });

    it('Viser beredskap og nattevåk når det er registrert fra før', () => {
        const soknad: IPSBSoknad = {
            ...initialSoknad,
            beredskap: [
                {
                    periode: {
                        fom: '2021-02-13',
                        tom: '2021-03-16',
                    },
                    tilleggsinformasjon: 'Dette er tillegsinformasjon',
                },
            ],
            nattevaak: [
                {
                    periode: {
                        fom: '2021-04-01',
                        tom: '2021-04-23',
                    },
                    tilleggsinformasjon: 'Dette er tillegsinformasjon',
                },
            ],
        };
        const punchForm = setupPunchForm({ soknad });
        expect(punchForm.find('.beredskapsperioder')).toHaveLength(1);
        expect(punchForm.find('.nattevaaksperioder')).toHaveLength(1);
    });

    it('Viser ikke beredskap eller nattevåk hvis undefined', () => {
        const punchForm = setupPunchForm({ soknad: initialSoknad });
        expect(punchForm.find('.beredskapsperioder')).toHaveLength(0);
        expect(punchForm.find('.nattevaaksperioder')).toHaveLength(0);
    });

    it('Oppdaterer søknad og felt når tilsynsordning endres', () => {
        const updateSoknad = jest.fn();
        const punchForm = setupPunchForm({ soknad: initialSoknad }, { updateSoknad });
        punchForm.find('.tilsynsordning CheckboksPanel').simulate('change', { target: { checked: true } });
        expect(updateSoknad).toHaveBeenCalledTimes(1);
        const expectedUpdatedSoknad = expect.objectContaining({
            tilsynsordning: expect.objectContaining({
                perioder: [
                    {
                        periode: { fom: '', tom: '' },
                        timer: 0,
                        minutter: 0,
                    },
                ],
            }),
        });
        expect(updateSoknad).toHaveBeenCalledWith(expectedUpdatedSoknad);
        expect(punchForm.find('.tilsynsordning CheckboksPanel').prop('checked')).toBeTruthy();
    });

    it('Validerer søknad når saksbehandler trykker på "Send inn"', () => {
        const validateSoknad = jest.fn();
        const punchForm = setupPunchForm({ soknad: initialSoknad }, { validateSoknad });
        punchForm.find('.submit-knapper').find('.sendknapp-wrapper').find('.send-knapp').simulate('click');
        expect(validateSoknad).toHaveBeenCalledTimes(1);
    });

    it('Viser melding om valideringsfeil', () => {
        const validateSoknad = jest.fn();
        const punchForm = setupPunchForm(
            {
                soknad: initialSoknad,
                inputErrors: [
                    {
                        felt: 'lovbestemtFerie',
                        feilkode: 'ugyldigPreiode',
                        feilmelding: 'Periode er utenfor søknadsperioden',
                    },
                ],
            },
            { validateSoknad }
        );
        punchForm.find('.submit-knapper').find('.sendknapp-wrapper').find('.send-knapp').simulate('click');
        expect(validateSoknad).toHaveBeenCalledTimes(1);
        expect(punchForm.find('ForwardRef')).toHaveLength(1);
        expect(punchForm.find('ForwardRef').childAt(0).text()).toEqual('skjema.feil.validering');
    });

    it('Viser modal når saksbehandler trykker på "Send inn" og det er ingen valideringsfeil', () => {
        const validateSoknad = jest.fn();
        const punchForm = setupPunchForm({ soknad: initialSoknad, validertSoknad, isValid: true }, { validateSoknad });
        punchForm.find('.submit-knapper').find('.sendknapp-wrapper').find('.send-knapp').simulate('click');
        expect(validateSoknad).toHaveBeenCalledTimes(1);
        expect(punchForm.find('.validertSoknadModal')).toHaveLength(1);
        punchForm
            .find('.validertSoknadOppsummeringContainerKnapper')
            .find('.validertSoknadOppsummeringContainer_knappVidere')
            .simulate('click');
        expect(punchForm.find('.erdusikkermodal')).toHaveLength(1);
    });

    it('Viser modal når saksbehandler trykker på "Sett på vent" og det er ingen valideringsfeil', () => {
        const validateSoknad = jest.fn();
        const punchForm = setupPunchForm({ soknad: initialSoknad }, { validateSoknad });
        punchForm.find('.submit-knapper').find('.sendknapp-wrapper').find('.vent-knapp').simulate('click');
        expect(punchForm.find('.settpaaventmodal')).toHaveLength(1);
    });

    it('Viser advarsel om overlappende periode', () => {
        const soknad = {
            ...initialSoknad,
            soeknadsperiode: [{ fom: '2021-02-23', tom: '2021-08-23' }],
        };
        const punchForm = setupPunchForm({ soknad, perioder: [{ fom: '2021-01-30', tom: '2021-04-15' }] }, {});
        useSelectorMock.mockReturnValue({
            soknad,
            perioder: [{ fom: '2021-01-30', tom: '2021-04-15' }],
        });
        expect(
            punchForm.find('Soknadsperioder').dive().find('.eksiterendesoknaderpanel').find('AlertStripeAdvarsel')
        ).toHaveLength(1);
        expect(
            punchForm
                .find('Soknadsperioder')
                .dive()
                .find('.eksiterendesoknaderpanel')
                .find('AlertStripeAdvarsel')
                .childAt(0)
                .text()
        ).toEqual('skjema.soknadsperiode.overlapper');
    });

    it('Viser legg till ferie', () => {
        const soknad = { ...initialSoknad };
        const punchForm = setupPunchForm({ soknad }, {});

        expect(punchForm.find('.feriepanel').find('CheckboksPanel').length).toEqual(1);
        expect(punchForm.find('.feriepanel').find('CheckboksPanel').prop('label')).toEqual('skjema.ferie.leggtil');
    });

    it('Viser legg till ferie og slettade perioder dersom det finns periode', () => {
        const soknad = { ...initialSoknad };
        const punchForm = setupPunchForm({ soknad, perioder: [{ fom: '2021-01-30', tom: '2021-04-15' }] }, {});

        expect(punchForm.find('.feriepanel').find('CheckboksPanel').length).toEqual(2);
        expect(punchForm.find('.feriepanel').find('CheckboksPanel').at(0).prop('label')).toEqual(
            'skjema.ferie.leggtil'
        );
        expect(punchForm.find('.feriepanel').find('CheckboksPanel').at(1).prop('label')).toEqual('skjema.ferie.fjern');
    });

    it('Viser ferieperioder dersom det finnes', () => {
        const soknad = {
            ...initialSoknad,
            lovbestemtFerie: [{ fom: '2021-01-30', tom: '2021-04-15' }],
        };
        const punchForm = setupPunchForm({ soknad, perioder: [{ fom: '2021-01-30', tom: '2021-04-15' }] }, {});

        expect(punchForm.find('.feriepanel').dive().find('Periodepaneler').at(0).prop('periods')).toEqual([
            { fom: '2021-01-30', tom: '2021-04-15' },
        ]);
    });

    it('Viser slettade ferieperioder dersom det finnes', () => {
        const soknad = {
            ...initialSoknad,
            lovbestemtFerieSomSkalSlettes: [{ fom: '2021-01-30', tom: '2021-04-15' }],
        };
        const punchForm = setupPunchForm({ soknad, perioder: [{ fom: '2021-01-30', tom: '2021-04-15' }] }, {});

        expect(punchForm.find('.feriepanel').dive().find('Periodepaneler').prop('periods')).toEqual([
            { fom: '2021-01-30', tom: '2021-04-15' },
        ]);
        expect(
            punchForm.find('.feriepanel').dive().find('.ekspanderbartPanel__innhold').find('AlertStripeInfo')
        ).toHaveLength(1);
    });

    it('Viser advarsel om att arbeidstid må angis vid slettade perioder', () => {
        const soknad = {
            ...initialSoknad,
            lovbestemtFerieSomSkalSlettes: [{ fom: '2021-01-30', tom: '2021-04-15' }],
        };
        const punchForm = setupPunchForm({ soknad, perioder: [{ fom: '2021-01-30', tom: '2021-04-15' }] }, {});

        expect(punchForm.find('ForwardRef')).toHaveLength(1);
        expect(punchForm.find('.send-knapp').prop('disabled')).toEqual(true);
        expect(punchForm.find('.vent-knapp').prop('disabled')).toEqual(true);
    });

    it('Viser ikke advarsel om att arbeidstid må angis vid slettade perioder når arbeidstid er angivet for arbeidstaker', () => {
        const soknad = {
            ...initialSoknad,
            ...{
                lovbestemtFerieSomSkalSlettes: [{ fom: '2021-01-30', tom: '2021-04-15' }],
                arbeidstid: {
                    arbeidstakerList: [
                        {
                            norskIdentitetsnummer: null,
                            organisasjonsnummer: '',
                            arbeidstidInfo: {
                                perioder: [
                                    {
                                        periode: {
                                            fom: '2021-01-30',
                                            tom: '2021-04-15',
                                        },
                                        faktiskArbeidTimerPerDag: '8',
                                        jobberNormaltTimerPerDag: '8',
                                    },
                                ],
                            },
                        },
                    ],
                },
            },
        };
        const punchForm = setupPunchForm({ soknad, perioder: [{ fom: '2021-01-30', tom: '2021-04-15' }] }, {});

        expect(punchForm.find('ForwardRef')).toHaveLength(0);
        expect(punchForm.find('.send-knapp').prop('disabled')).toEqual(false);
        expect(punchForm.find('.vent-knapp').prop('disabled')).toEqual(false);
    });

    it('Viser ikke advarsel om att arbeidstid må angis vid slettade perioder når arbeidstid er angivet for FL', () => {
        const soknad = {
            ...initialSoknad,
            ...{
                lovbestemtFerieSomSkalSlettes: [{ fom: '2021-01-30', tom: '2021-04-15' }],
                arbeidstid: {
                    frilanserArbeidstidInfo: {
                        perioder: [
                            {
                                periode: {
                                    fom: '2021-09-01',
                                    tom: '2021-09-30',
                                },
                                faktiskArbeidTimerPerDag: '8',
                                jobberNormaltTimerPerDag: '8',
                            },
                        ],
                    },
                },
            },
        };
        const punchForm = setupPunchForm({ soknad, perioder: [{ fom: '2021-01-30', tom: '2021-04-15' }] }, {});

        expect(punchForm.find('ForwardRef')).toHaveLength(0);
        expect(punchForm.find('.send-knapp').prop('disabled')).toEqual(false);
        expect(punchForm.find('.vent-knapp').prop('disabled')).toEqual(false);
    });

    it('Viser ikke advarsel om att arbeidstid må angis vid slettade perioder når arbeidstid er angivet for SN', () => {
        const soknad = {
            ...initialSoknad,
            ...{
                lovbestemtFerieSomSkalSlettes: [{ fom: '2021-01-30', tom: '2021-04-15' }],
                arbeidstid: {
                    selvstendigNæringsdrivendeArbeidstidInfo: {
                        perioder: [
                            {
                                periode: {
                                    fom: '2021-09-01',
                                    tom: '2021-09-30',
                                },
                                faktiskArbeidTimerPerDag: '8',
                                jobberNormaltTimerPerDag: '8',
                            },
                        ],
                    },
                },
            },
        };
        const punchForm = setupPunchForm({ soknad, perioder: [{ fom: '2021-01-30', tom: '2021-04-15' }] }, {});

        expect(punchForm.find('ForwardRef')).toHaveLength(0);
        expect(punchForm.find('.send-knapp').prop('disabled')).toEqual(false);
        expect(punchForm.find('.vent-knapp').prop('disabled')).toEqual(false);
    });

    it('Viser ikke advarsel om overlappende periode når periodene ikke overlapper', () => {
        const soknad = {
            ...initialSoknad,
            soeknadsperiode: [{ fom: '2021-02-23', tom: '2021-08-23' }],
        };
        const punchForm = setupPunchForm({ soknad, perioder: [{ fom: '2021-08-30', tom: '2021-09-15' }] }, {});
        useSelectorMock.mockReturnValue({
            soknad,
            perioder: [{ fom: '2021-08-30', tom: '2021-09-15' }],
        });
        expect(
            punchForm.find('Soknadsperioder').dive().find('.eksiterendesoknaderpanel').find('AlertStripeAdvarsel')
        ).toHaveLength(0);
    });

    it('Oppdaterer staten og søknaden riktig ved klikk på checkbox ', () => {
        const updateSoknad = jest.fn();
        const punchForm = setupPunchForm({ soknad: initialSoknad }, { updateSoknad });
        const checkbox = punchForm.find('#opplysningerikkepunsjetcheckbox');
        checkbox.simulate('change', { target: { checked: true } });
        expect(updateSoknad).toHaveBeenCalledTimes(1);
        const expectedUpdatedSoknad = expect.objectContaining({
            harInfoSomIkkeKanPunsjes: true,
        });
        expect(updateSoknad).toHaveBeenCalledWith(expectedUpdatedSoknad);
        expect(punchForm.find('#opplysningerikkepunsjetcheckbox').prop('checked')).toBeTruthy();
        checkbox.simulate('change', { target: { checked: false } });
        expect(updateSoknad).toHaveBeenCalledTimes(2);
        const expectedUpdatedSoknad2 = expect.objectContaining({
            harInfoSomIkkeKanPunsjes: false,
        });
        expect(updateSoknad).toHaveBeenCalledWith(expectedUpdatedSoknad2);
        expect(checkbox.prop('checked')).toBeFalsy();
    });
});
