import React, { ComponentType } from 'react';
import classNames from 'classnames';
import { CheckboksPanel } from 'nav-frontend-skjema';

import { Alert, Button, HelpText, Modal, Tag, Loader } from '@navikt/ds-react';

import { IInputError, ISignaturState } from 'app/models/types';
import { resetPunchFormAction, setSignaturAction } from 'app/state/actions';
import { nummerPrefiks } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';
import JournalposterSync from 'app/components/JournalposterSync';

import { ROUTES } from 'app/constants/routes';
import { NavigateFunction, useNavigate, useParams } from 'react-router-dom';
import { resetAllStateAction } from 'app/state/actions/GlobalActions';
import { WrappedComponentProps, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import Feilmelding from '../../../components/Feilmelding';
import VerticalSpacer from '../../../components/VerticalSpacer';
import ErDuSikkerModal from 'app/components/ErDuSikkerModal';
import OkGåTilLosModal from 'app/components/okGåTilLosModal/OkGåTilLosModal';
import SettPaaVentModal from 'app/components/settPåVentModal/SettPåVentModal';
import { JaNeiIkkeRelevant } from '../../../models/enums/JaNeiIkkeRelevant';
import { IIdentState } from '../../../models/types/IdentState';
import { IJournalposterPerIdentState } from '../../../models/types/Journalpost/JournalposterPerIdentState';
import { RootStateType } from '../../../state/RootState';
import { initializeDate } from '../../../utils/timeUtils';
import { undoChoiceOfEksisterendeOMPKSSoknadAction } from '../state/actions/EksisterendeOMPKSSoknaderActions';
import {
    getOMPKSSoknad,
    resetOMPKSSoknadAction,
    resetPunchOMPKSFormAction,
    submitOMPKSSoknad,
    updateOMPKSSoknad,
    validerOMPKSSoknad,
    validerOMPKSSoknadResetAction,
    setJournalpostPaaVentResetAction,
    settJournalpostPaaVent,
} from '../state/actions/OMPKSPunchFormActions';
import { IOMPKSSoknad, OMPKSSoknad } from '../types/OMPKSSoknad';
import { IOMPKSSoknadUt, OMPKSSoknadUt } from '../types/OMPKSSoknadUt';
import { IPunchOMPKSFormState } from '../types/PunchOMPKSFormState';
import OpplysningerOmOMPKSSoknad from './OpplysningerOmSoknad/OpplysningerOmOMPKSSoknad';
import { OMPKSSoknadKvittering } from './SoknadKvittering/OMPKSSoknadKvittering';
import { OMPKSKvitteringContainer } from './SoknadKvittering/OMPKSKvitteringContainer';
import ErrorModal from 'app/fordeling/Komponenter/ErrorModal';

export interface IPunchOMPKSFormComponentProps {
    journalpostid: string;
    id: string;
    navigate: NavigateFunction;
}

export interface IPunchOMPKSFormStateProps {
    punchFormState: IPunchOMPKSFormState;
    signaturState: ISignaturState;
    journalposterState: IJournalposterPerIdentState;
    identState: IIdentState;
}

export interface IPunchOMPKSFormDispatchProps {
    getSoknad: typeof getOMPKSSoknad;
    resetSoknadAction: typeof resetOMPKSSoknadAction;
    updateSoknad: typeof updateOMPKSSoknad;
    submitSoknad: typeof submitOMPKSSoknad;
    resetPunchFormAction: typeof resetPunchFormAction;
    resetAllStateAction: typeof resetAllStateAction;
    setSignaturAction: typeof setSignaturAction;
    settJournalpostPaaVent: typeof settJournalpostPaaVent;
    settPaaventResetAction: typeof setJournalpostPaaVentResetAction;
    validateSoknad: typeof validerOMPKSSoknad;
    validerSoknadReset: typeof validerOMPKSSoknadResetAction;
}

export interface IPunchOMPKSFormComponentState {
    soknad: IOMPKSSoknad;
    isFetched: boolean;
    showStatus: boolean;
    showSettPaaVentModal: boolean;
    visErDuSikkerModal: boolean;
    feilmeldingStier: Set<string>;
    harForsoektAaSendeInn: boolean;
}

type IPunchOMPKSFormProps = IPunchOMPKSFormComponentProps &
    WrappedComponentProps &
    IPunchOMPKSFormStateProps &
    IPunchOMPKSFormDispatchProps;

function withHooks<P>(Component: ComponentType<IPunchOMPKSFormComponentProps>) {
    return (props: P) => {
        const { id, journalpostid } = useParams();
        const navigate = useNavigate();
        return <Component {...props} id={id!} journalpostid={journalpostid!} navigate={navigate} />;
    };
}

export class PunchOMPKSFormComponent extends React.Component<IPunchOMPKSFormProps, IPunchOMPKSFormComponentState> {
    constructor(props: IPunchOMPKSFormProps) {
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
                harInfoSomIkkeKanPunsjes: false,
                harMedisinskeOpplysninger: false,
            },
            isFetched: false,
            showStatus: false,
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
    }

    componentDidUpdate() {
        const { soknad } = this.props.punchFormState;

        if (soknad && !this.state.isFetched) {
            const barn: Partial<IOMPKSSoknad> = {
                barn: { norskIdent: this.props.identState.pleietrengendeId || '', foedselsdato: '' },
            };
            const soknadForState = () => {
                if (!soknad.barn || !soknad.barn.norskIdent || soknad.barn.norskIdent === '') {
                    return { ...new OMPKSSoknad(soknad as IOMPKSSoknad), ...barn };
                }
                return new OMPKSSoknad(soknad as IOMPKSSoknad);
            };

            this.setState({
                soknad: soknadForState(),
                isFetched: true,
            });
            if (!soknad.barn || !soknad.barn.norskIdent || soknad.barn.norskIdent === '') {
                this.updateSoknad(barn);
            }
        }
    }

    componentWillUnmount(): void {
        this.props.resetSoknadAction();
        this.props.resetPunchFormAction();
        this.props.validerSoknadReset();
    }

    private handleSubmit = () => {
        const navarandeSoknad: IOMPKSSoknad = this.state.soknad;
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

    private handleShowSettPaaVentModal = (showSettPaaVentModal: boolean) => {
        this.setState({ showSettPaaVentModal });
    };

    private handleVisErDuSikkerModal = (visErDuSikkerModal: boolean) => {
        this.setState({ visErDuSikkerModal });
    };

    private handleStartButtonClick = () => {
        this.props.resetAllStateAction();
        this.props.navigate(ROUTES.HOME);
    };

    private getErrorMessage = (attribute: string, indeks?: number) => {
        const { mottattDato, klokkeslett } = this.state.soknad;

        const erFremITid = (dato: string) => {
            const naa = new Date();
            return naa < new Date(dato);
        };

        if (attribute === 'klokkeslett' || attribute === 'mottattDato') {
            if (klokkeslett === null || klokkeslett === '' || mottattDato === null || mottattDato === '') {
                return intlHelper(this.props.intl, 'skjema.feil.ikketom');
            }
        }

        if (attribute === 'mottattDato' && mottattDato && erFremITid(mottattDato)) {
            return intlHelper(this.props.intl, 'skjema.feil.ikkefremitid');
        }

        if (attribute === 'klokkeslett' && klokkeslett && this.erFremITidKlokkeslett(klokkeslett)) {
            return intlHelper(this.props.intl, 'skjema.feil.ikkefremitid');
        }

        const errorMsg = this.getManglerFromStore()?.filter((m: IInputError) => m.felt === attribute)?.[indeks || 0]
            ?.feilmelding;

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

    private changeAndBlurUpdatesSoknad = (change: (event: any) => Partial<IOMPKSSoknad>) => ({
        onChange: (event: any) => this.updateSoknadState(change(event), false),
        onBlur: (event: any) => this.updateSoknad(change(event)),
    });

    private getSoknadFromStore = () => new OMPKSSoknadUt(this.props.punchFormState.soknad as IOMPKSSoknadUt);

    private getManglerFromStore = () => this.props.punchFormState.inputErrors;

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
            return uhaandterteFeilmeldinger.map((error) => error.feilmelding).filter(Boolean);
        }
        return [];
    };

    private updateSoknadState = (soknad: Partial<IOMPKSSoknad>, showStatus?: boolean) => {
        this.setState((prevState) => {
            const updatedSoknad = {
                ...prevState.soknad,
                ...soknad,
                journalposter: new Set([...(prevState.soknad.journalposter || []), this.props.journalpostid]),
            };
            return {
                soknad: updatedSoknad,
                showStatus: showStatus || prevState.showStatus,
            };
        });
    };

    private updateSoknad = (soknad: Partial<IOMPKSSoknad>) => {
        this.setState({ showStatus: true });
        const navarandeSoknad: OMPKSSoknadUt = this.getSoknadFromStore();
        const journalposter = Array.from(navarandeSoknad?.journalposter ? navarandeSoknad?.journalposter : []);

        if (!journalposter.includes(this.props.journalpostid)) {
            journalposter.push(this.props.journalpostid);
        }

        if (this.state.harForsoektAaSendeInn) {
            this.props.validateSoknad({ ...this.getSoknadFromStore(), ...soknad, journalposter }, true);
        }

        return this.props.updateSoknad({ ...this.getSoknadFromStore(), ...soknad, journalposter });
    };

    private erFremITidKlokkeslett(klokkeslett: string) {
        const { mottattDato } = this.state.soknad;
        const naa = new Date();

        if (
            mottattDato &&
            naa.toDateString() === new Date(mottattDato!).toDateString() &&
            initializeDate(naa).format('HH:mm') < klokkeslett
        ) {
            return true;
        }
        return false;
    }

    private updateOpplysningerIkkeKanPunsjes(checked: boolean) {
        this.updateSoknadState({ harInfoSomIkkeKanPunsjes: checked }, true);
        this.updateSoknad({ harInfoSomIkkeKanPunsjes: checked });
    }

    private updateMedisinskeOpplysninger(checked: boolean) {
        this.updateSoknadState({ harMedisinskeOpplysninger: checked }, true);
        this.updateSoknad({ harMedisinskeOpplysninger: checked });
    }

    render() {
        const { intl, punchFormState, signaturState } = this.props;

        const soknad = new OMPKSSoknad(this.state.soknad);
        const { signert } = signaturState;

        if (punchFormState.isComplete) {
            return <OMPKSKvitteringContainer />;
        }

        if (punchFormState.isSoknadLoading) {
            return <Loader size="large" />;
        }

        if (punchFormState.error) {
            return (
                <>
                    <Alert size="small" variant="error">
                        {intlHelper(intl, 'skjema.feil.ikke_funnet', { id: this.props.id })}
                    </Alert>
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

        return (
            <>
                <JournalposterSync journalposter={this.state.soknad.journalposter} />
                {this.statusetikett()}
                <VerticalSpacer sixteenPx />

                <VerticalSpacer sixteenPx />

                <OpplysningerOmOMPKSSoknad
                    intl={intl}
                    changeAndBlurUpdatesSoknad={this.changeAndBlurUpdatesSoknad}
                    getErrorMessage={this.getErrorMessage}
                    setSignaturAction={this.props.setSignaturAction}
                    signert={signert}
                    soknad={soknad}
                />
                <VerticalSpacer twentyPx />
                <p className="ikkeregistrert">{intlHelper(intl, 'skjema.ikkeregistrert')}</p>

                <div className="flex-container">
                    <CheckboksPanel
                        id="medisinskeopplysningercheckbox"
                        label={intlHelper(intl, 'skjema.medisinskeopplysninger')}
                        checked={soknad.harMedisinskeOpplysninger}
                        onChange={(event) => this.updateMedisinskeOpplysninger(event.target.checked)}
                    />
                    <HelpText className="hjelpetext" placement="top-end">
                        {intlHelper(intl, 'skjema.medisinskeopplysninger.omsorgspenger-ks.hjelpetekst')}
                    </HelpText>
                </div>
                <VerticalSpacer eightPx />

                <div className="flex-container">
                    <CheckboksPanel
                        id="opplysningerikkepunsjetcheckbox"
                        label={intlHelper(intl, 'skjema.opplysningerikkepunsjet')}
                        checked={soknad.harInfoSomIkkeKanPunsjes}
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
                        <Button className="send-knapp" onClick={() => this.handleSubmit()} disabled={false}>
                            {intlHelper(intl, 'skjema.knapp.send')}
                        </Button>

                        <Button
                            variant="secondary"
                            className="vent-knapp"
                            onClick={() => this.handleShowSettPaaVentModal(true)}
                            disabled={false}
                        >
                            {intlHelper(intl, 'skjema.knapp.settpaavent')}
                        </Button>
                    </p>
                </div>

                <VerticalSpacer sixteenPx />

                {punchFormState.updateSoknadError && (
                    <Alert size="small" variant="error">
                        {intlHelper(intl, 'skjema.feil.ikke_lagret')}
                    </Alert>
                )}
                {punchFormState.inputErrors?.length && (
                    <Alert size="small" variant="error" className="valideringstripefeil">
                        {intlHelper(intl, 'skjema.feil.validering')}
                    </Alert>
                )}
                {punchFormState.submitSoknadError && (
                    <Alert size="small" variant="error">
                        {intlHelper(intl, 'skjema.feil.ikke_sendt')}
                    </Alert>
                )}
                {punchFormState.submitSoknadConflict && (
                    <Alert size="small" variant="error">
                        {intlHelper(intl, 'skjema.feil.konflikt')}
                    </Alert>
                )}

                {this.state.showSettPaaVentModal && (
                    <SettPaaVentModal
                        journalposter={this.props.journalposterState.journalposter.filter(
                            (jp) => jp.journalpostId !== this.props.journalpostid,
                        )}
                        soknadId={soknad.soeknadId}
                        submit={() => this.handleSettPaaVent()}
                        onClose={() => this.handleShowSettPaaVentModal(false)}
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
                            className="validertSoknadModal"
                            onClose={() => this.props.validerSoknadReset()}
                            aria-label="validertSoknadModal"
                            open={this.props.punchFormState.isValid}
                        >
                            <Modal.Body>
                                <div className={classNames('validertSoknadOppsummeringContainer')}>
                                    <OMPKSSoknadKvittering response={this.props.punchFormState.validertSoknad} />
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
                    <ErDuSikkerModal
                        melding="modal.erdusikker.sendinn"
                        modalKey="erdusikkermodal"
                        extraInfo="modal.erdusikker.sendinn.extrainfo"
                        open={this.state.visErDuSikkerModal}
                        submitKnappText="skjema.knapp.send"
                        onSubmit={() => this.props.submitSoknad(this.state.soknad.soekerId, this.props.id)}
                        onClose={() => {
                            this.props.validerSoknadReset();
                            this.handleVisErDuSikkerModal(false);
                        }}
                    />
                )}
            </>
        );
    }
}

const mapStateToProps = (state: RootStateType): IPunchOMPKSFormStateProps => ({
    punchFormState: state.OMSORGSPENGER_KRONISK_SYKT_BARN.punchFormState,
    signaturState: state.OMSORGSPENGER_KRONISK_SYKT_BARN.signaturState,
    journalposterState: state.journalposterPerIdentState,
    identState: state.identState,
});

const mapDispatchToProps = (dispatch: any) => ({
    getSoknad: (id: string) => dispatch(getOMPKSSoknad(id)),
    resetSoknadAction: () => dispatch(resetOMPKSSoknadAction()),
    undoChoiceOfEksisterendeSoknadAction: () => dispatch(undoChoiceOfEksisterendeOMPKSSoknadAction()),
    updateSoknad: (soknad: Partial<IOMPKSSoknadUt>) => dispatch(updateOMPKSSoknad(soknad)),
    submitSoknad: (ident: string, soeknadid: string) => dispatch(submitOMPKSSoknad(ident, soeknadid)),
    resetPunchFormAction: () => dispatch(resetPunchOMPKSFormAction()),
    setSignaturAction: (signert: JaNeiIkkeRelevant | null) => dispatch(setSignaturAction(signert)),
    resetAllStateAction: () => dispatch(resetAllStateAction()),
    settJournalpostPaaVent: (journalpostid: string, soeknadid: string) =>
        dispatch(settJournalpostPaaVent(journalpostid, soeknadid)),
    settPaaventResetAction: () => dispatch(setJournalpostPaaVentResetAction()),
    validateSoknad: (soknad: IOMPKSSoknadUt, erMellomlagring: boolean) =>
        dispatch(validerOMPKSSoknad(soknad, erMellomlagring)),
    validerSoknadReset: () => dispatch(validerOMPKSSoknadResetAction()),
});

export const OMPKSPunchForm = withHooks(
    injectIntl(connect(mapStateToProps, mapDispatchToProps)(PunchOMPKSFormComponent)),
);
