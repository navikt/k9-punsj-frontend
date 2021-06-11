import {
    IPunchFormComponentProps,
    IPunchFormDispatchProps,
    IPunchFormStateProps,
    PunchFormComponent,
} from 'app/containers/pleiepenger/PSBPunchForm';
import {IPSBSoknad, IPunchFormState, ISignaturState} from 'app/models/types';
import intlHelper from 'app/utils/intlUtils';
import {shallow} from 'enzyme';
import * as React from 'react';
import {createIntl, IntlShape, WrappedComponentProps} from 'react-intl';
import {mocked} from 'ts-jest/utils';
import {IIdentState} from "../../../app/models/types/IdentState";
import {JaNeiIkkeRelevant} from "../../../app/models/enums/JaNeiIkkeRelevant";
import {IJournalposterPerIdentState} from "../../../app/models/types/JournalposterPerIdentState";
import {JaNeiIkkeOpplyst} from "../../../app/models/enums/JaNeiIkkeOpplyst";

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
        selvstendigNæringsdrivendeArbeidstidInfo: {}
    },
    barn: {
        foedselsdato: '',
        norskIdent: ident2
    },
    beredskap: [],
    bosteder: [],
    erFraK9: false,
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
        selvstendigNaeringsdrivende: null
    },
    sendtInn: false,
    soekerId: ident1,
    soeknadId: "123",
    soeknadsperiode: null,
    soknadsinfo: {
        harMedsøker: null,
        samtidigHjemme: null
    },
    tilsynsordning: {},
    utenlandsopphold: [],
    uttak: []
}


const setupPunchForm = (
    punchFormStateSetup?: Partial<IPunchFormState>,
    punchFormDispatchPropsSetup?: Partial<IPunchFormDispatchProps>
) => {
    const wrappedComponentProps: WrappedComponentProps = {
        intl: createIntl({locale: 'nb', defaultLocale: 'nb'}),
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


    const punchFormState: IPunchFormState = {
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
        signert: JaNeiIkkeRelevant.IKKE_RELEVANT
    };

    const journalposterState: IJournalposterPerIdentState = {
        journalposter: [{
            journalpostId: '200',
            dato: '2020-12-05',
            dokumenter: [{
                dokument_id: '587553'
            }],
            klokkeslett: '12:56',
            punsjInnsendingType: {
                kode: 'PAPIRSØKNAD',
                navn: 'Papirsøknad',
                erScanning: false,
            }
        }]
    };

    const punchFormStateProps: IPunchFormStateProps = {
        punchFormState,
        identState,
        signaturState,
        journalposterState

    };

    const punchFormComponentProps: IPunchFormComponentProps = {
        getPunchPath: jest.fn(),
        journalpostid,
        id: soknadId,
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
        expect(punchForm.find('EkspanderbartpanelBase')).toHaveLength(8);
    });

    it('Henter søknadsinformasjon', () => {
        const getSoknad = jest.fn();
        setupPunchForm({}, {getSoknad});
        expect(getSoknad).toHaveBeenCalledTimes(1);
        expect(getSoknad).toHaveBeenCalledWith(soknadId);
    });

    it('Viser spinner når søknaden lastes inn', () => {
        const punchForm = setupPunchForm({isSoknadLoading: true});
        expect(punchForm.find('NavFrontendSpinner')).toHaveLength(1);
    });

    it('Viser feilmelding når søknaden ikke er funnet', () => {
        const punchForm = setupPunchForm({error: {status: 404}});
        expect(punchForm.find('AlertStripeFeil')).toHaveLength(1);
        expect(punchForm.find('AlertStripeFeil').prop('children')).toEqual(
            'skjema.feil.ikke_funnet'
        );
    });

    it('Oppdaterer søknad når mottakelsesdato endres', () => {
        const updateSoknad = jest.fn();
        const newDato = '2020-02-11';
        const punchForm = setupPunchForm({soknad: initialSoknad}, {updateSoknad});
        punchForm
            .find('#soknad-dato')
            .simulate('blur', {target: {value: newDato}});
        expect(updateSoknad).toHaveBeenCalledTimes(1);
        const expectedUpdatedSoknad = expect.objectContaining({
            mottattDato: newDato,
        });
        expect(updateSoknad).toHaveBeenCalledWith(
            expectedUpdatedSoknad,
        );
    });

    it('Oppdaterer felt når mottakelsesdato endres', () => {
        const newDato = '2020-02-11';
        const punchForm = setupPunchForm({soknad: initialSoknad});
        punchForm
            .find('#soknad-dato')
            .simulate('change', {target: {value: newDato}});
        expect(punchForm.find('#soknad-dato').prop('value')).toEqual(newDato);
    });

    it('Viser knapp for å legge til søknadsperiode når det ikke finnes en søknadsperiode fra før', () => {
        const punchForm = setupPunchForm({soknad: initialSoknad}, {});
        expect(punchForm.find('.leggtilsoknadsperiode')).toHaveLength(1);
    });

    it('Skuler knapp for å legge til søknadsperiode når det finnes en søknadsperiode fra før', () => {
        const soknad = { ...initialSoknad, soeknadsperiode: { fom: '', tom: ''}}
        const punchForm = setupPunchForm({soknad}, {});
        expect(punchForm.find('.leggtilsoknadsperiode')).toHaveLength(0);
    });

    it('Oppdaterer søknad når fra-dato på søknadsperioden endres', () => {
        const soknad = { ...initialSoknad, soeknadsperiode: { fom: '', tom: ''}}
        const updateSoknad = jest.fn();
        const newDato = '2020-02-11';
        const punchForm = setupPunchForm({soknad}, {updateSoknad});
        punchForm
            .find('#soknadsperiode-fra')
            .simulate('blur', {target: {value: newDato}});
        expect(updateSoknad).toHaveBeenCalledTimes(1);
        const expectedUpdatedSoknad = expect.objectContaining({
            soeknadsperiode: expect.objectContaining({fom: newDato, tom: ''}),
        });
        expect(updateSoknad).toHaveBeenCalledWith(expectedUpdatedSoknad);
    });

    it('Oppdaterer felt når fra-dato på søknadsperioden endres', () => {
        const soknad = { ...initialSoknad, soeknadsperiode: { fom: '', tom: ''}}
        const newDato = '2020-02-11';
        const punchForm = setupPunchForm({soknad});
        punchForm
            .find('#soknadsperiode-fra')
            .simulate('change', {target: {value: newDato}});
        expect(punchForm.find('#soknadsperiode-fra').prop('value')).toEqual(newDato);
    });

    it('Oppdaterer søknad når til-dato på søknadsperioden endres', () => {
        const soknad = { ...initialSoknad, soeknadsperiode: { fom: '', tom: ''}}
        const updateSoknad = jest.fn();
        const newDato = '2020-01-01';
        const punchForm = setupPunchForm({soknad}, {updateSoknad});
        punchForm
            .find('#soknadsperiode-til')
            .simulate('blur', {target: {value: newDato}});
        expect(updateSoknad).toHaveBeenCalledTimes(1);
        const expectedUpdatedSoknad = expect.objectContaining({
            soeknadsperiode: expect.objectContaining({fom: '', tom: newDato}),
        });
        expect(updateSoknad).toHaveBeenCalledWith(expectedUpdatedSoknad);
    });

    it('Oppdaterer felt når til-dato på søknadsperioden endres', () => {
        const soknad = { ...initialSoknad, soeknadsperiode: { fom: '', tom: ''}}
        const newDato = '2020-01-01';
        const punchForm = setupPunchForm({soknad});
        punchForm
            .find('#soknadsperiode-til')
            .simulate('change', {target: {value: newDato}});
        expect(punchForm.find('#soknadsperiode-til').prop('value')).toEqual(newDato);
    });

    it('Viser radioknapper for tilsyn', () => {
        const punchForm = setupPunchForm();
        expect(punchForm.find('.tilsynsordning .horizontalRadios')).toHaveLength(1);
        expect(
            punchForm.find('.tilsynsordning .horizontalRadios').prop('radios')
        ).toHaveLength(3);
    });

    it('Viser perioder når tilsyn er registrert', () => {
        const soknad = {...initialSoknad, tilsynsordning: {
                perioder: [
                    {
                        periode: {
                            fom: '2020-12-06',
                            tom: '2021-01-15'
                        },
                        timer: 5,
                        minutter: 0
                    }
                ]
            }}

        const punchForm = setupPunchForm({soknad});
        expect(
            punchForm.find('.tilsynsordning .horizontalRadios').prop('checked')
        ).toEqual(JaNeiIkkeOpplyst.JA);
        expect(punchForm.find('.tilsynsordning PeriodeinfoPaneler')).toHaveLength(1);
    });

    it('Viser ikke perioder når tilsyn er undefined', () => {
        const punchForm = setupPunchForm({soknad: initialSoknad});
        expect(
            punchForm.find('.tilsynsordning .horizontalRadios').prop('checked')
        ).toEqual(undefined);
        expect(punchForm.find('.tilsynsordning PeriodeinfoPaneler')).toHaveLength(0);
    });

    it('Viser beredskap og nattevåk når det er registrert fra før', () => {
        const soknad: IPSBSoknad = {
            ...initialSoknad,
            beredskap: [{
                periode: {
                    fom: '2021-02-13',
                    tom: '2021-03-16'
                },
                tilleggsinformasjon: 'Dette er tillegsinformasjon'
            }],
            nattevaak: [{
                periode: {
                    fom: '2021-04-01',
                    tom: '2021-04-23'
                },
                tilleggsinformasjon: 'Dette er tillegsinformasjon'
            }]
        }
        const punchForm = setupPunchForm({soknad});
        expect(punchForm.find('.beredskapsperioder')).toHaveLength(1);
        expect(punchForm.find('.nattevaaksperioder')).toHaveLength(1);
    });

    it('Viser ikke beredskap eller nattevåk hvis undefined', () => {
        const punchForm = setupPunchForm({soknad: initialSoknad});
        expect(punchForm.find('.beredskapsperioder')).toHaveLength(0);
        expect(punchForm.find('.nattevaaksperioder')).toHaveLength(0);
    });


    it('Oppdaterer søknad og felt når itilsynsordning endres', () => {
        const updateSoknad = jest.fn();
        const punchForm = setupPunchForm({soknad: initialSoknad}, {updateSoknad});
        punchForm
            .find('.tilsynsordning .horizontalRadios')
            .simulate('change', {target: {value: JaNeiIkkeOpplyst.JA}});
        expect(updateSoknad).toHaveBeenCalledTimes(1);
        const expectedUpdatedSoknad = expect.objectContaining({
            tilsynsordning: expect.objectContaining({
                perioder: [
                    {
                        periode: {},
                        timer: 0,
                        minutter: 0
                    }
                ]
            }),
        });
        expect(updateSoknad).toHaveBeenCalledWith(
            expectedUpdatedSoknad
        );
        expect(
            punchForm.find('.tilsynsordning .horizontalRadios').prop('checked')
        ).toEqual(JaNeiIkkeOpplyst.JA);
    });

    it('Validerer søknad når saksbehandler trykker på "Send inn"', () => {
        const validateSoknad = jest.fn();
        const punchForm = setupPunchForm({soknad: initialSoknad}, {validateSoknad});
        punchForm.find('.submit-knapper').find('.sendknapp-wrapper').find('.send-knapp').simulate('click');
        expect(validateSoknad).toHaveBeenCalledTimes(1);
        expect(validateSoknad).toHaveBeenCalledWith(ident1, soknadId);
    });

    it('Viser melding om valideringsfeil', () => {
        const validateSoknad = jest.fn();
        const punchForm = setupPunchForm({soknad: initialSoknad, inputErrors: [{felt: 'lovbestemtFerie', feilkode: 'ugyldigPreiode', feilmelding: 'Periode er utenfor søknadsperioden'}]}, {validateSoknad});
        punchForm.find('.submit-knapper').find('.sendknapp-wrapper').find('.send-knapp').simulate('click');
        expect(validateSoknad).toHaveBeenCalledTimes(1);
        expect(validateSoknad).toHaveBeenCalledWith(ident1, soknadId);
        expect(punchForm.find('.valideringstripefeil')).toHaveLength(1);
        expect(punchForm.find('.valideringstripefeil').childAt(0).text()).toEqual('skjema.feil.validering');
    });

    it('Viser modal når saksbehandler trykker på "Send inn" og det er ingen valideringsfeil', () => {
        const validateSoknad = jest.fn();
        const punchForm = setupPunchForm({soknad: initialSoknad, isValid: true}, {validateSoknad});
        punchForm.find('.submit-knapper').find('.sendknapp-wrapper').find('.send-knapp').simulate('click');
        expect(validateSoknad).toHaveBeenCalledTimes(1);
        expect(punchForm.find('.erdusikkermodal')).toHaveLength(1);
    });

    it('Viser modal når saksbehandler trykker på "Sett på vent" og det er ingen valideringsfeil', () => {
        const validateSoknad = jest.fn();
        const punchForm = setupPunchForm({soknad: initialSoknad}, {validateSoknad});
        punchForm.find('.submit-knapper').find('.sendknapp-wrapper').find('.vent-knapp').simulate('click');
        expect(punchForm.find('.settpaaventmodal')).toHaveLength(1);
    });
});

