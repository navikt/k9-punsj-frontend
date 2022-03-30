/* eslint-disable */
import { PunchStep } from 'app/models/enums';
import { IInputError, ISignaturState } from 'app/models/types';
import {
    resetPunchFormAction,
    setIdentAction,
    setJournalpostPaaVentResetAction,
    setSignaturAction,
    setStepAction,
    settJournalpostPaaVent,
} from 'app/state/actions';
import { nummerPrefiks, setHash, capitalize } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';
import classNames from 'classnames';
import * as yup from 'yup';
import { AlertStripeFeil } from 'nav-frontend-alertstriper';
import { EtikettAdvarsel, EtikettFokus, EtikettSuksess } from 'nav-frontend-etiketter';
import { Hovedknapp, Knapp } from 'nav-frontend-knapper';
import ModalWrapper from 'nav-frontend-modal';
import NavFrontendSpinner from 'nav-frontend-spinner';
import * as React from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { connect } from 'react-redux';
import { ErrorSummary } from '@navikt/ds-react';
import VerticalSpacer from '../../components/VerticalSpacer';
import { JaNeiIkkeRelevant } from '../../models/enums/JaNeiIkkeRelevant';
import { PunchFormPaneler } from '../../models/enums/PunchFormPaneler';
import { IIdentState } from '../../models/types/IdentState';
import { IJournalposterPerIdentState } from '../../models/types/Journalpost/JournalposterPerIdentState';
import { RootStateType } from '../../state/RootState';
import { initializeDate } from '../../utils/timeUtils';
import ErDuSikkerModal from '../../containers/pleiepenger/ErDuSikkerModal';
import OkGaaTilLosModal from '../../containers/pleiepenger/OkGaaTilLosModal';
import SettPaaVentErrorModal from '../../containers/pleiepenger/SettPaaVentErrorModal';
import SettPaaVentModal from '../../containers/pleiepenger/SettPaaVentModal';
import { IOMPMASoknad, OMPMASoknad } from '../types/OMPMASoknad';
import { IPunchOMPMAFormState } from '../types/PunchOMPMAFormState';
import OpplysningerOmOMPMASoknad from './OpplysningerOmSoknad/OpplysningerOmOMPMASoknad';
import { OMPMASoknadKvittering } from './SoknadKvittering/OMPMASoknadKvittering';
import {
    getOMPMASoknad,
    resetOMPMASoknadAction,
    resetPunchOMPMAFormAction,
    submitOMPMASoknad,
    updateOMPMASoknad,
    validerOMPMASoknad,
    validerOMPMASoknadResetAction,
} from '../state/actions/OMPMAPunchFormActions';
import { undoChoiceOfEksisterendeOMPMASoknadAction } from '../state/actions/EksisterendeOMPMASoknaderActions';
import { IOMPMASoknadUt, OMPMASoknadUt } from '../types/OMPMASoknadUt';
import { CheckboksPanel } from 'nav-frontend-skjema';
import Hjelpetekst from 'nav-frontend-hjelpetekst';
import { PopoverOrientering } from 'nav-frontend-popover';
import AnnenForelder from '../components/AnnenForelder';
import { string } from 'prop-types';

export interface IPunchOMPMAFormComponentProps {
    getPunchPath: (step: PunchStep, values?: any) => string;
    journalpostid: string;
    id: string;
}

export interface IPunchOMPMAFormStateProps {
    punchFormState: IPunchOMPMAFormState;
    signaturState: ISignaturState;
    journalposterState: IJournalposterPerIdentState;
    identState: IIdentState;
}

export interface IPunchOMPMAFormDispatchProps {
    getSoknad: typeof getOMPMASoknad;
    resetSoknadAction: typeof resetOMPMASoknadAction;
    setIdentAction: typeof setIdentAction;
    setStepAction: typeof setStepAction;
    undoChoiceOfEksisterendeSoknadAction: typeof undoChoiceOfEksisterendeOMPMASoknadAction;
    updateSoknad: typeof updateOMPMASoknad;
    submitSoknad: typeof submitOMPMASoknad;
    resetPunchFormAction: typeof resetPunchFormAction;
    setSignaturAction: typeof setSignaturAction;
    settJournalpostPaaVent: typeof settJournalpostPaaVent;
    settPaaventResetAction: typeof setJournalpostPaaVentResetAction;
    validateSoknad: typeof validerOMPMASoknad;
    validerSoknadReset: typeof validerOMPMASoknadResetAction;
}

export interface IPunchOMPMAFormComponentState {
    soknad: IOMPMASoknad;
    isFetched: boolean;
    showStatus: boolean;
    faktiskeTimer: string[][];
    expandAll: boolean;
    aapnePaneler: PunchFormPaneler[];
    showSettPaaVentModal: boolean;
    visErDuSikkerModal: boolean;
    errors: IInputError[];
    feilmeldingStier: Set<string>;
    harForsoektAaSendeInn: boolean;
}

type IPunchOMPMAFormProps = IPunchOMPMAFormComponentProps &
    WrappedComponentProps &
    IPunchOMPMAFormStateProps &
    IPunchOMPMAFormDispatchProps;

function erIkkeFremITid(dato: string) {
    const naa = new Date();
    return naa > new Date(dato);
}

const klokkeslettErFremITid = (mottattDato?: string, klokkeslett?: string) => {
    const naa = new Date();
    if (mottattDato && klokkeslett && new Date(mottattDato).getDate() === naa.getDate()) {
        return initializeDate(naa).format('HH:mm') < klokkeslett;
    }
    return false;
};

yup.setLocale({
    mixed: {
        required: '${path} er et påkrevd felt.',
    },
    string: {
        min: '${path} må være minst ${min} tegn',
        max: '${path} må være mest ${max} tegn',
    },
});

const schema = yup.object({
    mottattDato: yup.string().required().test({ test: erIkkeFremITid, message: 'Dato kan ikke være frem i tid' }),
    klokkeslett: yup
        .string()
        .required()
        .when('mottattDato', (mottattDato, schema) => {
            return schema.test({
                test: (klokkeslett: string) => !klokkeslettErFremITid(mottattDato, klokkeslett),
                message: 'Klokkeslett kan ikke være frem i tid',
            });
        }),
    identifikasjonsnummer: yup.string().required(),
    situasjonstype: yup.string().required(),
    situasjonsbeskrivelse: yup.string().required().min(5),
    periode: yup.string(),
    periodeFom: yup.string().required(),
    periodeTom: yup.string().required(),
});

const mapSoknadTilYupFormat = (soknad: Partial<IOMPMASoknad>) => ({
    mottattDato: soknad.mottattDato,
    klokkeslett: soknad.klokkeslett,
    identifikasjonsnummer: soknad.annenForelder?.norskIdent || undefined,
    situasjonstype: soknad.annenForelder?.situasjonType || undefined,
    situasjonsbeskrivelse: soknad.annenForelder?.situasjonBeskrivelse || undefined,
    periodeFom: soknad.annenForelder?.periode?.fom,
    periodeTom: soknad.annenForelder?.periode?.tom,
});

const feilFraYup = (schema: any, soknad: IOMPMASoknad) => {
    try {
        const isValid = schema.validateSync(mapSoknadTilYupFormat(soknad), { abortEarly: false });
        if (isValid) return [];
    } catch (error) {
        const errors = error.inner.map(
            ({ message, params: { path } }: { message: string; params: { path: string } }) => ({
                message: capitalize(message),
                path,
            })
        );
        return errors;
    }
};

export class PunchOMPMAFormComponent extends React.Component<IPunchOMPMAFormProps, IPunchOMPMAFormComponentState> {
    state: IPunchOMPMAFormComponentState = {
        soknad: {
            soeknadId: '',
            soekerId: '',
            mottattDato: '',
            klokkeslett: '',
            journalposter: new Set([]),
            annenForelder: {
                norskIdent: '',
                situasjonBeskrivelse: '',
                situasjonType: '',
                periode: {
                    fom: '',
                    tom: '',
                },
            },
            harInfoSomIkkeKanPunsjes: false,
            harMedisinskeOpplysninger: false,
        },
        isFetched: false,
        showStatus: false,
        faktiskeTimer: [], // Lagrer tilstedeværelsesgrad i stringformat her for å gjøre det enklere å redigere feltet}
        expandAll: false,
        aapnePaneler: [],
        showSettPaaVentModal: false,
        visErDuSikkerModal: false,
        errors: [],
        feilmeldingStier: new Set(),
        harForsoektAaSendeInn: false,
    };

    componentDidMount(): void {
        const { id } = this.props;
        this.props.getSoknad(id);
        this.props.setStepAction(PunchStep.FILL_FORM);
        this.setState(this.state);
    }

    componentDidUpdate(
        prevProps: Readonly<IPunchOMPMAFormProps>,
        prevState: Readonly<IPunchOMPMAFormComponentState>,
        snapshot?: any
    ): void {
        const { soknad } = this.props.punchFormState;
        if (!!soknad && !this.state.isFetched) {
            this.setState({
                soknad: new OMPMASoknad(this.props.punchFormState.soknad as IOMPMASoknad),
                isFetched: true,
            });
        }
    }

    render() {
        const { intl, punchFormState, signaturState } = this.props;

        const soknad = new OMPMASoknad(this.state.soknad);
        const { signert } = signaturState;

        const harFeilISkjema = !![...this.getUhaandterteFeil(''), ...feilFraYup(schema, this.state.soknad)].length;
        const yupErrors = feilFraYup(schema, this.state.soknad);
        const getErrorMessage = (path: string) =>
            yupErrors.find((error: { path: string; message: string }) => error.path === path)?.message;
        console.log(yupErrors);
        const visFeil = this.state.harForsoektAaSendeInn;
        const visFeilOppsummering = visFeil && harFeilISkjema;

        if (punchFormState.isComplete) {
            setHash(this.props.getPunchPath(PunchStep.COMPLETED));
            return null;
        }

        if (punchFormState.isSoknadLoading) {
            return <NavFrontendSpinner />;
        }

        if (!!punchFormState.error) {
            return (
                <>
                    <AlertStripeFeil>
                        {intlHelper(intl, 'skjema.feil.ikke_funnet', { id: this.props.id })}
                    </AlertStripeFeil>
                    <p>
                        <Knapp onClick={this.handleStartButtonClick}>{intlHelper(intl, 'skjema.knapp.tilstart')}</Knapp>
                    </p>
                </>
            );
        }

        if (!soknad) {
            return null;
        }

        return (
            <>
                {this.statusetikett()}
                <VerticalSpacer sixteenPx />
                <OpplysningerOmOMPMASoknad
                    intl={intl}
                    changeAndBlurUpdatesSoknad={this.changeAndBlurUpdatesSoknad}
                    getErrorMessage={getErrorMessage}
                    setSignaturAction={this.props.setSignaturAction}
                    signert={signert}
                    soknad={soknad}
                    visFeil={visFeil}
                />
                <VerticalSpacer fourtyPx />

                <AnnenForelder
                    intl={intl}
                    changeAndBlurUpdatesSoknad={this.changeAndBlurUpdatesSoknad}
                    soknad={soknad}
                    getErrorMessage={getErrorMessage}
                    visFeil={visFeil}
                />
                <VerticalSpacer fourtyPx />
                <p className={'ikkeregistrert'}>{intlHelper(intl, 'skjema.ikkeregistrert')}</p>
                <div className={'flex-container'}>
                    <CheckboksPanel
                        id={'medisinskeopplysningercheckbox'}
                        label={intlHelper(intl, 'skjema.medisinskeopplysninger')}
                        checked={!!soknad.harMedisinskeOpplysninger}
                        onChange={(event) => this.updateMedisinskeOpplysninger(event.target.checked)}
                    />
                    <Hjelpetekst className={'hjelpetext'} type={PopoverOrientering.OverHoyre} tabIndex={-1}>
                        {intlHelper(intl, 'skjema.medisinskeopplysninger.omsorgspenger-ks.hjelpetekst')}
                    </Hjelpetekst>
                </div>
                <VerticalSpacer eightPx={true} />
                <div className={'flex-container'}>
                    <CheckboksPanel
                        id={'opplysningerikkepunsjetcheckbox'}
                        label={intlHelper(intl, 'skjema.opplysningerikkepunsjet')}
                        checked={!!soknad.harInfoSomIkkeKanPunsjes}
                        onChange={(event) => this.updateOpplysningerIkkeKanPunsjes(event.target.checked)}
                    />
                    <Hjelpetekst className={'hjelpetext'} type={PopoverOrientering.OverHoyre} tabIndex={-1}>
                        {intlHelper(intl, 'skjema.opplysningerikkepunsjet.hjelpetekst')}
                    </Hjelpetekst>
                </div>
                <VerticalSpacer twentyPx={true} />
                {punchFormState.isAwaitingValidateResponse && (
                    <div className={classNames('loadingSpinner')}>
                        <NavFrontendSpinner />
                    </div>
                )}
                {visFeilOppsummering && (
                    <ErrorSummary heading="Du må fikse disse feilene før du kan sende inn punsjemeldingen.">
                        {this.getUhaandterteFeil('')
                            .map((feilmelding, index) => nummerPrefiks(feilmelding || '', index + 1))
                            .map((feilmelding) => {
                                return <ErrorSummary.Item key={feilmelding}>{feilmelding}</ErrorSummary.Item>;
                            })}
                        {feilFraYup(schema, this.state.soknad).map((error: { message: string; path: string }) => (
                            <ErrorSummary.Item key={error.path}>{error.message}</ErrorSummary.Item>
                        ))}
                    </ErrorSummary>
                )}
                <div className={'submit-knapper'}>
                    <p className="sendknapp-wrapper">
                        <Knapp className={'send-knapp'} onClick={() => this.handleSubmit()} disabled={false}>
                            {intlHelper(intl, 'skjema.knapp.send')}
                        </Knapp>

                        <Knapp
                            className={'vent-knapp'}
                            onClick={() => this.setState({ showSettPaaVentModal: true })}
                            disabled={false}
                        >
                            {intlHelper(intl, 'skjema.knapp.settpaavent')}
                        </Knapp>
                    </p>
                </div>

                <VerticalSpacer sixteenPx={true} />

                {!!punchFormState.updateSoknadError && (
                    <AlertStripeFeil>{intlHelper(intl, 'skjema.feil.ikke_lagret')}</AlertStripeFeil>
                )}
                {!!punchFormState.inputErrors?.length && (
                    <AlertStripeFeil className={'valideringstripefeil'}>
                        {intlHelper(intl, 'skjema.feil.validering')}
                    </AlertStripeFeil>
                )}
                {!!punchFormState.submitSoknadError && (
                    <AlertStripeFeil>{intlHelper(intl, 'skjema.feil.ikke_sendt')}</AlertStripeFeil>
                )}
                {!!punchFormState.submitSoknadConflict && (
                    <AlertStripeFeil>{intlHelper(intl, 'skjema.feil.konflikt')}</AlertStripeFeil>
                )}

                {this.state.showSettPaaVentModal && (
                    <ModalWrapper
                        key={'settpaaventmodal'}
                        className={'settpaaventmodal'}
                        onRequestClose={() => this.setState({ showSettPaaVentModal: false })}
                        contentLabel={'settpaaventmodal'}
                        isOpen={this.state.showSettPaaVentModal}
                        closeButton={false}
                    >
                        <div className="">
                            <SettPaaVentModal
                                journalposter={this.props.journalposterState.journalposter.filter(
                                    (jp) => jp.journalpostId !== this.props.journalpostid
                                )}
                                soknadId={soknad.soeknadId}
                                submit={() => this.handleSettPaaVent()}
                                avbryt={() => this.setState({ showSettPaaVentModal: false })}
                            />
                        </div>
                    </ModalWrapper>
                )}

                {punchFormState.settPaaVentSuccess && (
                    <ModalWrapper
                        key={'settpaaventokmodal'}
                        onRequestClose={() => this.props.settPaaventResetAction()}
                        contentLabel={'settpaaventokmodal'}
                        closeButton={false}
                        isOpen={punchFormState.settPaaVentSuccess}
                    >
                        <OkGaaTilLosModal melding={'modal.settpaavent.til'} />
                    </ModalWrapper>
                )}

                {!!punchFormState.settPaaVentError && (
                    <ModalWrapper
                        key={'settpaaventerrormodal'}
                        onRequestClose={() => this.props.settPaaventResetAction()}
                        contentLabel={'settpaaventokmodal'}
                        closeButton={false}
                        isOpen={!!punchFormState.settPaaVentError}
                    >
                        <SettPaaVentErrorModal close={() => this.props.settPaaventResetAction()} />
                    </ModalWrapper>
                )}

                {this.props.punchFormState.isValid &&
                    !this.state.visErDuSikkerModal &&
                    this.props.punchFormState.validertSoknad && (
                        <ModalWrapper
                            key={'validertSoknadModal'}
                            className={'validertSoknadModal'}
                            onRequestClose={() => this.props.validerSoknadReset()}
                            contentLabel={'validertSoknadModal'}
                            closeButton={false}
                            isOpen={!!this.props.punchFormState.isValid}
                        >
                            <div className={classNames('validertSoknadOppsummeringContainer')}>
                                <OMPMASoknadKvittering
                                    intl={intl}
                                    response={this.props.punchFormState.validertSoknad}
                                />
                            </div>
                            <div className={classNames('validertSoknadOppsummeringContainerKnapper')}>
                                <Hovedknapp
                                    mini={true}
                                    className="validertSoknadOppsummeringContainer_knappVidere"
                                    onClick={() => this.setState({ visErDuSikkerModal: true })}
                                >
                                    {intlHelper(intl, 'fordeling.knapp.videre')}
                                </Hovedknapp>
                                <Knapp
                                    mini={true}
                                    className="validertSoknadOppsummeringContainer_knappTilbake"
                                    onClick={() => this.props.validerSoknadReset()}
                                >
                                    {intlHelper(intl, 'skjema.knapp.avbryt')}
                                </Knapp>
                            </div>
                        </ModalWrapper>
                    )}

                {this.state.visErDuSikkerModal && (
                    <ModalWrapper
                        key={'erdusikkermodal'}
                        className={'erdusikkermodal'}
                        onRequestClose={() => this.props.validerSoknadReset()}
                        contentLabel={'erdusikkermodal'}
                        closeButton={false}
                        isOpen={this.state.visErDuSikkerModal}
                    >
                        <ErDuSikkerModal
                            melding={'modal.erdusikker.sendinn'}
                            extraInfo={'modal.erdusikker.sendinn.extrainfo'}
                            onSubmit={() => this.props.submitSoknad(this.state.soknad.soekerId, this.props.id)}
                            submitKnappText={'skjema.knapp.send'}
                            onClose={() => {
                                this.props.validerSoknadReset();
                                this.setState({ visErDuSikkerModal: false });
                            }}
                        />
                    </ModalWrapper>
                )}
            </>
        );
    }

    private handleSubmit = () => {
        let navarandeSoknad: IOMPMASoknad = this.state.soknad;
        const journalposter = {
            journalposter: Array.from(
                navarandeSoknad && navarandeSoknad.journalposter ? navarandeSoknad?.journalposter : []
            ),
        };
        this.setState({ harForsoektAaSendeInn: true });
        this.props.validateSoknad({
            ...navarandeSoknad,
            ...journalposter,
            barn: this.props.identState.barn
                .filter((barn) => barn.valgt)
                .map((barn) => ({ norskIdent: barn.identitetsnummer })),
        });
    };

    private handleSettPaaVent = () => {
        this.props.settJournalpostPaaVent(this.props.journalpostid, this.state.soknad.soeknadId!);
        this.setState({ showSettPaaVentModal: false });
    };

    private updateMedisinskeOpplysninger(checked: boolean) {
        this.updateSoknadState({ harMedisinskeOpplysninger: checked }, true);
        this.updateSoknad({ harMedisinskeOpplysninger: checked });
    }

    private updateOpplysningerIkkeKanPunsjes(checked: boolean) {
        this.updateSoknadState({ harInfoSomIkkeKanPunsjes: checked }, true);
        this.updateSoknad({ harInfoSomIkkeKanPunsjes: checked });
    }

    private getSoknadFromStore = () => {
        return new OMPMASoknadUt(this.props.punchFormState.soknad as IOMPMASoknadUt);
    };

    private getManglerFromStore = () => {
        return this.props.punchFormState.inputErrors;
    };

    getUhaandterteFeil = (attribute: string): (string | undefined)[] => {
        if (!this.state.feilmeldingStier.has(attribute)) {
            this.setState({ feilmeldingStier: this.state.feilmeldingStier.add(attribute) });
        }

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
            return uhaandterteFeilmeldinger.map((error) => error.feilmelding).filter(Boolean);
        }
        return [];
    };

    private updateSoknadState = (soknad: Partial<IOMPMASoknad>, showStatus?: boolean) => {
        this.state.soknad.journalposter!.add(this.props.journalpostid);
        this.setState({
            soknad: { ...this.state.soknad, ...soknad },
            showStatus: !!showStatus,
        });
    };

    private updateSoknad = (soknad: Partial<IOMPMASoknad>) => {
        this.setState({ showStatus: true });
        const navarandeSoknad: OMPMASoknadUt = this.getSoknadFromStore();
        const journalposter = Array.from(navarandeSoknad?.journalposter ? navarandeSoknad?.journalposter : []);

        if (!journalposter.includes(this.props.journalpostid)) {
            journalposter.push(this.props.journalpostid);
        }

        if (this.state.harForsoektAaSendeInn) {
            this.props.validateSoknad({ ...this.getSoknadFromStore(), ...soknad, journalposter: journalposter }, true);
        }

        return this.props.updateSoknad({ ...this.getSoknadFromStore(), ...soknad, journalposter: journalposter });
    };

    private handleStartButtonClick = () => {
        this.props.resetPunchFormAction();
        setHash('/');
    };

    private changeAndBlurUpdatesSoknad = (change: (event: any) => Partial<IOMPMASoknad>) => ({
        onChange: (event: any) => this.updateSoknadState(change(event), false),
        onBlur: (event: any) => this.updateSoknad(change(event)),
    });

    private statusetikett() {
        if (!this.state.showStatus) {
            return null;
        }

        const { punchFormState } = this.props;
        const className = 'statusetikett';

        if (punchFormState.isAwaitingUpdateResponse) {
            return <EtikettFokus {...{ className }}>Lagrer …</EtikettFokus>;
        }
        if (!!punchFormState.updateSoknadError) {
            return <EtikettAdvarsel {...{ className }}>Lagring feilet</EtikettAdvarsel>;
        }
        return <EtikettSuksess {...{ className }}>Lagret</EtikettSuksess>;
    }
}

const mapStateToProps = (state: RootStateType): IPunchOMPMAFormStateProps => ({
    punchFormState: state.OMSORGSPENGER_MIDLERTIDIG_ALENE.punchFormState,
    signaturState: state.OMSORGSPENGER_MIDLERTIDIG_ALENE.signaturState,
    journalposterState: state.journalposterPerIdentState,
    identState: state.identState,
});

const mapDispatchToProps = (dispatch: any) => ({
    getSoknad: (id: string) => dispatch(getOMPMASoknad(id)),
    resetSoknadAction: () => dispatch(resetOMPMASoknadAction()),
    setIdentAction: (ident1: string, ident2: string | null) => dispatch(setIdentAction(ident1, ident2)),
    setStepAction: (step: PunchStep) => dispatch(setStepAction(step)),
    undoChoiceOfEksisterendeSoknadAction: () => dispatch(undoChoiceOfEksisterendeOMPMASoknadAction()),
    updateSoknad: (soknad: Partial<IOMPMASoknadUt>) => dispatch(updateOMPMASoknad(soknad)),
    submitSoknad: (ident: string, soeknadid: string) => dispatch(submitOMPMASoknad(ident, soeknadid)),
    resetPunchFormAction: () => dispatch(resetPunchOMPMAFormAction()),
    setSignaturAction: (signert: JaNeiIkkeRelevant | null) => dispatch(setSignaturAction(signert)),
    settJournalpostPaaVent: (journalpostid: string, soeknadid: string) =>
        dispatch(settJournalpostPaaVent(journalpostid, soeknadid)),
    settPaaventResetAction: () => dispatch(setJournalpostPaaVentResetAction()),
    validateSoknad: (soknad: IOMPMASoknadUt, erMellomlagring: boolean) =>
        dispatch(validerOMPMASoknad(soknad, erMellomlagring)),
    validerSoknadReset: () => dispatch(validerOMPMASoknadResetAction()),
});

export const OMPMAPunchForm = injectIntl(connect(mapStateToProps, mapDispatchToProps)(PunchOMPMAFormComponent));
/* eslint-enable */
