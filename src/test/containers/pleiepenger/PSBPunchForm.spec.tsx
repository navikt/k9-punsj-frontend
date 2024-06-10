import React from 'react';
import { expect } from '@jest/globals';
import { ShallowWrapper, shallow } from 'enzyme';
import { mocked } from 'jest-mock';

import { IntlShape, WrappedComponentProps, createIntl } from 'react-intl';
import reactRedux from 'react-redux';

import intlHelper from '../../../app/utils/intlUtils';
import {
    IPunchFormComponentProps,
    IPunchFormDispatchProps,
    IPunchFormStateProps,
    PunchFormComponent,
} from '../../../app/ytelser/pleiepenger/PSBPunchForm';

import { JaNeiIkkeRelevant } from '../../../app/models/enums/JaNeiIkkeRelevant';
import { IIdentState } from '../../../app/models/types/IdentState';
import { IJournalposterPerIdentState } from '../../../app/models/types/Journalpost/JournalposterPerIdentState';
import { IPSBSoknadKvittering } from '../../../app/models/types/PSBSoknadKvittering';
import { IPSBSoknad } from '../../../app/models/types/PSBSoknad';
import { IPunchPSBFormState } from '../../../app/models/types/PunchPSBFormState';
import { ISignaturState } from '../../../app/models/types/SignaturState';
import { useNavigate } from 'react-router';

jest.mock('react-intl');
jest.mock('react-router');
jest.mock('app/utils/envUtils');
jest.mock('app/utils/intlUtils');
jest.mock('app/utils/pathUtils');

jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useSelector: jest.fn(),
}));

const navigate = useNavigate();

const soknadId = 'abc';
const søkerId = '01015012345';
const pleietrengendeId = '22082067856';
const journalpostid = '200';

const initialSoknad: IPSBSoknad = {
    arbeidstid: {
        arbeidstakerList: [],
        frilanserArbeidstidInfo: null,
        selvstendigNæringsdrivendeArbeidstidInfo: {},
    },
    barn: {
        foedselsdato: '',
        norskIdent: pleietrengendeId,
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
    soekerId: søkerId,
    soeknadId: '123',
    soeknadsperiode: [],
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
    begrunnelseForInnsending: { tekst: 'test' },
};

const setupPunchForm = (
    punchFormStateSetup?: Partial<IPunchPSBFormState>,
    punchFormDispatchPropsSetup?: Partial<IPunchFormDispatchProps>,
) => {
    const wrappedComponentProps: WrappedComponentProps = {
        intl: createIntl({ locale: 'nb', defaultLocale: 'nb' }),
    };

    const punchFormDispatchProps: IPunchFormDispatchProps = {
        getSoknad: jest.fn(),
        hentPerioder: jest.fn(),
        resetSoknadAction: jest.fn(),
        resetPunchFormAction: jest.fn(),
        submitSoknad: jest.fn(),
        updateSoknad: jest.fn(),
        setSignaturAction: jest.fn(),
        settJournalpostPaaVent: jest.fn(),
        settPaaventResetAction: jest.fn(),
        validateSoknad: jest.fn(),
        validerSoknadReset: jest.fn(),
        resetAllStateAction: jest.fn(),
        ...punchFormDispatchPropsSetup,
    };

    const punchFormState: IPunchPSBFormState = {
        isSoknadLoading: false,
        ...punchFormStateSetup,
    };

    const identState: IIdentState = {
        søkerId: '122345',
        pleietrengendeId: '678908',
        annenSokerIdent: null,
        annenPart: '',
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
        journalpostid,
        id: soknadId,
        navigate: navigate,
    };

    mocked(intlHelper).mockImplementation((intl: IntlShape, id: string) => id);

    return shallow(
        /* eslint-disable react/jsx-props-no-spreading */
        <PunchFormComponent
            {...punchFormComponentProps}
            {...wrappedComponentProps}
            {...punchFormStateProps}
            {...punchFormDispatchProps}
            /* eslint-enable react/jsx-props-no-spreading */
        />,
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

jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useSelector: jest.fn(),
}));

describe('PunchForm', () => {
    jest.mock('react-redux', () => ({
        ...jest.requireActual('react-redux'),
        useSelector: jest.fn(),
    }));

    beforeEach(() => {
        (reactRedux.useSelector as unknown as jest.Mock).mockImplementation((callback) => callback({}));
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
        expect(punchForm.findWhere((n) => n.name() === 'ForwardRef' && n.prop('size') === 'large')).toHaveLength(1);
    });

    it('Viser feilmelding når søknaden ikke er funnet', () => {
        const punchForm = setupPunchForm({ error: { status: 404 } });
        expect(punchForm.findWhere((n) => n.name() === 'ForwardRef' && n.prop('variant') === 'error')).toHaveLength(1);
        expect(
            punchForm
                .findWhere((n) => n.name() === 'ForwardRef' && n.prop('variant') === 'error')
                .childAt(0)
                .text(),
        ).toEqual('skjema.feil.ikke_funnet');
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
        (reactRedux.useSelector as unknown as jest.Mock).mockImplementation((callback) =>
            callback({
                PLEIEPENGER_SYKT_BARN: {
                    punchFormState: {},
                },
            }),
        );
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
    });

    it('Viser ikke perioder når tilsyn er undefined', () => {
        const punchForm = setupPunchForm({ soknad: initialSoknad });
        expect(punchForm.find('.tilsynsordning CheckboksPanel').prop('checked')).toEqual(false);
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

    it('Fjerner tilsynsordning når avhuking på tilsyn fjernes', () => {
        const updateSoknad = jest.fn();
        const punchForm = setupPunchForm(
            {
                soknad: {
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
                },
            },
            { updateSoknad },
        );
        punchForm.find('.tilsynsordning CheckboksPanel').simulate('change', { target: { checked: false } });
        expect(updateSoknad).toHaveBeenCalledTimes(1);
        const expectedUpdatedSoknad = expect.objectContaining({
            tilsynsordning: undefined,
        });
        expect(updateSoknad).toHaveBeenCalledWith(expectedUpdatedSoknad);
        expect(punchForm.find('.tilsynsordning CheckboksPanel').prop('checked')).toBeFalsy();
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
            { validateSoknad },
        );
        punchForm.find('.submit-knapper').find('.sendknapp-wrapper').find('.send-knapp').simulate('click');
        expect(validateSoknad).toHaveBeenCalledTimes(1);
        expect(punchForm.findWhere((n) => n.name() === 'ForwardRef' && n.prop('variant') === 'error')).toHaveLength(1);
        expect(
            punchForm
                .findWhere((n) => n.name() === 'ForwardRef' && n.prop('variant') === 'error')
                .childAt(0)
                .text(),
        ).toEqual('skjema.feil.validering');
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
        (reactRedux.useSelector as unknown as jest.Mock).mockImplementation((callback) =>
            callback({
                PLEIEPENGER_SYKT_BARN: {
                    punchFormState: {
                        soknad,
                        perioder: [{ fom: '2021-01-30', tom: '2021-04-15' }],
                    },
                },
            }),
        );
        expect(
            punchForm
                .find('Soknadsperioder')
                .dive()
                .find('.eksiterendesoknaderpanel')
                .findWhere((n) => n.name() === 'ForwardRef' && n.prop('variant') === 'warning'),
        ).toHaveLength(1);
        expect(
            punchForm
                .find('Soknadsperioder')
                .dive()
                .find('.eksiterendesoknaderpanel')
                .findWhere((n) => n.name() === 'ForwardRef' && n.prop('variant') === 'warning')
                .childAt(0)
                .text(),
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
            'skjema.ferie.leggtil',
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
            punchForm
                .find('.feriepanel')
                .dive()
                .find('.ekspanderbartPanel__innhold')
                .findWhere((n) => n.name() === 'ForwardRef' && n.prop('variant') === 'info'),
        ).toHaveLength(1);
    });

    it('Viser ikke advarsel om overlappende periode når periodene ikke overlapper', () => {
        const soknad = {
            ...initialSoknad,
            soeknadsperiode: [{ fom: '2021-02-23', tom: '2021-08-23' }],
        };
        const punchForm = setupPunchForm({ soknad, perioder: [{ fom: '2021-08-30', tom: '2021-09-15' }] }, {});
        (reactRedux.useSelector as unknown as jest.Mock).mockImplementation((callback) =>
            callback({
                PLEIEPENGER_SYKT_BARN: {
                    punchFormState: {
                        soknad,
                        perioder: [{ fom: '2021-08-30', tom: '2021-09-15' }],
                    },
                },
            }),
        );
        expect(
            punchForm
                .find('Soknadsperioder')
                .dive()
                .find('.eksiterendesoknaderpanel')
                .findWhere((n) => n.name() === 'ForwardRef' && n.prop('variant') === 'error'),
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
