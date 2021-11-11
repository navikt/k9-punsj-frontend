import Feilmelding from 'app/components/Feilmelding';
import { ValiderOMSKorrigeringResponse } from 'app/models/types/ValiderOMSKorrigeringResponse';
import {
    submitOMSKorrigering,
    updateOMSKorrigering,
    validerOMSKorrigering,
} from 'app/state/actions/OMSPunchFormActions';
import { getEnvironmentVariable } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';
import { Form, Formik } from 'formik';
import { AlertStripeInfo } from 'nav-frontend-alertstriper';
import { Hovedknapp } from 'nav-frontend-knapper';
import ModalWrapper from 'nav-frontend-modal';
import Panel from 'nav-frontend-paneler';
import React, { useReducer } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { OMSKorrigering } from '../../../models/types/OMSKorrigering';
import BekreftInnsendingModal from './BekreftInnsendingModal';
import ErDuSikkerModal from './ErDuSikkerModal';
import { getFormErrors } from './korrigeringAvFormValidering';
import ActionType from './korrigeringAvInntektsmeldingActions';
import './KorrigeringAvInntektsmeldingForm.less';
import {
    KorrigeringAvInntektsmeldingFormFields,
    KorrigeringAvInntektsmeldingFormValues,
} from './KorrigeringAvInntektsmeldingFormFieldsValues';
import korrigeringAvInntektsmeldingReducer from './korrigeringAvInntektsmeldingReducer';
import LeggTilDelvisFravær from './LeggTilDelvisFravær';
import LeggTilHelePerioder from './LeggTilHelePerioder';
import OMSKvittering from './OMSKvittering';
import OpplysningerOmKorrigering from './OpplysningerOmKorrigering';
import TrekkPerioder from './TrekkPerioder';
import VirksomhetPanel from './VirksomhetPanel';

interface KorrigeringAvInntektsmeldingFormProps {
    søkerId: string;
    søknadId: string;
    journalposter: string[];
}

const initialFormState = {
    åpnePaneler: {
        trekkperioderPanel: false,
        leggTilHelePerioderPanel: false,
        leggTilDelvisFravær: false,
    },
    isLoading: false,
    visBekreftelsemodal: false,
    visErDuSikkerModal: false,
    korrigeringErInnsendt: false,
    innsendteFormverdier: undefined,
    formError: '',
    hasSubmitted: false,
};

const getInitialPeriode = () => ({ fom: '', tom: '' });

const KorrigeringAvInntektsmeldingForm: React.FC<KorrigeringAvInntektsmeldingFormProps> = ({
    søkerId,
    søknadId,
    journalposter,
}): JSX.Element => {
    const intl = useIntl();
    const [state, dispatch] = useReducer(korrigeringAvInntektsmeldingReducer, initialFormState);
    const {
        åpnePaneler,
        visBekreftelsemodal,
        visErDuSikkerModal,
        korrigeringErInnsendt,
        innsendteFormverdier,
        formError,
        hasSubmitted,
    } = state;
    const togglePaneler = (panel: { [key: string]: boolean }) =>
        dispatch({ type: ActionType.SET_ÅPNE_PANELER, åpnePaneler: { ...åpnePaneler, ...panel } });

    const oppdaterKorrigering = (values: KorrigeringAvInntektsmeldingFormValues) => {
        const korrigering = new OMSKorrigering(values, søknadId, søkerId, journalposter);
        updateOMSKorrigering(korrigering);
    };

    const validerKorrigering = (values: KorrigeringAvInntektsmeldingFormValues) => {
        dispatch({ type: ActionType.VALIDER_KORRIGERING_START });
        const korrigering = new OMSKorrigering(values, søknadId, søkerId, journalposter);
        validerOMSKorrigering(korrigering).then((response) => {
            if (response.status === 202) {
                oppdaterKorrigering(values);
                dispatch({ type: ActionType.VIS_BEKREFTELSEMODAL });
            } else if (response.status === 400) {
                dispatch({ type: ActionType.VALIDER_KORRIGERING_ERROR });
            }
        });
    };

    const sendInnKorrigering = (formVerdier: KorrigeringAvInntektsmeldingFormValues) => {
        submitOMSKorrigering(søkerId, søknadId, (response) => {
            if (response.status === 202) {
                dispatch({ type: ActionType.SET_KORRIGERING_INNSENDT, innsendteFormverdier: formVerdier });
            } else {
                dispatch({
                    type: ActionType.SET_FORM_ERROR,
                    formError: 'Innsending av korrigering feilet',
                });
            }
        });
    };

    if (korrigeringErInnsendt && innsendteFormverdier) {
        return (
            <>
                <AlertStripeInfo className="fullfortmelding">
                    <FormattedMessage id="skjema.sentInn" />
                </AlertStripeInfo>
                <div className="punchPage__knapper">
                    <Hovedknapp
                        onClick={() => {
                            window.location.href = getEnvironmentVariable('K9_LOS_URL');
                        }}
                    >
                        {intlHelper(intl, 'tilbaketilLOS')}
                    </Hovedknapp>
                </div>
                <OMSKvittering feltverdier={innsendteFormverdier} />
            </>
        );
    }

    return (
        <>
            <Formik
                initialValues={{
                    [KorrigeringAvInntektsmeldingFormFields.OpplysningerOmKorrigering]: { dato: '', klokkeslett: '' },
                    [KorrigeringAvInntektsmeldingFormFields.Virksomhet]: '',
                    [KorrigeringAvInntektsmeldingFormFields.ArbeidsforholdId]: '',
                    [KorrigeringAvInntektsmeldingFormFields.Trekkperioder]: [getInitialPeriode()],
                    [KorrigeringAvInntektsmeldingFormFields.PerioderMedRefusjonskrav]: [getInitialPeriode()],
                    [KorrigeringAvInntektsmeldingFormFields.DagerMedDelvisFravær]: [{ dato: '', timer: '' }],
                }}
                onSubmit={(values, actions) => {
                    validerKorrigering(values);
                    actions.setSubmitting(false);
                }}
                validate={(values) => {
                    oppdaterKorrigering(values);
                    const korrigering = new OMSKorrigering(values, søknadId, søkerId, journalposter);
                    return validerOMSKorrigering(korrigering)
                        .then((response) => response.json())
                        .then((data: ValiderOMSKorrigeringResponse) => {
                            const errors = getFormErrors(values, data);
                            const globalFormError = data?.feil?.find(
                                (feil) => feil.felt === 'søknad' && feil.feilmelding !== 'temporal'
                            );
                            dispatch({
                                type: ActionType.SET_FORM_ERROR,
                                formError: globalFormError?.feilmelding || '',
                            });
                            return errors;
                        });
                }}
            >
                {({ setFieldValue, values }) => (
                    <>
                        <Form className="korrigering">
                            <Panel border>
                                <h2>{intlHelper(intl, 'omsorgspenger.korrigeringAvInntektsmelding.header')}</h2>
                                <AlertStripeInfo className="korrigering__headerInfo">
                                    {intlHelper(intl, 'omsorgspenger.korrigeringAvInntektsmelding.header.info')}
                                </AlertStripeInfo>
                                <div className="korrigering__opplysningerOmKorrigeringContainer">
                                    <OpplysningerOmKorrigering />
                                </div>
                                <div className="korrigering__virksomhetpanelContainer">
                                    <VirksomhetPanel søkerId={søkerId} />
                                </div>
                                <TrekkPerioder
                                    isPanelOpen={åpnePaneler.trekkperioderPanel}
                                    togglePanel={() => {
                                        const toggledPanel = !åpnePaneler.trekkperioderPanel;
                                        togglePaneler({ trekkperioderPanel: toggledPanel });
                                        if (!toggledPanel) {
                                            setFieldValue(KorrigeringAvInntektsmeldingFormFields.Trekkperioder, [
                                                getInitialPeriode(),
                                            ]);
                                        }
                                    }}
                                />
                                <LeggTilHelePerioder
                                    isPanelOpen={åpnePaneler.leggTilHelePerioderPanel}
                                    togglePanel={() => {
                                        const toggledPanel = !åpnePaneler.leggTilHelePerioderPanel;
                                        togglePaneler({ leggTilHelePerioderPanel: toggledPanel });
                                        if (!toggledPanel) {
                                            setFieldValue(
                                                KorrigeringAvInntektsmeldingFormFields.PerioderMedRefusjonskrav,
                                                [getInitialPeriode()]
                                            );
                                        }
                                    }}
                                />
                                <LeggTilDelvisFravær
                                    isPanelOpen={åpnePaneler.leggTilDelvisFravær}
                                    togglePanel={() => {
                                        const toggledPanel = !åpnePaneler.leggTilDelvisFravær;
                                        togglePaneler({ leggTilDelvisFravær: toggledPanel });
                                        if (!toggledPanel) {
                                            setFieldValue(KorrigeringAvInntektsmeldingFormFields.DagerMedDelvisFravær, [
                                                {
                                                    dato: '',
                                                    timer: '',
                                                },
                                            ]);
                                        }
                                    }}
                                />
                                {formError && hasSubmitted && (
                                    <div className="korrigering__feilmelding">
                                        <Feilmelding feil={formError} />
                                    </div>
                                )}
                            </Panel>
                            <div className="korrigering__buttonContainer">
                                <Hovedknapp>Send inn</Hovedknapp>
                            </div>
                        </Form>
                        {visBekreftelsemodal && (
                            <ModalWrapper
                                onRequestClose={() => {
                                    dispatch({ type: ActionType.SKJUL_BEKREFTELSEMODAL });
                                }}
                                contentLabel="Er du sikker?"
                                closeButton={false}
                                isOpen={visBekreftelsemodal}
                            >
                                <BekreftInnsendingModal
                                    feltverdier={values}
                                    lukkModal={() => {
                                        dispatch({ type: ActionType.SKJUL_BEKREFTELSEMODAL });
                                    }}
                                    handleVidere={() => {
                                        dispatch({ type: ActionType.VIS_ER_DU_SIKKER_MODAL });
                                    }}
                                />
                            </ModalWrapper>
                        )}
                        {visErDuSikkerModal && (
                            <ModalWrapper
                                onRequestClose={() => {
                                    dispatch({ type: ActionType.SKJUL_BEKREFTELSEMODAL });
                                }}
                                contentLabel="Er du sikker?"
                                closeButton={false}
                                isOpen
                            >
                                <ErDuSikkerModal
                                    melding="modal.erdusikker.sendinn"
                                    extraInfo="modal.erdusikker.sendinn.extrainfo"
                                    onSubmit={() => sendInnKorrigering(values)}
                                    submitKnappText="skjema.knapp.send"
                                    onClose={() => {
                                        dispatch({ type: ActionType.SKJUL_BEKREFTELSEMODAL });
                                    }}
                                />
                            </ModalWrapper>
                        )}
                    </>
                )}
            </Formik>
        </>
    );
};

export default KorrigeringAvInntektsmeldingForm;
