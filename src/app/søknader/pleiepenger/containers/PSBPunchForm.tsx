import React, { ComponentType } from 'react';

import { set } from 'lodash';
import { CheckboksPanel, RadioPanelGruppe } from 'nav-frontend-skjema';

import { FormattedMessage, WrappedComponentProps, injectIntl } from 'react-intl';
import { connect } from 'react-redux';

import { Accordion, Alert, Button, Checkbox, HelpText, Loader, Modal, Select, Tag, TextField } from '@navikt/ds-react';

import TilsynKalender from 'app/components/tilsyn/TilsynKalender';
import { Arbeidsforhold, JaNei } from 'app/models/enums';
import { IInputError, IPunchPSBFormState, ISignaturState, SelvstendigNaerinsdrivende } from 'app/models/types';
import {
    getSoknad,
    hentPerioderFraK9Sak,
    resetPunchFormAction,
    resetSoknadAction,
    setJournalpostPaaVentResetAction,
    setSignaturAction,
    settJournalpostPaaVent,
    submitSoknad,
    undoChoiceOfEksisterendeSoknadAction,
    updateSoknad,
    validerSoknad,
    validerSoknadResetAction,
} from 'app/state/actions';
import { nummerPrefiks } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';

import { NavigateFunction, useNavigate, useParams } from 'react-router-dom';
import JournalposterSync from 'app/components/JournalposterSync';
import { ROUTES } from 'app/constants/routes';
import { resetAllStateAction } from 'app/state/actions/GlobalActions';
import { setIdentFellesAction } from 'app/state/actions/IdentActions';
import Feilmelding from '../../../components/Feilmelding';
import VerticalSpacer from '../../../components/VerticalSpacer';
import { BeredskapNattevaak } from '../../../models/enums/BeredskapNattevaak';
import { JaNeiIkkeOpplyst } from '../../../models/enums/JaNeiIkkeOpplyst';
import { JaNeiIkkeRelevant } from '../../../models/enums/JaNeiIkkeRelevant';
import { PunchFormPaneler } from '../../../models/enums/PunchFormPaneler';
import { RelasjonTilBarnet } from '../../../models/enums/RelasjonTilBarnet';
import { Virksomhetstyper } from '../../../models/enums/Virksomhetstyper';
import { Arbeidstaker } from '../../../models/types/Arbeidstaker';
import { ArbeidstidInfo } from '../../../models/types/ArbeidstidInfo';
import { FrilanserOpptjening } from '../../../models/types/FrilanserOpptjening';
import { IIdentState } from '../../../models/types/IdentState';
import { IJournalposterPerIdentState } from '../../../models/types/Journalpost/JournalposterPerIdentState';
import { IPSBSoknad, PSBSoknad, Tilleggsinformasjon } from '../../../models/types/PSBSoknad';
import { IPSBSoknadUt, PSBSoknadUt } from '../../../models/types/PSBSoknadUt';
import { IPeriode } from '../../../models/types/Periode';
import { SelvstendigNaeringsdrivendeOpptjening } from '../../../models/types/SelvstendigNaeringsdrivendeOpptjening';
import { IUtenlandsOpphold } from '../../../models/types/UtenlandsOpphold';
import { RootStateType } from '../../../state/RootState';
import { initializeDate } from '../../../utils/timeUtils';
import ErDuSikkerModal from '../../../components/ErDuSikkerModal';
import OkGåTilLosModal from '../../../components/okGåTilLosModal/OkGåTilLosModal';
import ArbeidsforholdPanel from './Arbeidsforhold/ArbeidsforholdPanel';
import EndringAvSøknadsperioder from './EndringAvSøknadsperioder/EndringAvSøknadsperioder';
import OpplysningerOmSoknad from './OpplysningerOmSoknad/OpplysningerOmSoknad';
import Soknadsperioder from './Soknadsperioder/Soknadsperioder';
import { PeriodeinfoPaneler } from '../../../components/periodeinfoPaneler/PeriodeinfoPaneler';
import { Periodepaneler } from '../../../components/Periodepaneler';
import SettPaaVentModal from '../../../components/settPåVentModal/SettPåVentModal';
import PSBSoknadKvittering from './SoknadKvittering/SoknadKvittering';
import PSBKvitteringContainer from './SoknadKvittering/SoknadKvitteringContainer';
import { Utenlandsopphold } from './Utenlandsopphold/Utenlandsopphold';
import { pfLand } from '../components/pfLand';
import { pfTilleggsinformasjon } from '../components/pfTilleggsinformasjon';
import { IFellesState } from 'app/state/reducers/FellesReducer';
import ErrorModal from 'app/fordeling/Komponenter/ErrorModal';

export interface IPunchFormComponentProps {
    journalpostid: string;
    id: string;
    navigate: NavigateFunction;
}

export interface IPunchFormStateProps {
    punchFormState: IPunchPSBFormState;
    signaturState: ISignaturState;
    journalposterState: IJournalposterPerIdentState;
    identState: IIdentState;
    fellesState: IFellesState;
}

function withHooks<P>(Component: ComponentType<IPunchFormComponentProps>) {
    return (props: P) => {
        const { id, journalpostid } = useParams();
        const navigate = useNavigate();
        return <Component {...props} id={id!} journalpostid={journalpostid!} navigate={navigate} />;
    };
}

export interface IPunchFormDispatchProps {
    getSoknad: typeof getSoknad;
    hentPerioder: typeof hentPerioderFraK9Sak;
    resetSoknadAction: typeof resetSoknadAction;
    updateSoknad: typeof updateSoknad;
    submitSoknad: typeof submitSoknad;
    resetPunchFormAction: typeof resetPunchFormAction;
    resetAllStateAction: typeof resetAllStateAction;
    setSignaturAction: typeof setSignaturAction;
    settJournalpostPaaVent: typeof settJournalpostPaaVent;
    settPaaventResetAction: typeof setJournalpostPaaVentResetAction;
    validateSoknad: typeof validerSoknad;
    validerSoknadReset: typeof validerSoknadResetAction;
}

export interface IPunchFormComponentState {
    soknad: IPSBSoknad;
    perioder?: IPeriode;
    isFetched: boolean;
    showStatus: boolean;
    faktiskeTimer?: string[][];
    iTilsynsordning?: boolean;
    iUtlandet?: JaNeiIkkeOpplyst;
    skalHaFerie?: JaNeiIkkeOpplyst;
    arbeidstaker?: boolean;
    frilanser?: boolean;
    selvstendigNæringsdrivende?: boolean;
    expandAll: boolean;
    frilanserStartdato?: string;
    jobberFortsattSomFrilanser?: JaNei;
    barnetSkalLeggesInn?: JaNei;
    innleggelseUtlandet?: IPeriode[];
    harBoddIUtlandet?: JaNeiIkkeOpplyst;
    skalBoIUtlandet?: JaNeiIkkeOpplyst;
    medlemskap?: IUtenlandsOpphold[];
    aapnePaneler: PunchFormPaneler[];
    showSettPaaVentModal: boolean;
    visErDuSikkerModal: boolean;
    errors?: IInputError[];
    harRegnskapsfører?: boolean;
    feilmeldingStier: Set<string>;
    harForsoektAaSendeInn: boolean;
}

type IPunchFormProps = IPunchFormComponentProps &
    WrappedComponentProps &
    IPunchFormStateProps &
    IPunchFormDispatchProps;

export class PunchFormComponent extends React.Component<IPunchFormProps, IPunchFormComponentState> {
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

    private initialTillegsinfo = new Tilleggsinformasjon({
        periode: this.initialPeriode,
        tilleggsinformasjon: '',
    });

    constructor(props: IPunchFormProps) {
        super(props);
        this.state = {
            soknad: {
                soeknadId: '',
                soekerId: '',
                mottattDato: '',
                journalposter: new Set([]),
                barn: {
                    norskIdent: '',
                    foedselsdato: '',
                },
                opptjeningAktivitet: {},
                arbeidstid: {},
                tilsynsordning: {},
                omsorg: {},
                harInfoSomIkkeKanPunsjes: false,
                harMedisinskeOpplysninger: false,
                soeknadsperiode: [],
            },
            isFetched: false,
            showStatus: false,
            expandAll: false,
            aapnePaneler: [],
            showSettPaaVentModal: false,
            visErDuSikkerModal: false,
            feilmeldingStier: new Set(),
            harForsoektAaSendeInn: false,
        };
    }

    componentDidMount() {
        const { id } = this.props;
        this.props.getSoknad(id);
        this.setState((prevState) => {
            const updatedFeilmeldingStier = new Set(prevState.feilmeldingStier); // Create a copy of the previous state

            if (!updatedFeilmeldingStier.has('mottattDato')) {
                updatedFeilmeldingStier.add('mottattDato'); // Add 'mottattDato' if it doesn't exist
            }
            if (!updatedFeilmeldingStier.has('klokkeslett')) {
                updatedFeilmeldingStier.add('klokkeslett'); // Add 'klokkeslett' if it doesn't exist
            }

            return { feilmeldingStier: updatedFeilmeldingStier }; // Update state with the modified Set
        });

        // henter Søker og Pleietrengende identer fra jp etter sideoppdatering, fordi identState kan være tom
        const søkerId = this.props.identState.søkerId || this.props.fellesState.journalpost?.norskIdent;
        const pleietrengendeId =
            this.props.identState.pleietrengendeId || this.props.fellesState.journalpost?.sak?.pleietrengendeIdent;

        if (søkerId && pleietrengendeId) {
            this.props.hentPerioder(søkerId, pleietrengendeId);
        }
    }

    componentDidUpdate() {
        const { soknad } = this.props.punchFormState;
        // this.props.updateJournalposter(this.state.soknad.journalposter);
        if (soknad && !this.state.isFetched) {
            this.setState({
                soknad: new PSBSoknad(this.props.punchFormState.soknad as IPSBSoknad),
                isFetched: true,
                iTilsynsordning: !!this.props.punchFormState.soknad?.tilsynsordning?.perioder?.length,
                aapnePaneler: this.getÅpnePanelerVedStart(this.props.punchFormState.soknad as IPSBSoknad),
            });
            if (!soknad.barn || !soknad.barn.norskIdent || soknad.barn.norskIdent === '') {
                this.updateSoknad({ barn: { norskIdent: this.props.identState.pleietrengendeId || '' } });
            }
        }
    }

    componentWillUnmount() {
        this.props.resetSoknadAction();
        this.props.resetPunchFormAction();
        this.props.validerSoknadReset();
    }

    private handleSubmit = () => {
        const navarandeSoknad: IPSBSoknad = this.state.soknad;
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
        this.setState((prevState) => {
            const { aapnePaneler } = prevState;
            if (aapnePaneler.includes(p)) {
                return { aapnePaneler: aapnePaneler.filter((panel) => panel !== p) };
            }
            return { aapnePaneler: [...aapnePaneler, p] };
        });
    };

    private getÅpnePanelerVedStart = (soknad: Partial<IPSBSoknad>) => {
        const åpnePaneler = new Set(this.state.aapnePaneler);

        const panelConditions = [
            { panel: PunchFormPaneler.ENDRING_AV_SØKNADSPERIODER, condition: !!soknad.trekkKravPerioder?.length },
            { panel: PunchFormPaneler.UTENLANDSOPPHOLD, condition: !!soknad.utenlandsopphold?.length },
            {
                panel: PunchFormPaneler.FERIE,
                condition: !!(soknad.lovbestemtFerie?.length || soknad.lovbestemtFerieSomSkalSlettes?.length),
            },
            {
                panel: PunchFormPaneler.ARBEID,
                condition: !!(
                    soknad.arbeidstid?.arbeidstakerList?.length ||
                    soknad.opptjeningAktivitet?.frilanser ||
                    soknad.opptjeningAktivitet?.selvstendigNaeringsdrivende ||
                    soknad.lovbestemtFerieSomSkalSlettes?.length
                ),
            },
            { panel: PunchFormPaneler.OPPLYSINGER_OM_SOKER, condition: !!soknad.omsorg?.relasjonTilBarnet },
            { panel: PunchFormPaneler.OMSORGSTILBUD, condition: !!soknad.tilsynsordning?.perioder?.length },
            {
                panel: PunchFormPaneler.BEREDSKAPNATTEVAAK,
                condition: !!(soknad.beredskap?.length || soknad.nattevaak?.length),
            },
            { panel: PunchFormPaneler.MEDLEMSKAP, condition: !!soknad.bosteder?.length },
        ];

        panelConditions.forEach(({ panel, condition }) => {
            if (condition && !åpnePaneler.has(panel)) {
                åpnePaneler.add(panel);
            }
        });

        return Array.from(åpnePaneler);
    };

    private checkOpenState = (p: PunchFormPaneler): boolean => {
        const { aapnePaneler, expandAll } = this.state;
        const hasInputErrors = this.props.punchFormState.inputErrors?.length;

        if (hasInputErrors) {
            return true;
        }

        const isPanelOpen = aapnePaneler.some((panel) => panel === p);
        return expandAll || isPanelOpen;
    };

    private updateVirksomhetstyper = (virksomhet: Virksomhetstyper, checked: boolean) => {
        const { soknad } = this.state;
        const { selvstendigNaeringsdrivende } = soknad.opptjeningAktivitet;
        const virksomhetstyper = selvstendigNaeringsdrivende?.info?.virksomhetstyper || [];

        const updatedVirksomhetstyper = checked
            ? [...virksomhetstyper, virksomhet]
            : virksomhetstyper.filter((vtype) => vtype !== virksomhet);

        const updatedSoknad = {
            ...soknad,
            opptjeningAktivitet: {
                ...soknad.opptjeningAktivitet,
                selvstendigNaeringsdrivende: {
                    ...selvstendigNaeringsdrivende,
                    info: {
                        ...selvstendigNaeringsdrivende?.info,
                        virksomhetstyper: updatedVirksomhetstyper,
                    },
                },
            },
        };

        this.updateSoknadState(updatedSoknad);
        this.updateSoknad(updatedSoknad);
    };

    private handleArbeidsforholdChange = (arbeidsforhold: Arbeidsforhold, checked: boolean) => {
        let updatedSoknad = null;

        switch (arbeidsforhold) {
            case Arbeidsforhold.ARBEIDSTAKER:
                updatedSoknad = {
                    ...this.state.soknad,
                    arbeidstid: {
                        ...this.state.soknad.arbeidstid,
                        arbeidstakerList:
                            checked &&
                            (!this.state.soknad.arbeidstid || !this.state.soknad.arbeidstid.arbeidstakerList?.length)
                                ? [this.initialArbeidstaker]
                                : [],
                    },
                };
                break;
            case Arbeidsforhold.FRILANSER:
                updatedSoknad = {
                    arbeidstid: {
                        ...this.state.soknad.arbeidstid,
                        frilanserArbeidstidInfo:
                            checked &&
                            (!this.state.soknad.arbeidstid || !this.state.soknad.arbeidstid.frilanserArbeidstidInfo)
                                ? new ArbeidstidInfo({})
                                : null,
                    },
                    opptjeningAktivitet: {
                        ...this.state.soknad.opptjeningAktivitet,
                        frilanser: checked ? this.initialFrilanser : null,
                    },
                };
                break;
            case Arbeidsforhold.SELVSTENDIG:
                updatedSoknad = {
                    opptjeningAktivitet: {
                        ...this.state.soknad.opptjeningAktivitet,
                        selvstendigNaeringsdrivende:
                            checked &&
                            (!this.state.soknad.opptjeningAktivitet ||
                                !this.state.soknad.opptjeningAktivitet.selvstendigNaeringsdrivende)
                                ? this.initialSelvstendigNæringsdrivendeOpptjening
                                : null,
                    },
                    arbeidstid: {
                        ...this.state.soknad.arbeidstid,
                        selvstendigNæringsdrivendeArbeidstidInfo: checked ? new ArbeidstidInfo({}) : null,
                    },
                };
                break;
            default:
                break;
        }

        if (updatedSoknad) {
            this.updateSoknadState(updatedSoknad);
            if (!checked) {
                this.updateSoknad(updatedSoknad);
            }
        }
    };

    private handleBeredskapNattevåkChange = (beredskapNattevaak: BeredskapNattevaak, checked: boolean) => {
        let updatedSoknad = null;

        switch (beredskapNattevaak) {
            case BeredskapNattevaak.BEREDSKAP:
                updatedSoknad = { beredskap: checked ? [this.initialTillegsinfo] : [] };
                break;
            case BeredskapNattevaak.NATTEVAAK:
                updatedSoknad = { nattevaak: checked ? [this.initialTillegsinfo] : [] };
                break;
            default:
                break;
        }

        if (updatedSoknad) {
            this.updateSoknadState(updatedSoknad);
            if (!checked) {
                this.updateSoknad(updatedSoknad);
            }
        }
    };

    private updateUtenlandsopphold = (jaNeiIkkeOpplyst: JaNeiIkkeOpplyst) => {
        if (jaNeiIkkeOpplyst === JaNeiIkkeOpplyst.JA) {
            const utenlandsopphold = [{ land: undefined, periode: {} }];
            this.updateSoknadState({ utenlandsopphold, utenlandsoppholdV2: [] });
            this.updateSoknad({ utenlandsopphold, utenlandsoppholdV2: [] });
        }

        if (jaNeiIkkeOpplyst === JaNeiIkkeOpplyst.NEI) {
            const updatedSoknad = { utenlandsopphold: [], utenlandsoppholdV2: [] };
            this.updateSoknadState(updatedSoknad, true);
            this.updateSoknad(updatedSoknad);
        }

        if (jaNeiIkkeOpplyst === JaNeiIkkeOpplyst.IKKE_OPPLYST) {
            const updatedSoknad = { utenlandsopphold: undefined, utenlandsoppholdV2: undefined };
            this.updateSoknadState(updatedSoknad, true);
            this.updateSoknad(updatedSoknad);
        }
    };

    private utenlandsOppholdCheckedValue = () => {
        if (!this.state.soknad.utenlandsopphold || this.state.soknad.utenlandsopphold === null) {
            return JaNeiIkkeOpplyst.IKKE_OPPLYST;
        }
        if (this.state.soknad.utenlandsopphold.length) {
            return JaNeiIkkeOpplyst.JA;
        }
        return JaNeiIkkeOpplyst.NEI;
    };

    private handleMedlemskapChange = (jaNei: JaNeiIkkeOpplyst) => {
        let updatedBosteder;

        if (
            jaNei === JaNeiIkkeOpplyst.JA &&
            (!this.state.soknad.bosteder || this.state.soknad.bosteder?.length === 0)
        ) {
            updatedBosteder = [{ periode: this.initialPeriode, land: '' }];
        } else if (jaNei === JaNeiIkkeOpplyst.NEI) {
            updatedBosteder = [];
        } else if (jaNei === JaNeiIkkeOpplyst.IKKE_OPPLYST) {
            updatedBosteder = undefined;
        }

        const updatedSoknad = {
            ...this.state.soknad,
            bosteder: updatedBosteder,
        };

        this.updateSoknadState(updatedSoknad, jaNei !== JaNeiIkkeOpplyst.JA);
        this.updateSoknad(updatedSoknad);
    };

    private medlemskapCheckedValue = () => {
        if (!this.state.soknad.bosteder || this.state.soknad.bosteder === null) {
            return JaNeiIkkeOpplyst.IKKE_OPPLYST;
        }
        if (this.state.soknad.bosteder.length) {
            return JaNeiIkkeOpplyst.JA;
        }
        return JaNeiIkkeOpplyst.NEI;
    };

    private handleFrilanserChange = (jaNei: JaNei) => {
        const jobberFortsattSomFrilans = jaNei === JaNei.JA;
        const frilanserArbeidstidInfo = jobberFortsattSomFrilans ? new ArbeidstidInfo({}) : {};

        const updatedSoknad = {
            arbeidstid: {
                ...this.state.soknad.arbeidstid,
                frilanserArbeidstidInfo,
            },
            opptjeningAktivitet: {
                ...this.state.soknad.opptjeningAktivitet,
                frilanser: {
                    ...this.state.soknad.opptjeningAktivitet.frilanser,
                    jobberFortsattSomFrilans,
                    sluttdato: jobberFortsattSomFrilans
                        ? undefined
                        : this.state.soknad.opptjeningAktivitet.frilanser?.sluttdato,
                },
            },
        };

        this.updateSoknadState(updatedSoknad);
        this.updateSoknad(updatedSoknad);
    };

    private updateSkalHaFerie = (checked: boolean) => {
        if (checked && this.state.soknad.lovbestemtFerie?.length === 0) {
            this.addSkalHaFerie();
        } else {
            const updatedSoknad = { lovbestemtFerie: [] };
            this.updateSoknadState(updatedSoknad, true);
            this.updateSoknad(updatedSoknad);
        }
    };

    private updateIkkeSkalHaFerie = (checked: boolean) => {
        const { aapnePaneler } = this.state;

        if (checked) {
            if (!aapnePaneler.includes(PunchFormPaneler.ARBEID)) {
                aapnePaneler.push(PunchFormPaneler.ARBEID);
            }

            if (this.state.soknad.lovbestemtFerieSomSkalSlettes?.length === 0) {
                this.addIkkeSkalHaFerie();
            }
        } else {
            if (aapnePaneler.includes(PunchFormPaneler.ARBEID)) {
                aapnePaneler.splice(aapnePaneler.indexOf(PunchFormPaneler.ARBEID), 1);
            }

            const updatedSoknad = { lovbestemtFerieSomSkalSlettes: [] };
            this.updateSoknadState(updatedSoknad, true);
            this.updateSoknad(updatedSoknad);
        }
    };

    private addSkalHaFerie = () => {
        const { soknad } = this.state;
        const lovbestemtFerie = soknad.lovbestemtFerie || [];
        const updatedFerie = [...lovbestemtFerie, { fom: '', tom: '' }];

        const updatedSoknad = {
            ...soknad,
            lovbestemtFerie: updatedFerie,
        };

        this.updateSoknadState(updatedSoknad);
        this.updateSoknad(updatedSoknad);
    };

    private addIkkeSkalHaFerie = () => {
        const { soknad } = this.state;
        const lovbestemtFerieSomSkalSlettes = soknad.lovbestemtFerieSomSkalSlettes || [];
        const updatedFerie = [...lovbestemtFerieSomSkalSlettes, { fom: '', tom: '' }];

        const updatedSoknad = {
            ...soknad,
            lovbestemtFerieSomSkalSlettes: updatedFerie,
        };

        this.updateSoknadState(updatedSoknad);
        this.updateSoknad(updatedSoknad);
    };

    private updateOmsorgstilbud = (checked: boolean) => {
        this.setState({
            iTilsynsordning: checked,
        });

        if (!checked) {
            this.updateSoknadState({ tilsynsordning: undefined }, true);
            this.updateSoknad({ tilsynsordning: undefined });
        }
    };

    private updateMedisinskeOpplysninger = (checked: boolean) => {
        this.updateSoknadState({ harMedisinskeOpplysninger: !!checked }, true);
        this.updateSoknad({ harMedisinskeOpplysninger: !!checked });
    };

    private updateOpplysningerIkkeKanPunsjes = (checked: boolean) => {
        this.updateSoknadState({ harInfoSomIkkeKanPunsjes: !!checked }, true);
        this.updateSoknad({ harInfoSomIkkeKanPunsjes: !!checked });
    };

    private getSoknadFromStore = () => new PSBSoknadUt(this.props.punchFormState.soknad as IPSBSoknadUt);

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

    private getUhåndterteFeil = (attribute: string): (string | undefined)[] => {
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

        const erFremITid = (dato: string) => new Date() < new Date(dato);

        if (attribute === 'klokkeslett' || attribute === 'mottattDato') {
            if (klokkeslett === null || klokkeslett === '' || mottattDato === null || mottattDato === '') {
                return intlHelper(this.props.intl, 'skjema.feil.ikketom');
            }
        }

        if (attribute === 'mottattDato' && mottattDato && erFremITid(mottattDato!)) {
            return intlHelper(this.props.intl, 'skjema.feil.ikkefremitid');
        }

        if (attribute === 'klokkeslett' && klokkeslett && this.erFremITidKlokkeslett(klokkeslett!)) {
            return intlHelper(this.props.intl, 'skjema.feil.ikkefremitid');
        }

        if (attribute.includes('endringAvSøknadsperioder.perioder') && indeks !== undefined) {
            const newAttr = `ytelse.trekkKravPerioder[${indeks}]`;

            const feilmelding = this.getManglerFromStore()?.filter((m: IInputError) => m.felt?.includes(newAttr))?.[0]
                ?.feilmelding;
            return feilmelding;
        }

        if (attribute === 'alleTrekkKravPerioderFeilmelding') {
            const newAttr = `ytelse.trekkKravPerioder.perioder`;
            const feilmelding = this.getManglerFromStore()?.filter((m: IInputError) => m.felt === newAttr)?.[0]
                ?.feilmelding;
            return feilmelding;
        }

        const regex = /\[\d+\]/;
        if (attribute.includes('ytelse.søknadsperiode') && regex.test(attribute) && indeks !== undefined) {
            const newAttr = `ytelse.søknadsperiode[${indeks}]`;

            const feilmelding = this.getManglerFromStore()?.filter((m: IInputError) => m.felt?.includes(newAttr))?.[0]
                ?.feilmelding;
            return feilmelding;
        }

        if (attribute === 'ytelse.uttak.perioder') {
            const newAttr = `ytelse.søknadsperiode.perioder`;
            const feilmelding = this.getManglerFromStore()?.filter((m: IInputError) => m.felt === newAttr)?.[0]
                ?.feilmelding;
            return feilmelding;
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

    private updateSoknadState = (soknad: Partial<IPSBSoknad>, showStatus?: boolean) => {
        this.state.soknad.journalposter!.add(this.props.journalpostid);
        this.setState((prevState) => ({
            soknad: { ...prevState.soknad, ...soknad },
            showStatus: !!showStatus,
        }));
    };

    private updateSoknadStateCallbackFunction = (soknad: Partial<IPSBSoknad>) => {
        this.updateSoknadState(soknad);
    };

    private updateSoknad = (soknad: Partial<IPSBSoknad>) => {
        this.setState({ showStatus: true });
        const navarandeSoknad: PSBSoknadUt = this.getSoknadFromStore();
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

    private changeAndBlurUpdatesSoknad = (change: (event: any) => Partial<IPSBSoknad>) => ({
        onChange: (event: any) => this.updateSoknadState(change(event), false),
        onBlur: (event: any) => this.updateSoknad(change(event)),
    });

    private statusetikett = () => {
        if (!this.state.showStatus) {
            return null;
        }

        const { punchFormState } = this.props;
        const className = 'absolute top-[60px] left-4 z-5';

        if (punchFormState.isAwaitingUpdateResponse) {
            return (
                <Tag variant="warning" className={className}>
                    <FormattedMessage id="skjema.isAwaitingUpdateResponse" />
                </Tag>
            );
        }
        if (punchFormState.updateSoknadError) {
            return (
                <Tag variant="error" className={className}>
                    <FormattedMessage id="skjema.updateSoknadError" />
                </Tag>
            );
        }
        return (
            <Tag variant="success" className={className}>
                <FormattedMessage id="skjema.updateSoknadSuccess" />
            </Tag>
        );
    };

    render() {
        const { intl, punchFormState, signaturState } = this.props;

        const soknad = new PSBSoknad(this.state.soknad);
        const { signert } = signaturState;
        const eksisterendePerioder = punchFormState.perioder || [];

        if (punchFormState.isComplete && punchFormState.innsentSoknad) {
            return <PSBKvitteringContainer />;
        }
        if (punchFormState.isSoknadLoading) {
            return <Loader size="large" />;
        }

        if (punchFormState.error) {
            return (
                <>
                    <Alert variant="error">
                        <FormattedMessage id="skjema.feil.ikke_funnet" values={{ id: this.props.id }} />
                    </Alert>

                    <p>
                        <Button variant="secondary" onClick={this.handleStartButtonClick}>
                            <FormattedMessage id="skjema.knapp.tilstart" />
                        </Button>
                    </p>
                </>
            );
        }

        if (!soknad) {
            return null;
        }

        const initialUtenlandsopphold: IUtenlandsOpphold = { land: '', innleggelsesperioder: [] };

        const beredskapperioder = () => (
            <PeriodeinfoPaneler
                periods={soknad.beredskap}
                panelid={(i) => `beredskapspanel_${i}`}
                initialPeriodeinfo={this.initialTillegsinfo}
                component={pfTilleggsinformasjon('beredskap')}
                editSoknad={(beredskap) => this.updateSoknad({ beredskap })}
                editSoknadState={(beredskap, showStatus) => this.updateSoknadState({ beredskap }, showStatus)}
                textLeggTil="skjema.beredskap.leggtilperiode"
                textFjern="skjema.beredskap.fjernperiode"
                className="beredskapsperioder"
                panelClassName="beredskapspanel"
                getErrorMessage={this.getErrorMessage}
                getUhaandterteFeil={this.getUhåndterteFeil}
                feilkodeprefiks="ytelse.beredskap"
                kanHaFlere
                medSlettKnapp={false}
            />
        );

        const nattevaakperioder = () => (
            <PeriodeinfoPaneler
                periods={soknad.nattevaak}
                panelid={(i) => `nattevaakspanel_${i}`}
                initialPeriodeinfo={this.initialTillegsinfo}
                component={pfTilleggsinformasjon('nattevaak')}
                editSoknad={(nattevaak) => this.updateSoknad({ nattevaak })}
                editSoknadState={(nattevaak, showStatus) => this.updateSoknadState({ nattevaak }, showStatus)}
                textLeggTil="skjema.nattevaak.leggtilperiode"
                textFjern="skjema.nattevaak.fjernperiode"
                className="nattevaaksperioder"
                panelClassName="nattevaakspanel"
                getErrorMessage={this.getErrorMessage}
                getUhaandterteFeil={this.getUhåndterteFeil}
                feilkodeprefiks="ytelse.nattevåk"
                kanHaFlere
                medSlettKnapp={false}
            />
        );

        return (
            <div data-testid="PSBPunchForm">
                <JournalposterSync journalposter={this.state.soknad.journalposter} />

                {this.statusetikett()}

                <VerticalSpacer sixteenPx />

                <Soknadsperioder
                    updateSoknadState={this.updateSoknadStateCallbackFunction}
                    updateSoknad={this.updateSoknad}
                    initialPeriode={this.initialPeriode}
                    getErrorMessage={this.getErrorMessage}
                    getUhaandterteFeil={this.getUhåndterteFeil}
                    soknad={soknad}
                    punchFormState={punchFormState}
                />

                <VerticalSpacer sixteenPx />

                <OpplysningerOmSoknad
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
                    }}
                >
                    <FormattedMessage id="skjema.ekspander" />
                </Checkbox>

                <VerticalSpacer sixteenPx />

                <Accordion>
                    <EndringAvSøknadsperioder
                        isOpen={this.checkOpenState(PunchFormPaneler.ENDRING_AV_SØKNADSPERIODER)}
                        onClick={() => this.handlePanelClick(PunchFormPaneler.ENDRING_AV_SØKNADSPERIODER)}
                        getErrorMessage={this.getErrorMessage}
                        soknad={soknad}
                        updateSoknad={this.updateSoknad}
                        updateSoknadState={this.updateSoknadState}
                        eksisterendePerioder={eksisterendePerioder}
                    />

                    <Accordion.Item
                        open={this.checkOpenState(PunchFormPaneler.UTENLANDSOPPHOLD)}
                        onOpenChange={() => this.handlePanelClick(PunchFormPaneler.UTENLANDSOPPHOLD)}
                        data-testid="accordionItem-utenlandsoppholdpanel"
                    >
                        <Accordion.Header>
                            <FormattedMessage id={PunchFormPaneler.UTENLANDSOPPHOLD} />
                        </Accordion.Header>

                        <Accordion.Content>
                            <RadioPanelGruppe
                                className="horizontalRadios"
                                radios={Object.values(JaNeiIkkeOpplyst).map((jnv) => ({
                                    label: intlHelper(intl, jnv),
                                    value: jnv,
                                }))}
                                name="utlandjaneiikeeopplyst"
                                legend={<FormattedMessage id="skjema.utenlandsopphold.label" />}
                                onChange={(event) =>
                                    this.updateUtenlandsopphold(
                                        (event.target as HTMLInputElement).value as JaNeiIkkeOpplyst,
                                    )
                                }
                                checked={this.utenlandsOppholdCheckedValue()}
                            />

                            {(!!soknad.utenlandsopphold?.length || !!soknad.utenlandsoppholdV2.length) && (
                                <Utenlandsopphold
                                    intl={intl}
                                    periods={
                                        soknad.utenlandsoppholdV2.length > 0
                                            ? soknad.utenlandsoppholdV2
                                            : soknad.utenlandsopphold || []
                                    }
                                    component={pfLand()}
                                    panelid={(i) => `utenlandsoppholdpanel_${i}`}
                                    initialPeriodeinfo={initialUtenlandsopphold}
                                    editSoknad={(perioder) => {
                                        this.updateSoknad({ utenlandsopphold: perioder, utenlandsoppholdV2: perioder });
                                    }}
                                    editSoknadState={(perioder, showStatus) => {
                                        this.updateSoknadState(
                                            { utenlandsopphold: perioder, utenlandsoppholdV2: perioder },
                                            showStatus,
                                        );
                                    }}
                                    textLeggTil="skjema.perioder.legg_til"
                                    textFjern="skjema.perioder.fjern"
                                    className="utenlandsopphold"
                                    panelClassName="utenlandsoppholdpanel"
                                    getErrorMessage={this.getErrorMessage}
                                    getUhaandterteFeil={this.getUhåndterteFeil}
                                    feilkodeprefiks="ytelse.utenlandsopphold"
                                    kanHaFlere
                                    medSlettKnapp={false}
                                />
                            )}
                        </Accordion.Content>
                    </Accordion.Item>

                    <Accordion.Item
                        open={this.checkOpenState(PunchFormPaneler.FERIE)}
                        onOpenChange={() => this.handlePanelClick(PunchFormPaneler.FERIE)}
                        data-testid="accordionItem-feriepanel"
                    >
                        <Accordion.Header>
                            <FormattedMessage id={PunchFormPaneler.FERIE} />
                        </Accordion.Header>

                        <Accordion.Content>
                            <CheckboksPanel
                                label={<FormattedMessage id="skjema.ferie.leggtil" />}
                                onChange={(e) => this.updateSkalHaFerie(e.target.checked)}
                                checked={!!soknad.lovbestemtFerie.length}
                                data-testid="feriepanel-checkbox"
                            />

                            {!!soknad.lovbestemtFerie.length && (
                                <Periodepaneler
                                    periods={soknad.lovbestemtFerie}
                                    initialPeriode={this.initialPeriode}
                                    editSoknad={(perioder) => this.updateSoknad({ lovbestemtFerie: perioder })}
                                    editSoknadState={(perioder, showStatus) =>
                                        this.updateSoknadState({ lovbestemtFerie: perioder }, showStatus)
                                    }
                                    getErrorMessage={this.getErrorMessage}
                                    getUhaandterteFeil={this.getUhåndterteFeil}
                                    feilkodeprefiks="ytelse.lovbestemtFerie"
                                    kanHaFlere
                                    doNotShowBorders
                                />
                            )}

                            <VerticalSpacer eightPx />

                            {eksisterendePerioder &&
                                eksisterendePerioder?.length > 0 &&
                                !punchFormState.hentPerioderError && (
                                    <>
                                        <CheckboksPanel
                                            label={<FormattedMessage id="skjema.ferie.fjern" />}
                                            onChange={(e) => this.updateIkkeSkalHaFerie(e.target.checked)}
                                            checked={!!soknad.lovbestemtFerieSomSkalSlettes.length}
                                        />

                                        {!!soknad.lovbestemtFerieSomSkalSlettes.length && (
                                            <>
                                                <Alert size="small" variant="info">
                                                    <FormattedMessage id="skjema.ferie.fjern.info" />
                                                </Alert>

                                                <Periodepaneler
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
                                                    getUhaandterteFeil={this.getUhåndterteFeil}
                                                    feilkodeprefiks="ytelse.lovbestemtFerie"
                                                    kanHaFlere
                                                />
                                            </>
                                        )}
                                    </>
                                )}
                        </Accordion.Content>
                    </Accordion.Item>

                    <ArbeidsforholdPanel
                        isOpen={this.checkOpenState(PunchFormPaneler.ARBEID)}
                        onPanelClick={() => this.handlePanelClick(PunchFormPaneler.ARBEID)}
                        handleArbeidsforholdChange={this.handleArbeidsforholdChange}
                        soknad={soknad}
                        initialArbeidstaker={this.initialArbeidstaker}
                        updateSoknad={this.updateSoknad}
                        updateSoknadState={this.updateSoknadState}
                        getErrorMessage={this.getErrorMessage}
                        getUhaandterteFeil={this.getUhåndterteFeil}
                        handleFrilanserChange={this.handleFrilanserChange}
                        updateVirksomhetstyper={this.updateVirksomhetstyper}
                        eksisterendePerioder={eksisterendePerioder}
                    />

                    <Accordion.Item
                        open={this.checkOpenState(PunchFormPaneler.OPPLYSINGER_OM_SOKER)}
                        onOpenChange={() => this.handlePanelClick(PunchFormPaneler.OPPLYSINGER_OM_SOKER)}
                        data-testid="accordionItem-opplysningeromsokerpanel"
                    >
                        <Accordion.Header>
                            <FormattedMessage id={PunchFormPaneler.OPPLYSINGER_OM_SOKER} />
                        </Accordion.Header>

                        <Accordion.Content>
                            <Select
                                value={soknad.omsorg.relasjonTilBarnet}
                                label={<FormattedMessage id="skjema.relasjontilbarnet" />}
                                {...this.changeAndBlurUpdatesSoknad((event) => ({
                                    omsorg: { ...soknad.omsorg, relasjonTilBarnet: event.target.value },
                                }))}
                            >
                                {Object.values(RelasjonTilBarnet).map((rel) => (
                                    <option key={rel} value={rel}>
                                        {rel}
                                    </option>
                                ))}
                            </Select>

                            {soknad.omsorg.relasjonTilBarnet === RelasjonTilBarnet.ANNET && (
                                <TextField
                                    label={<FormattedMessage id="skjema.omsorg.beskrivelse" />}
                                    className="beskrivelseAvOmsorgsrollen"
                                    value={soknad.omsorg.beskrivelseAvOmsorgsrollen}
                                    {...this.changeAndBlurUpdatesSoknad((event) => ({
                                        omsorg: { ...soknad.omsorg, beskrivelseAvOmsorgsrollen: event.target.value },
                                    }))}
                                />
                            )}
                        </Accordion.Content>
                    </Accordion.Item>

                    <Accordion.Item
                        open={this.checkOpenState(PunchFormPaneler.OMSORGSTILBUD)}
                        onOpenChange={() => this.handlePanelClick(PunchFormPaneler.OMSORGSTILBUD)}
                        data-testid="accordionItem-omsorgstilbudpanel"
                    >
                        <Accordion.Header>
                            <FormattedMessage id={PunchFormPaneler.OMSORGSTILBUD} />
                        </Accordion.Header>

                        <Accordion.Content>
                            <CheckboksPanel
                                label={<FormattedMessage id="skjema.omsorgstilbud.checkboks" />}
                                onChange={(e) => this.updateOmsorgstilbud(e.target.checked)}
                                checked={!!this.state.iTilsynsordning}
                                data-testid="omsorgstilbud-checkboks"
                            />

                            {this.state.iTilsynsordning && (
                                <>
                                    <VerticalSpacer twentyPx />

                                    <div className="listepanel">
                                        <TilsynKalender
                                            nyeSoknadsperioder={soknad.soeknadsperiode}
                                            eksisterendeSoknadsperioder={eksisterendePerioder}
                                            updateSoknad={(perioder) => {
                                                this.updateSoknad({
                                                    tilsynsordning: set(soknad.tilsynsordning, 'perioder', perioder),
                                                });
                                            }}
                                            updateSoknadState={(perioder) =>
                                                this.updateSoknadState(
                                                    {
                                                        tilsynsordning: set(
                                                            soknad.tilsynsordning,
                                                            'perioder',
                                                            perioder,
                                                        ),
                                                    },
                                                    true,
                                                )
                                            }
                                            perioderMedTimer={soknad.tilsynsordning.perioder}
                                        />
                                    </div>
                                </>
                            )}
                        </Accordion.Content>
                    </Accordion.Item>

                    <Accordion.Item
                        open={this.checkOpenState(PunchFormPaneler.BEREDSKAPNATTEVAAK)}
                        onOpenChange={() => this.handlePanelClick(PunchFormPaneler.BEREDSKAPNATTEVAAK)}
                        data-testid="accordionItem-beredskapnattevaakpanel"
                    >
                        <Accordion.Header>
                            <FormattedMessage id={PunchFormPaneler.BEREDSKAPNATTEVAAK} />
                        </Accordion.Header>

                        <Accordion.Content>
                            <CheckboksPanel
                                label={<FormattedMessage id={BeredskapNattevaak.BEREDSKAP} />}
                                onChange={(e) =>
                                    this.handleBeredskapNattevåkChange(BeredskapNattevaak.BEREDSKAP, e.target.checked)
                                }
                                checked={!!soknad.beredskap.length}
                            />

                            {!!soknad.beredskap.length && (
                                <div data-testid="beredskapsperioder">{beredskapperioder()}</div>
                            )}

                            <VerticalSpacer eightPx />

                            <CheckboksPanel
                                label={<FormattedMessage id={BeredskapNattevaak.NATTEVAAK} />}
                                onChange={(e) =>
                                    this.handleBeredskapNattevåkChange(BeredskapNattevaak.NATTEVAAK, e.target.checked)
                                }
                                checked={!!soknad.nattevaak.length}
                            />

                            {!!soknad.nattevaak.length && (
                                <div data-testid="nattevaaksperioder">{nattevaakperioder()}</div>
                            )}
                        </Accordion.Content>
                    </Accordion.Item>

                    <Accordion.Item
                        open={this.checkOpenState(PunchFormPaneler.MEDLEMSKAP)}
                        onOpenChange={() => this.handlePanelClick(PunchFormPaneler.MEDLEMSKAP)}
                        data-testid="accordionItem-medlemskappanel"
                    >
                        <Accordion.Header>
                            <FormattedMessage id={PunchFormPaneler.MEDLEMSKAP} />
                        </Accordion.Header>

                        <Accordion.Content>
                            <RadioPanelGruppe
                                className="horizontalRadios"
                                radios={Object.values(JaNeiIkkeOpplyst).map((jn) => ({
                                    label: intlHelper(intl, jn),
                                    value: jn,
                                }))}
                                name="medlemskapjanei"
                                legend={<FormattedMessage id="skjema.medlemskap.harbodd" />}
                                onChange={(event) =>
                                    this.handleMedlemskapChange(
                                        (event.target as HTMLInputElement).value as JaNeiIkkeOpplyst,
                                    )
                                }
                                checked={this.medlemskapCheckedValue()}
                            />

                            {!!soknad.bosteder?.length && (
                                <PeriodeinfoPaneler
                                    periods={soknad.bosteder}
                                    component={pfLand()}
                                    panelid={(i) => `bostederpanel_${i}`}
                                    initialPeriodeinfo={initialUtenlandsopphold}
                                    editSoknad={(bosteder) => this.updateSoknad({ bosteder })}
                                    editSoknadState={(bosteder, showStatus) =>
                                        this.updateSoknadState({ bosteder }, showStatus)
                                    }
                                    textLeggTil="skjema.perioder.legg_til"
                                    textFjern="skjema.perioder.fjern"
                                    className="bosteder"
                                    panelClassName="bostederpanel"
                                    getErrorMessage={this.getErrorMessage}
                                    getUhaandterteFeil={this.getUhåndterteFeil}
                                    feilkodeprefiks="ytelse.bosteder"
                                    kanHaFlere
                                    medSlettKnapp={false}
                                />
                            )}
                        </Accordion.Content>
                    </Accordion.Item>
                </Accordion>

                <VerticalSpacer thirtyTwoPx />

                <p className="ikkeregistrert">
                    <FormattedMessage id="skjema.ikkeregistrert" />
                </p>

                <div className="flex-container">
                    <CheckboksPanel
                        id="medisinskeopplysningercheckbox"
                        label={<FormattedMessage id="skjema.medisinskeopplysninger" />}
                        checked={soknad.harMedisinskeOpplysninger}
                        onChange={(event) => this.updateMedisinskeOpplysninger(event.target.checked)}
                    />

                    <HelpText className="hjelpetext" placement="top-end">
                        <FormattedMessage id="skjema.medisinskeopplysninger.hjelpetekst" />
                    </HelpText>
                </div>

                <VerticalSpacer eightPx />

                <div className="flex-container">
                    <CheckboksPanel
                        id="opplysningerikkepunsjetcheckbox"
                        label={<FormattedMessage id="skjema.opplysningerikkepunsjet" />}
                        checked={soknad.harInfoSomIkkeKanPunsjes}
                        onChange={(event) => this.updateOpplysningerIkkeKanPunsjes(event.target.checked)}
                    />

                    <HelpText className="hjelpetext" placement="top-end">
                        <FormattedMessage id="skjema.opplysningerikkepunsjet.hjelpetekst" />
                    </HelpText>
                </div>

                <VerticalSpacer twentyPx />

                {this.getUhåndterteFeil('')
                    .map((feilmelding, index) => nummerPrefiks(feilmelding || '', index + 1))
                    .map((feilmelding) => (
                        <Feilmelding key={feilmelding} feil={feilmelding} />
                    ))}

                {punchFormState.isAwaitingValidateResponse && (
                    <div className="loadingSpinner">
                        <Loader size="large" />
                    </div>
                )}

                <div className="submit-knapper">
                    <p className="sendknapp-wrapper">
                        <Button className="send-knapp" onClick={() => this.handleSubmit()} data-testid="sendKnapp">
                            <FormattedMessage id="skjema.knapp.send" />
                        </Button>

                        <Button
                            variant="secondary"
                            className="vent-knapp"
                            onClick={() => this.setState({ showSettPaaVentModal: true })}
                            data-testid="ventKnapp"
                        >
                            <FormattedMessage id="skjema.knapp.settpaavent" />
                        </Button>
                    </p>
                </div>

                <VerticalSpacer sixteenPx />

                {!!punchFormState.updateSoknadError && (
                    <Alert variant="error">
                        <FormattedMessage id="skjema.feil.ikke_lagret" />
                    </Alert>
                )}

                {!!punchFormState.inputErrors?.length && (
                    <Alert variant="error">
                        <FormattedMessage id="skjema.feil.validering" />
                    </Alert>
                )}

                {!!punchFormState.submitSoknadError && (
                    <Alert variant="error">
                        <FormattedMessage id="skjema.feil.ikke_sendt" />
                    </Alert>
                )}

                {!!punchFormState.submitSoknadConflict && (
                    <Alert variant="error">
                        {punchFormState.submitSoknadConflict.feil ||
                            punchFormState.submitSoknadConflict.message ||
                            intlHelper(intl, 'skjema.feil.konflikt')}
                    </Alert>
                )}

                {this.state.showSettPaaVentModal && (
                    <SettPaaVentModal
                        journalposter={this.props.journalposterState.journalposter.filter(
                            (jp) => jp.journalpostId !== this.props.journalpostid,
                        )}
                        soknadId={soknad.soeknadId}
                        submit={() => this.handleSettPaaVent()}
                        onClose={() => this.setState({ showSettPaaVentModal: false })}
                    />
                )}

                {punchFormState.settPaaVentSuccess && (
                    <OkGåTilLosModal
                        meldingId="modal.settpaavent.til"
                        onClose={() => this.props.settPaaventResetAction()}
                    />
                )}

                {punchFormState.settPaaVentError && <ErrorModal onClose={() => this.props.settPaaventResetAction()} />}

                {this.props.punchFormState.isValid &&
                    !this.state.visErDuSikkerModal &&
                    this.props.punchFormState.validertSoknad && (
                        <Modal
                            key="validertSoknadModal"
                            onClose={() => this.props.validerSoknadReset()}
                            aria-label="validertSoknadModal"
                            open={this.props.punchFormState.isValid}
                            data-testid="validertSoknadModal"
                        >
                            <Modal.Body>
                                <div className="validertSoknadOppsummeringContainer">
                                    <PSBSoknadKvittering innsendtSøknad={this.props.punchFormState.validertSoknad} />
                                </div>

                                <Modal.Footer>
                                    <Button
                                        size="small"
                                        onClick={() => this.setState({ visErDuSikkerModal: true })}
                                        data-testid="validertSoknadOppsummeringContainer_knappVidere"
                                    >
                                        <FormattedMessage id="skjema.knapp.videre" />
                                    </Button>

                                    <Button
                                        variant="secondary"
                                        size="small"
                                        onClick={() => this.props.validerSoknadReset()}
                                    >
                                        <FormattedMessage id="skjema.knapp.avbryt" />
                                    </Button>
                                </Modal.Footer>
                            </Modal.Body>
                        </Modal>
                    )}

                {this.state.visErDuSikkerModal && (
                    <ErDuSikkerModal
                        melding="modal.erdusikker.sendinn"
                        modalKey="erdusikkermodal"
                        extraInfo="modal.erdusikker.sendinn.extrainfo"
                        submitKnappText="skjema.knapp.send"
                        open={this.state.visErDuSikkerModal}
                        onSubmit={() => this.props.submitSoknad(this.state.soknad.soekerId, this.props.id)}
                        onClose={() => {
                            this.props.validerSoknadReset();
                            this.setState({ visErDuSikkerModal: false });
                        }}
                    />
                )}
            </div>
        );
    }
}

const mapStateToProps = (state: RootStateType): IPunchFormStateProps => ({
    punchFormState: state.PLEIEPENGER_SYKT_BARN.punchFormState,
    signaturState: state.PLEIEPENGER_SYKT_BARN.signaturState,
    journalposterState: state.journalposterPerIdentState,
    identState: state.identState,
    fellesState: state.felles,
});

const mapDispatchToProps = (dispatch: any) => ({
    getSoknad: (id: string) => dispatch(getSoknad(id)),
    hentPerioder: (søkerId: string, pleietrengendeId: string) =>
        dispatch(hentPerioderFraK9Sak(søkerId, pleietrengendeId)),
    resetSoknadAction: () => dispatch(resetSoknadAction()),
    undoChoiceOfEksisterendeSoknadAction: () => dispatch(undoChoiceOfEksisterendeSoknadAction()),
    updateSoknad: (soknad: Partial<IPSBSoknadUt>) => dispatch(updateSoknad(soknad)),
    submitSoknad: (ident: string, soeknadid: string) => dispatch(submitSoknad(ident, soeknadid)),
    resetPunchFormAction: () => dispatch(resetPunchFormAction()),
    resetAllStateAction: () => dispatch(resetAllStateAction()),
    setSignaturAction: (signert: JaNeiIkkeRelevant | null) => dispatch(setSignaturAction(signert)),
    settJournalpostPaaVent: (journalpostid: string, soeknadid: string) =>
        dispatch(settJournalpostPaaVent(journalpostid, soeknadid)),
    settPaaventResetAction: () => dispatch(setJournalpostPaaVentResetAction()),
    setIdentAction: (søkerId: string, pleietrengendeId: string | null, annenSokerIdent: string | null) =>
        dispatch(setIdentFellesAction(søkerId, pleietrengendeId, annenSokerIdent)),
    validateSoknad: (soknad: IPSBSoknadUt, erMellomlagring: boolean) =>
        dispatch(validerSoknad(soknad, erMellomlagring)),
    validerSoknadReset: () => dispatch(validerSoknadResetAction()),
});

export const PSBPunchForm = withHooks(injectIntl(connect(mapStateToProps, mapDispatchToProps)(PunchFormComponent)));
