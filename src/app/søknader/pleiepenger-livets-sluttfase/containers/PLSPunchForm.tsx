import classNames from 'classnames';
import { EkspanderbartpanelBase } from 'nav-frontend-ekspanderbartpanel';
import { CheckboksPanel, RadioPanelGruppe } from 'nav-frontend-skjema';
import React, { ComponentType } from 'react';
import { WrappedComponentProps, injectIntl } from 'react-intl';
import { connect } from 'react-redux';

import { Alert, Button, Checkbox, HelpText, Loader, Modal, Tag } from '@navikt/ds-react';

import { Periodepaneler } from 'app/components/Periodepaneler';
import { Arbeidsforhold, JaNei } from 'app/models/enums';
import {
    IInputError,
    ISignaturState,
    IUtenlandsOpphold,
    SelvstendigNaeringsdrivendeOpptjening,
    SelvstendigNaerinsdrivende,
} from 'app/models/types';
import { ArbeidstidInfo } from 'app/models/types/ArbeidstidInfo';
import { resetPunchFormAction, setSignaturAction } from 'app/state/actions';
import { nummerPrefiks } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';

import { NavigateFunction, useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from 'app/constants/routes';
import JournalposterSync from 'app/components/JournalposterSync';
import { resetAllStateAction } from 'app/state/actions/GlobalActions';
import ArbeidsforholdPanel from '../../../components/arbeidsforhold/containers/ArbeidsforholdPanel';
import Feilmelding from '../../../components/Feilmelding';
import VerticalSpacer from '../../../components/VerticalSpacer';
import ErDuSikkerModal from 'app/components/ErDuSikkerModal';
import { OkGaaTilLosModal } from 'app/components/okGaaTilLosModal/OkGaaTilLosModal';
import { PeriodeinfoPaneler } from 'app/components/periodeinfoPaneler/PeriodeinfoPaneler';
import SettPaaVentErrorModal from 'app/components/settPaaVentModal/SettPaaVentErrorModal';
import SettPaaVentModal from 'app/components/settPaaVentModal/SettPaaVentModal';
import { pfLand } from 'app/søknader/pleiepenger/components/pfLand';
import { JaNeiIkkeOpplyst } from '../../../models/enums/JaNeiIkkeOpplyst';
import { JaNeiIkkeRelevant } from '../../../models/enums/JaNeiIkkeRelevant';
import { PunchFormPaneler } from '../../../models/enums/PunchFormPaneler';
import { Virksomhetstyper } from '../../../models/enums/Virksomhetstyper';
import { Arbeidstaker } from '../../../models/types/Arbeidstaker';
import { FrilanserOpptjening } from '../../../models/types/FrilanserOpptjening';
import { IIdentState } from '../../../models/types/IdentState';
import { IJournalposterPerIdentState } from '../../../models/types/Journalpost/JournalposterPerIdentState';
import { IPeriode } from '../../../models/types/Periode';
import { RootStateType } from '../../../state/RootState';
import { setIdentFellesAction } from '../../../state/actions/IdentActions';
import { initializeDate } from '../../../utils/timeUtils';
import { undoChoiceOfEksisterendePLSSoknadAction } from '../state/actions/EksisterendePLSSoknaderActions';
import {
    getPLSSoknad,
    hentPLSPerioderFraK9Sak,
    resetPLSPunchFormAction,
    resetPLSSoknadAction,
    setJournalpostPaaVentResetAction,
    settJournalpostPaaVent,
    submitPLSSoknad,
    updatePLSSoknad,
    validerPLSSoknad,
    validerPLSSoknadResetAction,
} from '../state/actions/PLSPunchFormActions';
import { IPLSSoknad, PLSSoknad } from '../types/PLSSoknad';
import { IPLSSoknadUt, PLSSoknadUt } from '../types/PLSSoknadUt';
import { IPunchPLSFormState } from '../types/PunchPLSFormState';
import EndringAvSoknadsperioder from './EndringAvSøknadsperioder/EndringAvSoknadsperioder';
import OpplysningerOmPLSSoknad from './OpplysningerOmSoknad/OpplysningerOmPLSSoknad';
import { PLSSoknadKvittering } from './SoknadKvittering/PLSSoknadKvittering';
import Soknadsperioder from './Soknadsperioder';
import { sjekkHvisArbeidstidErAngitt } from './arbeidstidOgPerioderHjelpfunksjoner';

import { PLSKvitteringContainer } from './PLSKvittering';

export interface IPunchPLSFormComponentProps {
    journalpostid: string;
    id: string;
    navigate: NavigateFunction;
}
export interface IPunchPLSFormStateProps {
    punchFormState: IPunchPLSFormState;
    signaturState: ISignaturState;
    journalposterState: IJournalposterPerIdentState;
    identState: IIdentState;
    søkersIdent?: string;
    pleietrengendeIdent?: string;
}

export interface IPunchPLSFormDispatchProps {
    getSoknad: typeof getPLSSoknad;
    hentPerioder: typeof hentPLSPerioderFraK9Sak;
    resetSoknadAction: typeof resetPLSSoknadAction;
    setIdentAction: typeof setIdentFellesAction;
    updateSoknad: typeof updatePLSSoknad;
    submitSoknad: typeof submitPLSSoknad;
    resetAllStateAction: typeof resetAllStateAction;
    resetPunchFormAction: typeof resetPunchFormAction;
    setSignaturAction: typeof setSignaturAction;
    settJournalpostPaaVent: typeof settJournalpostPaaVent;
    settPaaventResetAction: typeof setJournalpostPaaVentResetAction;
    validateSoknad: typeof validerPLSSoknad;
    validerSoknadReset: typeof validerPLSSoknadResetAction;
}

export interface IPunchPLSFormComponentState {
    soknad: IPLSSoknad;
    perioder?: IPeriode;
    isFetched: boolean;
    showStatus: boolean;
    expandAll: boolean;
    harBoddIUtlandet: JaNeiIkkeOpplyst | undefined;
    iUtlandet: JaNeiIkkeOpplyst | undefined;
    aapnePaneler: PunchFormPaneler[];
    showSettPaaVentModal: boolean;
    visErDuSikkerModal: boolean;
    feilmeldingStier: Set<string>;
    harForsoektAaSendeInn: boolean;
}

type IPunchPLSFormProps = IPunchPLSFormComponentProps &
    WrappedComponentProps &
    IPunchPLSFormStateProps &
    IPunchPLSFormDispatchProps;

function withHooks<P>(Component: ComponentType<IPunchPLSFormComponentProps>) {
    return (props: P) => {
        const { id, journalpostid } = useParams();
        const navigate = useNavigate();
        return <Component {...props} id={id!} journalpostid={journalpostid!} navigate={navigate} />;
    };
}

export class PunchFormComponent extends React.Component<IPunchPLSFormProps, IPunchPLSFormComponentState> {
    private initialPeriode: IPeriode = { fom: '', tom: '' };

    private initialArbeidstaker = new Arbeidstaker({
        arbeidstidInfo: {
            perioder: [],
        },
        organisasjonsnummer: '',
        norskIdent: null,
    });

    private initialFrilanser = new FrilanserOpptjening({
        jobberFortsattSomFrilans: undefined,
        startdato: undefined,
    });

    private initialSelvstedigNæringsdrivende = new SelvstendigNaerinsdrivende({
        periode: this.initialPeriode,
        virksomhetstyper: [],
        registrertIUtlandet: false,
        landkode: '',
    });

    private initialSelvstendigNæringsdrivendeOpptjening = new SelvstendigNaeringsdrivendeOpptjening({
        virksomhetNavn: '',
        organisasjonsnummer: '',
        info: this.initialSelvstedigNæringsdrivende,
    });

    constructor(props: IPunchPLSFormProps) {
        super(props);
        this.state = {
            soknad: {
                soeknadId: '',
                soekerId: '',
                mottattDato: '',
                journalposter: new Set([]),
                pleietrengende: {
                    norskIdent: '',
                },
                opptjeningAktivitet: {},
                arbeidstid: {},
                utenlandsopphold: [],
                harInfoSomIkkeKanPunsjes: false,
                harMedisinskeOpplysninger: false,
            },
            isFetched: false,
            showStatus: false,
            expandAll: false,
            harBoddIUtlandet: undefined,
            iUtlandet: undefined,
            aapnePaneler: [],
            showSettPaaVentModal: false,
            visErDuSikkerModal: false,
            feilmeldingStier: new Set(),
            harForsoektAaSendeInn: false,
        };
    }

    componentDidMount(): void {
        const { id, søkersIdent, pleietrengendeIdent } = this.props;
        this.props.getSoknad(id);
        this.setState((prevState) => prevState);

        if (søkersIdent && pleietrengendeIdent) {
            this.props.hentPerioder(søkersIdent, pleietrengendeIdent);
        }
    }

    componentDidUpdate(prevProps: Readonly<IPunchPLSFormProps>): void {
        const { punchFormState, søkersIdent, pleietrengendeIdent, identState, setIdentAction, hentPerioder } =
            this.props;
        const { soknad } = punchFormState;

        if (!!soknad && !this.state.isFetched) {
            this.setState({
                soknad: new PLSSoknad(soknad as IPLSSoknad),
                isFetched: true,
            });
            if (
                !soknad.pleietrengende ||
                !soknad.pleietrengende.norskIdent ||
                soknad.pleietrengende.norskIdent === ''
            ) {
                this.updateSoknad({ pleietrengende: { norskIdent: pleietrengendeIdent || '' } });
            }
        }
        if (!prevProps.søkersIdent && !prevProps.pleietrengendeIdent && søkersIdent && pleietrengendeIdent) {
            hentPerioder(søkersIdent, pleietrengendeIdent);
            if (!identState.søkerId || !identState.pleietrengendeId) {
                setIdentAction(søkersIdent, pleietrengendeIdent);
            }
        }
    }

    componentWillUnmount(): void {
        this.props.resetSoknadAction();
        this.props.resetPunchFormAction();
        this.props.validerSoknadReset();
    }

    private handleMedlemskapChange = (jaNei: JaNeiIkkeOpplyst) => {
        this.setState({
            harBoddIUtlandet: jaNei,
        });

        if (jaNei === JaNeiIkkeOpplyst.JA && this.state.soknad.bosteder!.length === 0) {
            this.state.soknad.bosteder!.push({ periode: { fom: '', tom: '' }, land: '' });
            this.forceUpdate();
        }

        if (jaNei !== JaNeiIkkeOpplyst.JA) {
            this.updateSoknadState({ bosteder: [] }, true);
            this.updateSoknad({ bosteder: [] });
        }
    };

    private addSkalHaFerie = () => {
        if (!this.state.soknad.lovbestemtFerie) {
            this.setState((prevState) => ({
                soknad: { ...prevState.soknad, lovbestemtFerie: [{}] },
            }));
        }
        this.state.soknad.lovbestemtFerie!.push({ fom: '', tom: '' });
        this.forceUpdate();
        this.updateSoknad({ lovbestemtFerie: this.state.soknad.lovbestemtFerie });
    };

    private addIkkeSkalHaFerie = () => {
        if (!this.state.soknad.lovbestemtFerieSomSkalSlettes) {
            this.setState((prevState) => ({
                soknad: { ...prevState.soknad, lovbestemtFerieSomSkalSlettes: [{}] },
            }));
        }
        this.state.soknad.lovbestemtFerieSomSkalSlettes!.push({ fom: '', tom: '' });
        this.forceUpdate();
        this.updateSoknad({ lovbestemtFerieSomSkalSlettes: this.state.soknad.lovbestemtFerieSomSkalSlettes });
    };

    private handleSubmit = () => {
        const navarandeSoknad: IPLSSoknad = this.state.soknad;
        const journalposter = {
            journalposter: Array.from(
                navarandeSoknad && navarandeSoknad.journalposter ? navarandeSoknad?.journalposter : [],
            ),
        };
        this.setState({ harForsoektAaSendeInn: true });
        this.props.validateSoknad({ ...navarandeSoknad, ...journalposter });
    };

    private handleSettPaaVent = () => {
        this.props.settJournalpostPaaVent(this.props.journalpostid, this.state.soknad.soeknadId!);
        this.setState({ showSettPaaVentModal: false });
    };

    private handlePanelClick = (p: PunchFormPaneler) => {
        const { aapnePaneler } = this.state;
        if (aapnePaneler.some((panel) => panel === p)) {
            aapnePaneler.splice(aapnePaneler.indexOf(p), 1);
        } else {
            aapnePaneler.push(p);
        }
        this.forceUpdate();
    };

    private checkOpenState = (p: PunchFormPaneler): boolean => {
        const { aapnePaneler, expandAll } = this.state;
        if (this.props.punchFormState.inputErrors?.length) {
            return true;
        }
        if (expandAll && aapnePaneler.some((panel) => panel === p)) {
            return false;
        }
        if (expandAll && !aapnePaneler.some((panel) => panel === p)) {
            return true;
        }
        if (!expandAll && aapnePaneler.some((panel) => panel === p)) {
            return true;
        }
        if (!expandAll && !aapnePaneler.some((panel) => panel === p)) {
            return false;
        }
        return false;
    };

    private updateVirksomhetstyper = (v: Virksomhetstyper, checked: boolean) => {
        const sn = this.state.soknad.opptjeningAktivitet.selvstendigNaeringsdrivende;

        if (checked && !sn?.info?.virksomhetstyper?.some((vtype) => vtype === v)) {
            sn?.info?.virksomhetstyper?.push(v);
        } else if (sn?.info?.virksomhetstyper?.some((vtype) => vtype === v)) {
            sn?.info?.virksomhetstyper?.splice(sn?.info?.virksomhetstyper?.indexOf(v), 1);
        }
        this.forceUpdate();
    };

    private handleArbeidsforholdChange = (af: Arbeidsforhold, checked: boolean) => {
        switch (af) {
            case Arbeidsforhold.ARBEIDSTAKER:
                if (checked) {
                    if (!this.state.soknad.arbeidstid || !this.state.soknad.arbeidstid.arbeidstakerList?.length) {
                        this.updateSoknadState({
                            arbeidstid: {
                                ...this.state.soknad.arbeidstid,
                                arbeidstakerList: [this.initialArbeidstaker],
                            },
                        });
                    }
                } else {
                    this.updateSoknadState({ arbeidstid: { ...this.state.soknad.arbeidstid, arbeidstakerList: [] } });
                    this.updateSoknad({ arbeidstid: { ...this.state.soknad.arbeidstid, arbeidstakerList: [] } });
                }
                break;
            case Arbeidsforhold.FRILANSER:
                if (checked) {
                    if (!this.state.soknad.arbeidstid || !this.state.soknad.arbeidstid.frilanserArbeidstidInfo) {
                        this.updateSoknadState({
                            arbeidstid: {
                                ...this.state.soknad.arbeidstid,
                                frilanserArbeidstidInfo: new ArbeidstidInfo({}),
                            },
                            opptjeningAktivitet: {
                                ...this.state.soknad.opptjeningAktivitet,
                                frilanser: this.initialFrilanser,
                            },
                        });
                    }
                } else {
                    this.updateSoknadState({
                        arbeidstid: {
                            ...this.state.soknad.arbeidstid,
                            frilanserArbeidstidInfo: null,
                        },
                        opptjeningAktivitet: {
                            ...this.state.soknad.opptjeningAktivitet,
                            frilanser: null,
                        },
                    });
                    this.updateSoknad({
                        arbeidstid: {
                            ...this.state.soknad.arbeidstid,
                            frilanserArbeidstidInfo: null,
                        },
                        opptjeningAktivitet: {
                            ...this.state.soknad.opptjeningAktivitet,
                            frilanser: null,
                        },
                    });
                }
                break;
            case Arbeidsforhold.SELVSTENDIG:
                if (checked) {
                    if (
                        !this.state.soknad.opptjeningAktivitet ||
                        !this.state.soknad.opptjeningAktivitet.selvstendigNaeringsdrivende
                    ) {
                        this.updateSoknadState({
                            opptjeningAktivitet: {
                                ...this.state.soknad.opptjeningAktivitet,
                                selvstendigNaeringsdrivende: this.initialSelvstendigNæringsdrivendeOpptjening,
                            },
                            arbeidstid: {
                                ...this.state.soknad.arbeidstid,
                                selvstendigNæringsdrivendeArbeidstidInfo: new ArbeidstidInfo({}),
                            },
                        });
                    }
                } else {
                    this.updateSoknadState({
                        opptjeningAktivitet: {
                            ...this.state.soknad.opptjeningAktivitet,
                            selvstendigNaeringsdrivende: null,
                        },
                        arbeidstid: {
                            ...this.state.soknad.arbeidstid,
                            selvstendigNæringsdrivendeArbeidstidInfo: null,
                        },
                    });
                    this.updateSoknad({
                        opptjeningAktivitet: {
                            ...this.state.soknad.opptjeningAktivitet,
                            selvstendigNaeringsdrivende: null,
                        },
                        arbeidstid: {
                            ...this.state.soknad.arbeidstid,
                            selvstendigNæringsdrivendeArbeidstidInfo: null,
                        },
                    });
                }
                break;
            default:
                // Handle default case here FIX THIS
                break;
        }
    };

    private getCheckedValueArbeid = (af: Arbeidsforhold): boolean => {
        switch (af) {
            case Arbeidsforhold.ARBEIDSTAKER:
                if (this.state.soknad.arbeidstid?.arbeidstakerList?.length) {
                    return true;
                }
                return false;

            case Arbeidsforhold.FRILANSER:
                if (this.state.soknad.opptjeningAktivitet.frilanser) {
                    return true;
                }
                return false;

            case Arbeidsforhold.SELVSTENDIG:
                if (this.state.soknad.opptjeningAktivitet?.selvstendigNaeringsdrivende) {
                    return true;
                }
                return false;

            default:
                return false;
        }
    };

    private handleFrilanserChange = (jaNei: JaNei) => {
        if (jaNei === JaNei.JA) {
            this.updateSoknadState({
                arbeidstid: {
                    ...this.state.soknad.arbeidstid,
                    frilanserArbeidstidInfo: new ArbeidstidInfo({}),
                },
                opptjeningAktivitet: {
                    ...this.state.soknad.opptjeningAktivitet,
                    frilanser: {
                        ...this.state.soknad.opptjeningAktivitet.frilanser,
                        jobberFortsattSomFrilans: true,
                        sluttdato: undefined,
                    },
                },
            });
            this.updateSoknad({
                arbeidstid: {
                    ...this.state.soknad.arbeidstid,
                    frilanserArbeidstidInfo: {},
                },
                opptjeningAktivitet: {
                    ...this.state.soknad.opptjeningAktivitet,
                    frilanser: {
                        ...this.state.soknad.opptjeningAktivitet.frilanser,
                        jobberFortsattSomFrilans: true,
                    },
                },
            });
            this.forceUpdate();
        }

        if (jaNei !== JaNei.JA) {
            this.updateSoknadState({
                arbeidstid: {
                    ...this.state.soknad.arbeidstid,
                    frilanserArbeidstidInfo: {},
                },
                opptjeningAktivitet: {
                    ...this.state.soknad.opptjeningAktivitet,
                    frilanser: {
                        ...this.state.soknad.opptjeningAktivitet.frilanser,
                        jobberFortsattSomFrilans: false,
                    },
                },
            });
            this.updateSoknad({
                arbeidstid: {
                    ...this.state.soknad.arbeidstid,
                    frilanserArbeidstidInfo: {},
                },
                opptjeningAktivitet: {
                    frilanser: {
                        ...this.state.soknad.opptjeningAktivitet,
                        ...this.state.soknad.opptjeningAktivitet.frilanser,
                        jobberFortsattSomFrilans: false,
                    },
                },
            });
            this.forceUpdate();
        }
    };

    private getSoknadFromStore = () => new PLSSoknadUt(this.props.punchFormState.soknad as IPLSSoknadUt);

    private getManglerFromStore = () => this.props.punchFormState.inputErrors;

    private erFremITidKlokkeslett = (klokkeslett: string) => {
        const { mottattDato } = this.state.soknad;
        const naa = new Date();

        if (
            !!mottattDato &&
            naa.toDateString() === new Date(mottattDato!).toDateString() &&
            initializeDate(naa).format('HH:mm') < klokkeslett
        ) {
            return true;
        }
        return false;
    };

    private getUhaandterteFeil = (attribute: string): (string | undefined)[] => {
        const uhaandterteFeilmeldinger = this.getManglerFromStore()?.filter((m: IInputError) => {
            const felter = m.felt?.split('.') || [];
            for (let index = felter.length - 1; index >= -1; index--) {
                const felt = felter.slice(0, index + 1).join('.');
                const andreFeilmeldingStier = new Set(this.state.feilmeldingStier);
                andreFeilmeldingStier.delete(attribute);
                if (attribute === felt) {
                    return true;
                }
                if (andreFeilmeldingStier.has(felt)) {
                    return false;
                }
            }
            return false;
        });

        if (uhaandterteFeilmeldinger && uhaandterteFeilmeldinger?.length > 0) {
            return uhaandterteFeilmeldinger.map((error) => `${error.felt}: ${error.feilmelding}`).filter(Boolean);
        }
        return [];
    };

    private getErrorMessage = (attribute: string, indeks?: number) => {
        const { mottattDato, klokkeslett } = this.state.soknad;
        const erFremITid = (dato: string) => {
            const naa = new Date();
            return naa < new Date(dato);
        };
        if (!this.state.feilmeldingStier.has(attribute)) {
            this.setState((prevState) => ({ feilmeldingStier: prevState.feilmeldingStier.add(attribute) }));
        }

        if (attribute === 'klokkeslett' || attribute === 'mottattDato') {
            if (klokkeslett === null || klokkeslett === '' || mottattDato === null || mottattDato === '') {
                return intlHelper(this.props.intl, 'skjema.feil.ikketom');
            }
        }

        if (attribute === 'mottattDato' && !!mottattDato && erFremITid(mottattDato)) {
            return intlHelper(this.props.intl, 'skjema.feil.ikkefremitid');
        }

        if (attribute === 'klokkeslett' && !!klokkeslett && this.erFremITidKlokkeslett(klokkeslett)) {
            return intlHelper(this.props.intl, 'skjema.feil.ikkefremitid');
        }

        const errorMsg = this.getManglerFromStore()?.filter((m: IInputError) => m.felt === attribute)?.[indeks || 0]
            ?.feilmelding;

        if (errorMsg) {
            if (errorMsg.startsWith('Mangler søknadsperiode')) {
                return intlHelper(this.props.intl, 'skjema.feil.søknadsperiode/endringsperiode');
            }
            if (attribute === 'nattevåk' || attribute === 'beredskap' || attribute === 'lovbestemtFerie') {
                return errorMsg;
            }
        }

        return errorMsg
            ? intlHelper(
                  this.props.intl,
                  `skjema.feil.${attribute}.${errorMsg}`
                      .replace(/\[\d+]/g, '[]')
                      .replace(
                          /^skjema\.feil\..+\.FRA_OG_MED_MAA_VAERE_FOER_TIL_OG_MED$/,
                          'skjema.feil.FRA_OG_MED_MAA_VAERE_FOER_TIL_OG_MED',
                      )
                      .replace(/^skjema\.feil\..+\.fraOgMed\.MAA_SETTES$/, 'skjema.feil.fraOgMed.MAA_SETTES')
                      .replace(
                          /^skjema\.feil\..+\.fraOgMed\.MAA_VAERE_FOER_TIL_OG_MED$/,
                          'skjema.feil.fraOgMed.MAA_VAERE_FOER_TIL_OG_MED',
                      )
                      .replace(/^skjema\.feil\..+\.tilOgMed\.MAA_SETTES$/, 'skjema.feil.tilOgMed.MAA_SETTES')
                      .replace(/^skjema.feil.mottattDato.must not be null$/, 'skjema.feil.datoMottatt.MAA_SETTES'),
              )
            : undefined;
    };

    private updateSoknadState = (soknad: Partial<IPLSSoknad>, showStatus?: boolean) => {
        this.state.soknad.journalposter!.add(this.props.journalpostid);
        this.setState((prevState) => ({ soknad: { ...prevState.soknad, ...soknad }, showStatus: !!showStatus }));
    };

    private updateSoknadStateCallbackFunction = (soknad: Partial<IPLSSoknad>) => {
        this.updateSoknadState(soknad);
    };

    private updateSoknad = (soknad: Partial<IPLSSoknad>) => {
        this.setState({ showStatus: true });
        const navarandeSoknad: PLSSoknadUt = this.getSoknadFromStore();
        const journalposter = Array.from(navarandeSoknad?.journalposter ? navarandeSoknad?.journalposter : []);

        if (!journalposter.includes(this.props.journalpostid)) {
            journalposter.push(this.props.journalpostid);
        }

        if (this.state.harForsoektAaSendeInn) {
            this.props.validateSoknad({ ...this.getSoknadFromStore(), ...soknad, journalposter }, true);
        }

        return this.props.updateSoknad({ ...this.getSoknadFromStore(), ...soknad, journalposter });
    };

    private handleStartButtonClick = () => {
        this.props.resetAllStateAction();
        this.props.navigate(ROUTES.HOME);
    };

    private changeAndBlurUpdatesSoknad = (change: (event: any) => Partial<IPLSSoknad>) => ({
        onChange: (event: any) => this.updateSoknadState(change(event), false),
        onBlur: (event: any) => this.updateSoknad(change(event)),
    });

    private addOpphold = () => {
        if (!this.state.soknad.utenlandsopphold) {
            this.setState((prevState) => ({
                soknad: { ...prevState.soknad, utenlandsopphold: [{}] },
            }));
        }
        const utenlandsopphold = [{ land: undefined, periode: {} }];
        this.updateSoknadState({ utenlandsopphold });
        this.updateSoknad({ utenlandsopphold });
    };

    private updateOpplysningerIkkeKanPunsjes = (checked: boolean) => {
        this.updateSoknadState({ harInfoSomIkkeKanPunsjes: !!checked }, true);
        this.updateSoknad({ harInfoSomIkkeKanPunsjes: !!checked });
    };

    private updateMedisinskeOpplysninger = (checked: boolean) => {
        this.updateSoknadState({ harMedisinskeOpplysninger: !!checked }, true);
        this.updateSoknad({ harMedisinskeOpplysninger: !!checked });
    };

    private updateUtenlandsopphold = (jaNeiIkkeOpplyst: JaNeiIkkeOpplyst) => {
        this.setState({
            iUtlandet: jaNeiIkkeOpplyst,
        });

        if (jaNeiIkkeOpplyst === JaNeiIkkeOpplyst.JA && this.state.soknad.utenlandsopphold!.length === 0) {
            this.addOpphold();
        }

        if (jaNeiIkkeOpplyst !== JaNeiIkkeOpplyst.JA) {
            this.updateSoknadState({ utenlandsopphold: [] }, true);
            this.updateSoknad({ utenlandsopphold: [] });
        }
    };

    private updateSkalHaFerie = (checked: boolean) => {
        if (!this.state.soknad.lovbestemtFerie) {
            this.setState((prevState) => ({
                soknad: { ...prevState.soknad, lovbestemtFerie: [{}] },
            }));
        }
        if (!!checked && this.state.soknad.lovbestemtFerie?.length === 0) {
            this.addSkalHaFerie();
        } else {
            this.updateSoknadState({ lovbestemtFerie: [] }, true);
            this.updateSoknad({ lovbestemtFerie: [] });
        }
    };

    private updateIkkeSkalHaFerie = (checked: boolean) => {
        const { aapnePaneler } = this.state;
        if (!this.state.soknad.lovbestemtFerieSomSkalSlettes) {
            this.setState((prevState) => ({
                soknad: { ...prevState.soknad, lovbestemtFerieSomSkalSlettes: [{}] },
            }));
        }

        if (!!checked && !aapnePaneler.some((panel) => panel === PunchFormPaneler.ARBEID)) {
            aapnePaneler.push(PunchFormPaneler.ARBEID);
        } else if (!checked && aapnePaneler.some((panel) => panel === PunchFormPaneler.ARBEID)) {
            aapnePaneler.splice(aapnePaneler.indexOf(PunchFormPaneler.ARBEID), 1);
        }

        if (!!checked && this.state.soknad.lovbestemtFerieSomSkalSlettes?.length === 0) {
            this.addIkkeSkalHaFerie();
        } else {
            this.updateSoknadState({ lovbestemtFerieSomSkalSlettes: [] }, true);
            this.updateSoknad({ lovbestemtFerieSomSkalSlettes: [] });
        }
    };

    private statusetikett = () => {
        if (!this.state.showStatus) {
            return null;
        }

        const { punchFormState } = this.props;
        const className = 'statusetikett';

        if (punchFormState.isAwaitingUpdateResponse) {
            return (
                <Tag variant="warning" {...{ className }}>
                    Lagrer …
                </Tag>
            );
        }
        if (punchFormState.updateSoknadError) {
            return (
                <Tag variant="error" {...{ className }}>
                    Lagring feilet
                </Tag>
            );
        }
        return (
            <Tag variant="success" {...{ className }}>
                Lagret
            </Tag>
        );
    };

    render() {
        const { intl, punchFormState, signaturState } = this.props;

        const soknad = new PLSSoknad(this.state.soknad);
        const { signert } = signaturState;
        const eksisterendePerioder = punchFormState.perioder || [];

        if (punchFormState.isComplete && punchFormState.innsentSoknad) {
            return <PLSKvitteringContainer />;
        }

        if (punchFormState.isSoknadLoading) {
            return <Loader size="large" />;
        }

        if (punchFormState.error) {
            return (
                <>
                    <Alert variant="error">{intlHelper(intl, 'skjema.feil.ikke_funnet', { id: this.props.id })}</Alert>
                    <p>
                        <Button variant="secondary" onClick={this.handleStartButtonClick}>
                            {intlHelper(intl, 'skjema.knapp.tilstart')}
                        </Button>
                    </p>
                </>
            );
        }

        if (!soknad) {
            return null;
        }

        const initialUtenlandsopphold: IUtenlandsOpphold = { land: '' };

        return (
            <div data-test-id="PILSPunchForm">
                <JournalposterSync journalposter={this.state.soknad.journalposter} />
                {this.statusetikett()}
                <VerticalSpacer sixteenPx />
                <Soknadsperioder
                    updateSoknadState={this.updateSoknadStateCallbackFunction}
                    updateSoknad={this.updateSoknad}
                    initialPeriode={this.initialPeriode}
                    getErrorMessage={this.getErrorMessage}
                    getUhaandterteFeil={this.getUhaandterteFeil}
                    soknad={soknad}
                />
                <VerticalSpacer sixteenPx />
                <OpplysningerOmPLSSoknad
                    intl={intl}
                    changeAndBlurUpdatesSoknad={this.changeAndBlurUpdatesSoknad}
                    getErrorMessage={this.getErrorMessage}
                    setSignaturAction={this.props.setSignaturAction}
                    signert={signert}
                    soknad={soknad}
                />
                <VerticalSpacer sixteenPx />
                <Checkbox
                    onChange={(e) => {
                        this.setState({ expandAll: e.target.checked });
                        this.forceUpdate();
                    }}
                >
                    {intlHelper(intl, 'skjema.ekspander')}
                </Checkbox>
                <VerticalSpacer sixteenPx />
                <EndringAvSoknadsperioder
                    isOpen={this.checkOpenState(PunchFormPaneler.ENDRING_AV_SØKNADSPERIODER)}
                    onClick={() => this.handlePanelClick(PunchFormPaneler.ENDRING_AV_SØKNADSPERIODER)}
                    getErrorMessage={this.getErrorMessage}
                    soknad={soknad}
                    updateSoknad={this.updateSoknad}
                    updateSoknadState={this.updateSoknadState}
                    eksisterendePerioder={eksisterendePerioder}
                />
                <VerticalSpacer sixteenPx />
                <EkspanderbartpanelBase
                    apen={this.checkOpenState(PunchFormPaneler.UTENLANDSOPPHOLD)}
                    className="punchform__paneler"
                    tittel={intlHelper(intl, PunchFormPaneler.UTENLANDSOPPHOLD)}
                    onClick={() => this.handlePanelClick(PunchFormPaneler.UTENLANDSOPPHOLD)}
                >
                    <RadioPanelGruppe
                        className="horizontalRadios"
                        radios={Object.values(JaNeiIkkeOpplyst).map((jnv) => ({
                            label: intlHelper(intl, jnv),
                            value: jnv,
                        }))}
                        name="utlandjaneiikeeopplyst"
                        legend={intlHelper(intl, 'skjema.utenlandsopphold.label')}
                        onChange={(event) =>
                            this.updateUtenlandsopphold((event.target as HTMLInputElement).value as JaNeiIkkeOpplyst)
                        }
                        checked={
                            this.state.soknad.utenlandsopphold?.length ? JaNeiIkkeOpplyst.JA : this.state.iUtlandet
                        }
                    />
                    {!!soknad.utenlandsopphold.length && (
                        <PeriodeinfoPaneler
                            periods={soknad.utenlandsopphold}
                            component={pfLand()}
                            panelid={(i) => `utenlandsoppholdpanel_${i}`}
                            initialPeriodeinfo={initialUtenlandsopphold}
                            editSoknad={(perioder) => this.updateSoknad({ utenlandsopphold: perioder })}
                            editSoknadState={(perioder, showStatus) =>
                                this.updateSoknadState({ utenlandsopphold: perioder }, showStatus)
                            }
                            textLeggTil="skjema.perioder.legg_til"
                            textFjern="skjema.perioder.fjern"
                            className="utenlandsopphold"
                            panelClassName="utenlandsoppholdpanel"
                            getErrorMessage={this.getErrorMessage}
                            getUhaandterteFeil={this.getUhaandterteFeil}
                            feilkodeprefiks="ytelse.utenlandsopphold"
                            kanHaFlere
                            medSlettKnapp={false}
                        />
                    )}
                </EkspanderbartpanelBase>
                <EkspanderbartpanelBase
                    apen={this.checkOpenState(PunchFormPaneler.FERIE)}
                    className={classNames('punchform__paneler', 'feriepanel')}
                    tittel={intlHelper(intl, PunchFormPaneler.FERIE)}
                    onClick={() => this.handlePanelClick(PunchFormPaneler.FERIE)}
                >
                    <VerticalSpacer eightPx />
                    <CheckboksPanel
                        label={intlHelper(intl, 'skjema.ferie.leggtil')}
                        value="skjema.ferie.leggtil"
                        onChange={(e) => this.updateSkalHaFerie(e.target.checked)}
                        checked={!!soknad.lovbestemtFerie.length}
                    />
                    {!!soknad.lovbestemtFerie.length && (
                        <Periodepaneler
                            intl={intl}
                            periods={soknad.lovbestemtFerie}
                            initialPeriode={this.initialPeriode}
                            editSoknad={(perioder) => this.updateSoknad({ lovbestemtFerie: perioder })}
                            editSoknadState={(perioder, showStatus) =>
                                this.updateSoknadState({ lovbestemtFerie: perioder }, showStatus)
                            }
                            getErrorMessage={this.getErrorMessage}
                            getUhaandterteFeil={this.getUhaandterteFeil}
                            feilkodeprefiks="ytelse.lovbestemtFerie"
                            kanHaFlere
                        />
                    )}
                    <VerticalSpacer eightPx />
                    {eksisterendePerioder && eksisterendePerioder?.length > 0 && !punchFormState.hentPerioderError && (
                        <>
                            <CheckboksPanel
                                label={intlHelper(intl, 'skjema.ferie.fjern')}
                                value="skjema.ferie.fjern"
                                onChange={(e) => this.updateIkkeSkalHaFerie(e.target.checked)}
                                checked={!!soknad.lovbestemtFerieSomSkalSlettes.length}
                            />
                            {!!soknad.lovbestemtFerieSomSkalSlettes.length && (
                                <>
                                    <Alert size="small" variant="info">
                                        {intlHelper(intl, 'skjema.ferie.fjern.info')}
                                    </Alert>
                                    <Periodepaneler
                                        intl={intl}
                                        periods={soknad.lovbestemtFerieSomSkalSlettes}
                                        initialPeriode={this.initialPeriode}
                                        editSoknad={(perioder) =>
                                            this.updateSoknad({ lovbestemtFerieSomSkalSlettes: perioder })
                                        }
                                        editSoknadState={(perioder, showStatus) =>
                                            this.updateSoknadState(
                                                { lovbestemtFerieSomSkalSlettes: perioder },
                                                showStatus,
                                            )
                                        }
                                        getErrorMessage={() => undefined}
                                        getUhaandterteFeil={this.getUhaandterteFeil}
                                        feilkodeprefiks="ytelse.lovbestemtFerie"
                                        kanHaFlere
                                    />
                                </>
                            )}
                        </>
                    )}
                </EkspanderbartpanelBase>
                <ArbeidsforholdPanel
                    isOpen={this.checkOpenState(PunchFormPaneler.ARBEID)}
                    onPanelClick={() => this.handlePanelClick(PunchFormPaneler.ARBEID)}
                    handleArbeidsforholdChange={this.handleArbeidsforholdChange}
                    getCheckedValueArbeid={this.getCheckedValueArbeid}
                    soknad={soknad}
                    eksisterendePerioder={eksisterendePerioder}
                    initialArbeidstaker={this.initialArbeidstaker}
                    updateSoknad={this.updateSoknad}
                    updateSoknadState={this.updateSoknadState}
                    getErrorMessage={this.getErrorMessage}
                    getUhaandterteFeil={this.getUhaandterteFeil}
                    handleFrilanserChange={this.handleFrilanserChange}
                    updateVirksomhetstyper={this.updateVirksomhetstyper}
                />
                <EkspanderbartpanelBase
                    apen={this.checkOpenState(PunchFormPaneler.MEDLEMSKAP)}
                    className="punchform__paneler"
                    tittel={intlHelper(intl, PunchFormPaneler.MEDLEMSKAP)}
                    onClick={() => this.handlePanelClick(PunchFormPaneler.MEDLEMSKAP)}
                >
                    <RadioPanelGruppe
                        className="horizontalRadios"
                        radios={Object.values(JaNeiIkkeOpplyst).map((jn) => ({
                            label: intlHelper(intl, jn),
                            value: jn,
                        }))}
                        name="medlemskapjanei"
                        legend={intlHelper(intl, 'skjema.medlemskap.harbodd')}
                        onChange={(event) =>
                            this.handleMedlemskapChange((event.target as HTMLInputElement).value as JaNeiIkkeOpplyst)
                        }
                        checked={soknad.bosteder.length ? JaNeiIkkeOpplyst.JA : this.state.harBoddIUtlandet}
                    />
                    {!!soknad.bosteder.length && (
                        <PeriodeinfoPaneler
                            periods={soknad.bosteder}
                            component={pfLand()}
                            panelid={(i) => `bostederpanel_${i}`}
                            initialPeriodeinfo={initialUtenlandsopphold}
                            editSoknad={(bosteder) => this.updateSoknad({ bosteder })}
                            editSoknadState={(bosteder, showStatus) => this.updateSoknadState({ bosteder }, showStatus)}
                            textLeggTil="skjema.perioder.legg_til"
                            textFjern="skjema.perioder.fjern"
                            className="bosteder"
                            panelClassName="bostederpanel"
                            getErrorMessage={this.getErrorMessage}
                            getUhaandterteFeil={this.getUhaandterteFeil}
                            feilkodeprefiks="ytelse.bosteder"
                            kanHaFlere
                            medSlettKnapp={false}
                        />
                    )}
                </EkspanderbartpanelBase>
                <VerticalSpacer thirtyTwoPx />
                <p className="ikkeregistrert">{intlHelper(intl, 'skjema.ikkeregistrert')}</p>
                <div className="flex-container">
                    <CheckboksPanel
                        id="medisinskeopplysningercheckbox"
                        label={intlHelper(intl, 'skjema.medisinskeopplysninger')}
                        checked={!!soknad.harMedisinskeOpplysninger}
                        onChange={(event) => this.updateMedisinskeOpplysninger(event.target.checked)}
                    />
                    <HelpText className="hjelpetext" placement="top-end">
                        {intlHelper(intl, 'skjema.medisinskeopplysninger.hjelpetekst')}
                    </HelpText>
                </div>
                <VerticalSpacer eightPx />
                <div className="flex-container">
                    <CheckboksPanel
                        id="opplysningerikkepunsjetcheckbox"
                        label={intlHelper(intl, 'skjema.opplysningerikkepunsjet')}
                        checked={!!soknad.harInfoSomIkkeKanPunsjes}
                        onChange={(event) => this.updateOpplysningerIkkeKanPunsjes(event.target.checked)}
                    />
                    <HelpText className="hjelpetext" placement="top-end">
                        {intlHelper(intl, 'skjema.opplysningerikkepunsjet.hjelpetekst')}
                    </HelpText>
                </div>
                <VerticalSpacer twentyPx />
                {this.getUhaandterteFeil('')
                    .map((feilmelding, index) => nummerPrefiks(feilmelding || '', index + 1))
                    .map((feilmelding) => (
                        <Feilmelding key={feilmelding} feil={feilmelding} />
                    ))}

                {punchFormState.isAwaitingValidateResponse && (
                    <div className={classNames('loadingSpinner')}>
                        <Loader size="large" />
                    </div>
                )}
                <div className="submit-knapper">
                    <p className="sendknapp-wrapper">
                        <Button
                            variant="secondary"
                            className="send-knapp"
                            onClick={() => this.handleSubmit()}
                            disabled={!sjekkHvisArbeidstidErAngitt(this.props.punchFormState)}
                        >
                            {intlHelper(intl, 'skjema.knapp.send')}
                        </Button>

                        <Button
                            variant="secondary"
                            className="vent-knapp"
                            onClick={() => this.setState({ showSettPaaVentModal: true })}
                            disabled={!sjekkHvisArbeidstidErAngitt(this.props.punchFormState)}
                        >
                            {intlHelper(intl, 'skjema.knapp.settpaavent')}
                        </Button>
                    </p>
                </div>
                <VerticalSpacer sixteenPx />
                {!!punchFormState.updateSoknadError && (
                    <Alert variant="error">{intlHelper(intl, 'skjema.feil.ikke_lagret')}</Alert>
                )}
                {!!punchFormState.inputErrors?.length && (
                    <Alert variant="error">{intlHelper(intl, 'skjema.feil.validering')}</Alert>
                )}
                {!!punchFormState.submitSoknadError && (
                    <Alert variant="error">{intlHelper(intl, 'skjema.feil.ikke_sendt')}</Alert>
                )}
                {!!punchFormState.submitSoknadConflict && (
                    <Alert variant="error">{intlHelper(intl, 'skjema.feil.konflikt')}</Alert>
                )}
                {!sjekkHvisArbeidstidErAngitt(this.props.punchFormState) && (
                    <Alert variant="error">{intlHelper(intl, 'skjema.feil.sletteferie_manglerarbeidstid')}</Alert>
                )}

                {this.state.showSettPaaVentModal && (
                    <Modal
                        key="settpaaventmodal"
                        className="settpaaventmodal"
                        onClose={() => this.setState({ showSettPaaVentModal: false })}
                        aria-label="settpaaventmodal"
                        open={this.state.showSettPaaVentModal}
                    >
                        <div className="">
                            <SettPaaVentModal
                                journalposter={this.props.journalposterState.journalposter.filter(
                                    (jp) => jp.journalpostId !== this.props.journalpostid,
                                )}
                                soknadId={soknad.soeknadId}
                                submit={() => this.handleSettPaaVent()}
                                avbryt={() => this.setState({ showSettPaaVentModal: false })}
                            />
                        </div>
                    </Modal>
                )}
                {punchFormState.settPaaVentSuccess && (
                    <Modal
                        key="settpaaventokmodal"
                        onClose={() => this.props.settPaaventResetAction()}
                        aria-label="settpaaventokmodal"
                        open={punchFormState.settPaaVentSuccess}
                    >
                        <OkGaaTilLosModal melding="modal.settpaavent.til" />
                    </Modal>
                )}
                {!!punchFormState.settPaaVentError && (
                    <Modal
                        key="settpaaventerrormodal"
                        onClose={() => this.props.settPaaventResetAction()}
                        aria-label="settpaaventokmodal"
                        open={!!punchFormState.settPaaVentError}
                    >
                        <SettPaaVentErrorModal close={() => this.props.settPaaventResetAction()} />
                    </Modal>
                )}

                {this.props.punchFormState.isValid &&
                    !this.state.visErDuSikkerModal &&
                    this.props.punchFormState.validertSoknad && (
                        <Modal
                            key="validertSoknadModal"
                            className="validertSoknadModal"
                            onClose={() => this.props.validerSoknadReset()}
                            aria-label="validertSoknadModal"
                            open={!!this.props.punchFormState.isValid}
                        >
                            <Modal.Body>
                                <div className={classNames('validertSoknadOppsummeringContainer')}>
                                    <PLSSoknadKvittering
                                        intl={intl}
                                        response={this.props.punchFormState.validertSoknad}
                                    />
                                </div>
                                <div className={classNames('validertSoknadOppsummeringContainerKnapper')}>
                                    <Button
                                        size="small"
                                        className="validertSoknadOppsummeringContainer_knappVidere"
                                        onClick={() => this.setState({ visErDuSikkerModal: true })}
                                    >
                                        {intlHelper(intl, 'fordeling.knapp.videre')}
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="small"
                                        className="validertSoknadOppsummeringContainer_knappTilbake"
                                        onClick={() => this.props.validerSoknadReset()}
                                    >
                                        {intlHelper(intl, 'skjema.knapp.avbryt')}
                                    </Button>
                                </div>
                            </Modal.Body>
                        </Modal>
                    )}

                {this.state.visErDuSikkerModal && (
                    <Modal
                        key="erdusikkermodal"
                        className="erdusikkermodal"
                        onClose={() => this.props.validerSoknadReset()}
                        aria-label="erdusikkermodal"
                        open={this.state.visErDuSikkerModal}
                    >
                        <ErDuSikkerModal
                            melding="modal.erdusikker.sendinn"
                            extraInfo="modal.erdusikker.sendinn.extrainfo"
                            onSubmit={() => this.props.submitSoknad(this.state.soknad.soekerId, this.props.id)}
                            submitKnappText="skjema.knapp.send"
                            onClose={() => {
                                this.props.validerSoknadReset();
                                this.setState({ visErDuSikkerModal: false });
                            }}
                        />
                    </Modal>
                )}
            </div>
        );
    }
}

const mapStateToProps = (state: RootStateType): IPunchPLSFormStateProps => {
    const søkersIdent =
        state.identState.søkerId || state.PLEIEPENGER_I_LIVETS_SLUTTFASE.punchFormState.soknad?.soekerId;
    const pleietrengendeIdent =
        state.identState.pleietrengendeId ||
        state.PLEIEPENGER_I_LIVETS_SLUTTFASE.punchFormState.soknad?.pleietrengende?.norskIdent;
    return {
        punchFormState: state.PLEIEPENGER_I_LIVETS_SLUTTFASE.punchFormState,
        signaturState: state.PLEIEPENGER_I_LIVETS_SLUTTFASE.signaturState,
        journalposterState: state.journalposterPerIdentState,
        identState: state.identState,
        søkersIdent,
        pleietrengendeIdent,
    };
};

const mapDispatchToProps = (dispatch: any) => ({
    getSoknad: (id: string) => dispatch(getPLSSoknad(id)),
    hentPerioder: (søkerId: string, pleietrengendeId: string) =>
        dispatch(hentPLSPerioderFraK9Sak(søkerId, pleietrengendeId)),
    updateSoknad: (soknad: Partial<IPLSSoknadUt>) => dispatch(updatePLSSoknad(soknad)),
    validateSoknad: (soknad: IPLSSoknadUt, erMellomlagring: boolean) =>
        dispatch(validerPLSSoknad(soknad, erMellomlagring)),
    submitSoknad: (ident: string, soeknadid: string) => dispatch(submitPLSSoknad(ident, soeknadid)),
    resetSoknadAction: () => dispatch(resetPLSSoknadAction()),
    resetAllStateAction: () => dispatch(resetAllStateAction()),
    setIdentAction: (søkerId: string, pleietrengendeId: string | null, annenSokerIdent: string | null) =>
        dispatch(setIdentFellesAction(søkerId, pleietrengendeId, annenSokerIdent)),
    undoChoiceOfEksisterendeSoknadAction: () => dispatch(undoChoiceOfEksisterendePLSSoknadAction()),
    validerSoknadReset: () => dispatch(validerPLSSoknadResetAction()),
    resetPunchFormAction: () => dispatch(resetPLSPunchFormAction()),
    setSignaturAction: (signert: JaNeiIkkeRelevant | null) => dispatch(setSignaturAction(signert)),
    settJournalpostPaaVent: (journalpostid: string, soeknadid: string) =>
        dispatch(settJournalpostPaaVent(journalpostid, soeknadid)),
    settPaaventResetAction: () => dispatch(setJournalpostPaaVentResetAction()),
});

export const PLSPunchForm = withHooks(injectIntl(connect(mapStateToProps, mapDispatchToProps)(PunchFormComponent)));
