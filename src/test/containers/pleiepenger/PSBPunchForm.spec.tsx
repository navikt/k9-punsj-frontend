import React from 'react';

import { expect } from '@jest/globals';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { mocked } from 'jest-mock';

import { IntlShape, WrappedComponentProps, createIntl } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';

import intlHelper from '../../../app/utils/intlUtils';
import {
    IPunchFormComponentProps,
    IPunchFormDispatchProps,
    IPunchFormStateProps,
    PunchFormComponent,
} from '../../../app/søknader/pleiepenger/containers/PSBPunchForm';

import { JaNeiIkkeRelevant } from '../../../app/models/enums/JaNeiIkkeRelevant';
import { IIdentState } from '../../../app/models/types/IdentState';
import { IJournalposterPerIdentState } from '../../../app/models/types/Journalpost/JournalposterPerIdentState';
import { IPSBSoknadKvittering } from '../../../app/models/types/PSBSoknadKvittering';
import { IPSBSoknad } from '../../../app/models/types/PSBSoknad';
import { IPunchPSBFormState } from '../../../app/models/types/PunchPSBFormState';
import { ISignaturState } from '../../../app/models/types/SignaturState';
import userEvent from '@testing-library/user-event';
import { Tidsformat } from '../../../app/utils/timeUtils';

jest.mock('react-intl');
jest.mock('react-router');
jest.mock('app/utils/envUtils');
jest.mock('app/utils/intlUtils');

jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useSelector: jest.fn(),
    useDispatch: jest.fn(),
}));

const soknadId = 'abc';
const søkerId = '01015012345';
const pleietrengendeId = '22082067856';
const journalpostid = '200';

export const initialSoknad: IPSBSoknad = {
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

export const validertSoknad: IPSBSoknadKvittering = {
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
    begrunnelseForInnsending: { tekst: '' },
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
        updateSoknad: punchFormDispatchPropsSetup?.updateSoknad || jest.fn(),
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
        fellesState: { journalposterIAapenSoknad: [] },
    };

    const punchFormComponentProps: IPunchFormComponentProps = {
        journalpostid,
        id: soknadId,
        navigate: jest.fn(),
    };

    mocked(intlHelper).mockImplementation((intl: IntlShape, id: string) => id);

    (useSelector as unknown as jest.Mock).mockImplementation((callback) =>
        callback({
            felles: { journalposterIAapenSoknad: [] },
            identState,
        }),
    );
    (useDispatch as unknown as jest.Mock).mockReturnValue(jest.fn());

    return render(
        <PunchFormComponent
            {...punchFormComponentProps}
            {...wrappedComponentProps}
            {...punchFormStateProps}
            {...punchFormDispatchProps}
        />,
    );
};

describe('PunchForm', () => {
    it('Viser skjema', async () => {
        await act(async () => {
            setupPunchForm();
        });

        expect(screen.getAllByTestId(/accordionItem-/)).toHaveLength(7);
    });

    it('Henter søknadsinformasjon', async () => {
        const getSoknad = jest.fn();
        await act(async () => {
            setupPunchForm({}, { getSoknad });
        });
        expect(getSoknad).toHaveBeenCalledTimes(1);
        expect(getSoknad).toHaveBeenCalledWith(soknadId);
    });

    it('Viser spinner når søknaden lastes inn', async () => {
        await act(async () => {
            setupPunchForm({ isSoknadLoading: true });
        });

        expect(screen.getByText(/Venter/i)).toBeDefined();
    });

    it('Viser feilmelding når søknaden ikke er funnet', async () => {
        await act(async () => {
            setupPunchForm({ error: { status: 404 } });
        });

        expect(screen.getByText('Feil')).toBeDefined();
        expect(screen.getByText('skjema.feil.ikke_funnet')).toBeDefined();
        expect(screen.getByText('skjema.knapp.tilstart')).toBeDefined();
    });

    it('Oppdaterer søknad når mottakelsesdato endres', async () => {
        const updateSoknad = jest.fn();
        const newDato = '11.02.2020';

        await act(async () => {
            setupPunchForm({ soknad: initialSoknad }, { updateSoknad });
        });

        const dateInput = screen.getByTestId('mottattDato');

        await act(async () => {
            await userEvent.type(dateInput, newDato);
            await userEvent.tab();
        });

        // screen.debug(dateInput);
        // console.log(updateSoknad.mock);

        // expect(updateSoknad).toHaveBeenCalledTimes(1);
        // expect(updateSoknad).toHaveBeenCalledWith(expect.objectContaining({ mottattDato: '2020-02-11' }));

        // TODO: Fix this test
    });

    it('Oppdaterer felt når mottakelsesdato endres', async () => {
        await act(async () => {
            setupPunchForm({ soknad: initialSoknad });
        });

        const dateInput = screen.getByTestId('mottattDato') as HTMLInputElement;

        const newDato = '01.12.2024';

        await act(async () => {
            await userEvent.clear(dateInput);
            await userEvent.type(dateInput, newDato);
            await userEvent.tab();
        });

        expect(dateInput.value).toEqual(newDato);
    });

    it('Viser dato for å legge til søknadsperiode når det ikke finnes en søknadsperiode fra før', async () => {
        await act(async () => {
            setupPunchForm({ soknad: initialSoknad }, {});
            (useSelector as unknown as jest.Mock).mockImplementation((callback) =>
                callback({
                    PLEIEPENGER_SYKT_BARN: {
                        punchFormState: {},
                    },
                    felles: { journalposterIAapenSoknad: [] },
                }),
            );
        });

        const søknadsperioder = screen.getByTestId('søknadsperioder');

        const { getAllByTestId } = within(søknadsperioder);

        const periodepaneler = getAllByTestId(/periodpaneler/i);

        expect(søknadsperioder).toBeDefined();
        expect(periodepaneler).toBeDefined();
        expect(periodepaneler).toHaveLength(1);
    });

    it('Skjuler knapp for å legge til søknadsperiode når det finnes en søknadsperiode fra før', async () => {
        const soknad = { ...initialSoknad, soeknadsperiode: [{ fom: '', tom: '' }] };

        await act(async () => {
            setupPunchForm({ soknad }, {});
        });

        expect(screen.queryByTestId('leggtilsoknadsperiode')).toBeNull();
    });

    it('Viser checkboks for tilsyn (omsorgstilbud)', async () => {
        await act(async () => {
            setupPunchForm();
        });

        expect(screen.getByTestId('omsorgstilbud-checkboks')).toBeDefined();
    });

    it('Viser perioder når tilsyn er registrert', async () => {
        const soknad = {
            ...initialSoknad,
            tilsynsordning: {
                perioder: [
                    {
                        periode: {
                            fom: '2020-12-06',
                            tom: '2021-01-15',
                        },
                        timer: '5',
                        minutter: '0',
                        perDagString: '5 timer',
                        tidsformat: Tidsformat.TimerOgMin,
                    },
                ],
            },
        };
        await act(async () => {
            setupPunchForm({ soknad });
        });

        const omsorgstilbudCheckboks = screen.getByTestId('omsorgstilbud-checkboks') as HTMLInputElement;

        expect(omsorgstilbudCheckboks.checked).toBeTruthy();
    });

    it('Viser ikke perioder når tilsyn er undefined', async () => {
        await act(async () => {
            setupPunchForm({ soknad: initialSoknad });
        });

        const omsorgstilbudCheckboks = screen.getByTestId('omsorgstilbud-checkboks') as HTMLInputElement;
        expect(omsorgstilbudCheckboks.checked).toBeFalsy();
    });

    it('Viser beredskap og nattevåk når det er registrert fra før', async () => {
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
        await act(async () => {
            setupPunchForm({ soknad });
        });

        expect(screen.getByTestId('beredskapsperioder')).toBeDefined();
        expect(screen.getByTestId('nattevaaksperioder')).toBeDefined();
    });

    it('Viser ikke beredskap eller nattevåk hvis undefined', async () => {
        await act(async () => {
            setupPunchForm({ soknad: initialSoknad });
        });

        expect(screen.queryByTestId('beredskapsperioder')).toBeNull();
        expect(screen.queryByTestId('.nattevaaksperioder')).toBeNull();
    });

    it('Fjerner tilsynsordning når avhuking på tilsyn fjernes', async () => {
        const updateSoknad = jest.fn();

        await act(async () => {
            setupPunchForm(
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
                                    timer: '5',
                                    minutter: '0',
                                    perDagString: '5 timer',
                                    tidsformat: Tidsformat.TimerOgMin,
                                },
                            ],
                        },
                    },
                },
                { updateSoknad },
            );
        });

        const omsorgstilbudCheckboks = screen.getByTestId('omsorgstilbud-checkboks') as HTMLInputElement;

        expect(omsorgstilbudCheckboks.checked).toBeTruthy();

        await act(async () => {
            fireEvent.click(omsorgstilbudCheckboks);
        });

        expect(omsorgstilbudCheckboks.checked).toBeFalsy();
    });

    it('Validerer søknad når saksbehandler trykker på "Send inn"', async () => {
        const validateSoknad = jest.fn();

        await act(async () => {
            setupPunchForm({ soknad: initialSoknad }, { validateSoknad });
        });

        const sendKnapp = screen.getByTestId('sendKnapp');

        await act(async () => {
            fireEvent.click(sendKnapp);
        });

        expect(validateSoknad).toHaveBeenCalledTimes(1);
    });

    it('Viser melding om valideringsfeil', async () => {
        const validateSoknad = jest.fn();

        await act(async () => {
            setupPunchForm(
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
        });

        const sendKnapp = screen.getByTestId('sendKnapp');

        await act(async () => {
            fireEvent.click(sendKnapp);
        });

        expect(validateSoknad).toHaveBeenCalledTimes(1);

        expect(screen.findByText('skjema.feil.validering')).toBeDefined();
    });

    it('Viser modal når saksbehandler trykker på "Send inn" og det er ingen valideringsfeil', async () => {
        const validateSoknad = jest.fn();

        await act(async () => {
            setupPunchForm({ soknad: initialSoknad, validertSoknad, isValid: true }, { validateSoknad });
        });

        const sendKnapp = screen.getByTestId('sendKnapp');

        await act(async () => {
            fireEvent.click(sendKnapp);
        });

        expect(validateSoknad).toHaveBeenCalledTimes(1);

        expect(screen.getByTestId('validertSoknadModal')).toBeDefined();

        const videreKnapp = screen.getByTestId('validertSoknadOppsummeringContainer_knappVidere');

        await act(async () => {
            fireEvent.click(videreKnapp);
        });

        expect(screen.getByTestId('erdusikkermodal')).toBeDefined();
    });

    it('Viser modal når saksbehandler trykker på "Sett på vent" og det er ingen valideringsfeil', async () => {
        const validateSoknad = jest.fn();
        await act(async () => {
            setupPunchForm({ soknad: initialSoknad }, { validateSoknad });
        });

        const ventKnapp = screen.getByTestId('ventKnapp');

        await act(async () => {
            fireEvent.click(ventKnapp);
        });

        expect(screen.getByTestId('settpaaventmodal')).toBeDefined();
    });

    it('Viser advarsel om overlappende periode', async () => {
        const soknad = {
            ...initialSoknad,
            soeknadsperiode: [{ fom: '2021-02-23', tom: '2021-08-23' }],
        };

        await act(async () => {
            setupPunchForm(
                {
                    soknad,
                    perioder: [{ fom: '2021-01-30', tom: '2021-04-15' }],
                },
                {},
            );
        });

        // TODO: Fix this test

        // console.log(screen.debug());

        // const overlaperWarning = screen.getByText('skjema.soknadsperiode.overlapper');

        // screen.debug(overlaperWarning);

        // expect(screen.queryByText('skjema.soknadsperiode.overlapper')).not.toBeNull();
    });

    it('Viser legg till ferie', async () => {
        const soknad = { ...initialSoknad };

        await act(async () => {
            setupPunchForm({ soknad }, {});
        });

        expect(screen.getByTestId('accordionItem-feriepanel')).toBeDefined();

        const feriepanelCheckbox = screen.getByTestId('feriepanel-checkbox');

        expect(feriepanelCheckbox).toBeDefined();
    });

    it('Viser legg till ferie og slettade perioder dersom det finns periode', async () => {
        const soknad = { ...initialSoknad };

        await act(async () => {
            setupPunchForm({ soknad, perioder: [{ fom: '2021-01-30', tom: '2021-04-15' }] }, {});
        });

        const feriepanel = screen.getByTestId('accordionItem-feriepanel');

        const { getByText } = within(feriepanel);

        expect(getByText('skjema.ferie.leggtil')).toBeDefined();
        expect(getByText('skjema.ferie.fjern')).toBeDefined();
    });

    it('Viser ferieperioder dersom det finnes', async () => {
        const soknad = {
            ...initialSoknad,
            lovbestemtFerie: [{ fom: '2021-01-30', tom: '2021-04-15' }],
        };

        await act(async () => {
            setupPunchForm({ soknad, perioder: [{ fom: '2021-01-30', tom: '2021-04-15' }] }, {});
        });

        const feriepanel = screen.getByTestId('accordionItem-feriepanel');

        const { getByTestId } = within(feriepanel);

        const fom = getByTestId('fom') as HTMLInputElement;
        const tom = getByTestId('tom') as HTMLInputElement;

        expect(fom.value).toEqual('30.01.2021');
        expect(tom.value).toEqual('15.04.2021');
    });

    it('Viser slettade ferieperioder dersom det finnes', async () => {
        const soknad = {
            ...initialSoknad,
            lovbestemtFerieSomSkalSlettes: [{ fom: '2021-01-30', tom: '2021-04-15' }],
        };

        await act(async () => {
            setupPunchForm({ soknad, perioder: [{ fom: '2021-01-30', tom: '2021-04-15' }] }, {});
        });

        const feriepanel = screen.getByTestId('accordionItem-feriepanel');

        const { getByTestId } = within(feriepanel);

        const fom = getByTestId('fom') as HTMLInputElement;
        const tom = getByTestId('tom') as HTMLInputElement;

        expect(fom.value).toEqual('30.01.2021');
        expect(tom.value).toEqual('15.04.2021');
    });
});
