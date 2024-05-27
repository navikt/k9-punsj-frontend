import { Form, Formik } from 'formik';
import React, { useReducer } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { Alert, Button, Modal, Panel } from '@navikt/ds-react';

import Feilmelding from 'app/components/Feilmelding';
import { ValideringResponse } from 'app/models/types/ValideringResponse';
import {
    submitOMSKorrigering,
    updateOMSKorrigering,
    validerOMSKorrigering,
} from 'app/state/actions/OMSPunchFormActions';
import { getEnvironmentVariable } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';

import { OMSKorrigering } from '../../../models/types/OMSKorrigering';
import BekreftInnsendingModal from './BekreftInnsendingModal';
import ErDuSikkerModal from './ErDuSikkerModal';
import './KorrigeringAvInntektsmeldingForm.less';
import {
    KorrigeringAvInntektsmeldingFormFields,
    KorrigeringAvInntektsmeldingFormValues,
} from './KorrigeringAvInntektsmeldingFormFieldsValues';
import LeggTilDelvisFravær from './LeggTilDelvisFravær';
import OMSKvittering from './OMSKvittering';
import OpplysningerOmKorrigering from './OpplysningerOmKorrigering';
import TrekkPerioder from './TrekkPerioder';
import VirksomhetPanel from './VirksomhetPanel';
import { getFormErrors } from './korrigeringAvFormValidering';
import ActionType from './korrigeringAvInntektsmeldingActions';
import korrigeringAvInntektsmeldingReducer from './korrigeringAvInntektsmeldingReducer';

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
                <Alert size="small" variant="info" className="fullfortmelding">
                    <FormattedMessage id="skjema.sentInn" />
                </Alert>
                <div className="punchPage__knapper mt-8">
                    <Button
                        onClick={() => {
                            window.location.href = getEnvironmentVariable('K9_LOS_URL');
                        }}
                    >
                        {intlHelper(intl, 'tilbaketilLOS')}
                    </Button>
                </div>
                <OMSKvittering feltverdier={innsendteFormverdier} />
            </>
        );
    }

    return (
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
                    .then((data: ValideringResponse) => {
                        const errors = getFormErrors(values, data);
                        const globalFormError = data?.feil?.find(
                            (feil) => feil.felt === 'søknad' && feil.feilmelding !== 'temporal',
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
                            <Alert size="small" variant="info" className="korrigering__headerInfo">
                                Korrigering av inntektsmelding skal benyttes til å:
                                <ul>
                                    <li> Slette dager/timer arbeidsgiver melder fra de har fått for mye</li>
                                    <li>Endre dager til timer, når arbeidsgiver melder de har fått for mye</li>
                                </ul>
                            </Alert>
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
                            {/* <LeggTilHelePerioder
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
                                /> */}
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
                            <Button>Send inn</Button>
                        </div>
                    </Form>
                    {visBekreftelsemodal && (
                        <Modal
                            onClose={() => {
                                dispatch({ type: ActionType.SKJUL_BEKREFTELSEMODAL });
                            }}
                            aria-label="Er du sikker?"
                            open={visBekreftelsemodal}
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
                        </Modal>
                    )}
                    {visErDuSikkerModal && (
                        <Modal
                            onClose={() => {
                                dispatch({ type: ActionType.SKJUL_ER_DU_SIKKER_MODAL });
                            }}
                            aria-label="Er du sikker?"
                            open
                        >
                            <ErDuSikkerModal
                                melding="modal.erdusikker.sendinn"
                                extraInfo="modal.erdusikker.sendinn.extrainfo"
                                onSubmit={() => sendInnKorrigering(values)}
                                submitKnappText="skjema.knapp.send"
                                onClose={() => {
                                    dispatch({ type: ActionType.SKJUL_ER_DU_SIKKER_MODAL });
                                }}
                            />
                        </Modal>
                    )}
                </>
            )}
        </Formik>
    );
};

export default KorrigeringAvInntektsmeldingForm;
