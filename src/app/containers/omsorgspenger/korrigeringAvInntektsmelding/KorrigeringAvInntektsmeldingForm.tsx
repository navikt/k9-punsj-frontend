import { validerOMSSoknad, updateOMSSoknad, submitOMSSoknad } from 'app/state/actions/OMSPunchFormActions';
import { getEnvironmentVariable } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';
import { Form, Formik } from 'formik';
import { AlertStripeInfo } from 'nav-frontend-alertstriper';
import { Hovedknapp } from 'nav-frontend-knapper';
import ModalWrapper from 'nav-frontend-modal';
import Panel from 'nav-frontend-paneler';
import React, { useReducer } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { OMSSoknadUt } from '../../../models/types/OMSSoknadUt';
import BekreftInnsendingModal from './BekreftInnsendingModal';
import ErDuSikkerModal from './ErDuSikkerModal';
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
import OpplysningerOmSøknaden from './OpplysningerOmSøknaden';
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
    søknadErInnsendt: false,
    innsendteFormverdier: undefined,
};

const KorrigeringAvInntektsmeldingForm: React.FC<KorrigeringAvInntektsmeldingFormProps> = ({
    søkerId,
    søknadId,
    journalposter,
}): JSX.Element => {
    const intl = useIntl();
    const [state, dispatch] = useReducer(korrigeringAvInntektsmeldingReducer, initialFormState);
    const { åpnePaneler, isLoading, visBekreftelsemodal, visErDuSikkerModal, søknadErInnsendt, innsendteFormverdier } =
        state;
    const togglePaneler = (panel: { [key: string]: boolean }) =>
        dispatch({ type: ActionType.SET_ÅPNE_PANELER, åpnePaneler: { ...åpnePaneler, ...panel } });

    const oppdaterSøknad = (values: KorrigeringAvInntektsmeldingFormValues) => {
        const soknad = new OMSSoknadUt(values, søknadId, søkerId, journalposter);
        updateOMSSoknad(soknad);
    };

    const validerSøknad = (values: KorrigeringAvInntektsmeldingFormValues) => {
        dispatch({ type: ActionType.VALIDER_SØKNAD_START });
        const soknad = new OMSSoknadUt(values, søknadId, søkerId, journalposter);
        validerOMSSoknad(soknad, (response, data) => {
            if (response.status === 202) {
                oppdaterSøknad(values);
                dispatch({ type: ActionType.VIS_BEKREFTELSEMODAL });
            } else if (response.status === 400) {
                dispatch({ type: ActionType.VALIDER_SØKNAD_ERROR });
            }
        });
    };

    const sendInnSøknad = (formVerdier: KorrigeringAvInntektsmeldingFormValues) => {
        // setIsLoading(true);
        submitOMSSoknad(søkerId, søknadId, (response, responseData) => {
            switch (response.status) {
                case 202: {
                    // setIsLoading(false);
                    dispatch({ type: ActionType.SET_SØKNAD_INNSENDT, innsendteFormverdier: formVerdier });
                    break;
                }
                case 400: {
                    console.log('400');
                    break;
                }
                case 409: {
                    console.log('409');
                    break;
                }
                default: {
                    console.log('default??');
                }
            }
        });
    };

    const getIinitialPeriode = () => ({ fom: '', tom: '' });

    if (søknadErInnsendt && innsendteFormverdier) {
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
                    [KorrigeringAvInntektsmeldingFormFields.OpplysningerOmSøknaden]: { dato: '', klokkeslett: '' },
                    [KorrigeringAvInntektsmeldingFormFields.Virksomhet]: '',
                    [KorrigeringAvInntektsmeldingFormFields.ArbeidsforholdId]: '',
                    [KorrigeringAvInntektsmeldingFormFields.Trekkperioder]: [getIinitialPeriode()],
                    [KorrigeringAvInntektsmeldingFormFields.PerioderMedRefusjonskrav]: [getIinitialPeriode()],
                    [KorrigeringAvInntektsmeldingFormFields.DagerMedDelvisFravær]: [{ dato: '', timer: '' }],
                }}
                onSubmit={(values, actions) => {
                    validerSøknad(values);
                    console.log({ values, actions });
                    actions.setSubmitting(false);
                }}
                validate={(values) => {
                    oppdaterSøknad(values);
                    const errors = {};
                    return errors;
                }}
            >
                {({ setFieldValue, values }) => (
                    <>
                        <Form className="korrigering">
                            <Panel border>
                                <h3>{intlHelper(intl, 'omsorgspenger.korrigeringAvInntektsmelding.header')}</h3>
                                <AlertStripeInfo>
                                    {intlHelper(intl, 'omsorgspenger.korrigeringAvInntektsmelding.header.info')}
                                </AlertStripeInfo>
                                <OpplysningerOmSøknaden />
                                <VirksomhetPanel søkerId={søkerId} />
                                <TrekkPerioder
                                    isPanelOpen={åpnePaneler.trekkperioderPanel}
                                    togglePanel={() => {
                                        const toggledPanel = !åpnePaneler.trekkperioderPanel;
                                        togglePaneler({ trekkperioderPanel: toggledPanel });
                                        if (!toggledPanel) {
                                            setFieldValue(KorrigeringAvInntektsmeldingFormFields.Trekkperioder, [
                                                getIinitialPeriode(),
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
                                                [getIinitialPeriode()]
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
                                    onSubmit={() => sendInnSøknad(values)}
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
