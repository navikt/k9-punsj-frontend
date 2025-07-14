import React, { useReducer } from 'react';

import { Form, Formik } from 'formik';
import { FormattedMessage, useIntl } from 'react-intl';
import { Alert, Box, Button, Heading, List, Modal } from '@navikt/ds-react';
import Feilmelding from 'app/components/Feilmelding';
import { ValideringResponse } from 'app/models/types/ValideringResponse';
import {
    submitOMSKorrigering,
    updateOMSKorrigering,
    validerOMSKorrigering,
} from 'app/state/actions/OMSPunchFormActions';
import { getEnvironmentVariable } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';
import ErDuSikkerModal from '../../../components/ErDuSikkerModal';
import {
    KorrigeringAvInntektsmeldingFormFields,
    KorrigeringAvInntektsmeldingFormValues,
} from '../types/KorrigeringAvInntektsmeldingFormFieldsValues';
import LeggTilDelvisFravær from './LeggTilDelvisFravær/LeggTilDelvisFravær';
import OMSKvittering from './SøknadKvittering/OMSKvittering';
import OpplysningerOmKorrigering from './OpplysningerOmKorrigering/OpplysningerOmKorrigering';
import TrekkPerioder from './TrekkPerioder';
import VirksomhetPanel from './VirksomhetPanel/VirksomhetPanel';
import { getFormErrors } from './korrigeringAvFormValidering';
import ActionType from '../state/actions/korrigeringAvInntektsmeldingActions';
import korrigeringAvInntektsmeldingReducer from '../state/reducers/korrigeringAvInntektsmeldingReducer';
import { OMSKorrigering } from 'app/models/types/OMSKorrigering';

import './KorrigeringAvInntektsmeldingForm.less';

interface Props {
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

const KorrigeringAvInntektsmeldingForm: React.FC<Props> = ({ søkerId, søknadId, journalposter }: Props) => {
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
                    formError: intlHelper(intl, 'omsorgspenger.korrigeringAvInntektsmelding.innsendingError'),
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

                <div className="my-8">
                    <Button
                        onClick={() => {
                            window.location.href = getEnvironmentVariable('K9_LOS_URL');
                        }}
                    >
                        <FormattedMessage id="tilbaketilLOS" />
                    </Button>
                </div>

                <div className="mb-6">
                    <Heading size="small" level="3">
                        <FormattedMessage id="skjema.kvittering.oppsummering" />
                    </Heading>
                </div>

                <Box padding="6" borderWidth="1" borderRadius="medium" borderColor="border-info">
                    <OMSKvittering feltverdier={innsendteFormverdier} />
                </Box>
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
                        const globalFormError = data?.feil?.find((feil) => feil.feilmelding !== 'temporal');
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
                        <Box padding="4">
                            <div className="mb-4">
                                <Heading size="medium" level="2">
                                    <FormattedMessage id="omsorgspenger.korrigeringAvInntektsmelding.header" />
                                </Heading>
                            </div>

                            <Alert size="small" variant="info" className="korrigering__headerInfo">
                                <Heading size="small" level="2">
                                    <FormattedMessage id="omsorgspenger.korrigeringAvInntektsmelding.header" />
                                </Heading>

                                <List as="ul">
                                    <List.Item>
                                        <FormattedMessage id="omsorgspenger.korrigeringAvInntektsmelding.header.info.listElement.1" />
                                    </List.Item>
                                    <List.Item>
                                        <FormattedMessage id="omsorgspenger.korrigeringAvInntektsmelding.header.info.listElement.2" />
                                    </List.Item>
                                </List>
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
                        </Box>

                        <Button>
                            <FormattedMessage id="omsorgspenger.korrigeringAvInntektsmelding.sendInn" />
                        </Button>
                    </Form>

                    {visBekreftelsemodal && (
                        <Modal
                            key="validertSoknadModal"
                            onClose={() => dispatch({ type: ActionType.SKJUL_BEKREFTELSEMODAL })}
                            aria-label="validertSoknadModal"
                            data-test-id="validertSoknadModal"
                            open
                        >
                            <Modal.Header closeButton={false}>
                                <Heading size="medium" level="1" data-test-id="OMPKorrigeringPunchFormKvitteringHeader">
                                    <FormattedMessage id="skjema.kvittering.oppsummering" />
                                </Heading>
                            </Modal.Header>

                            <Modal.Body>
                                <OMSKvittering feltverdier={values} />
                            </Modal.Body>

                            <Modal.Footer>
                                <Button
                                    size="small"
                                    onClick={() => dispatch({ type: ActionType.VIS_ER_DU_SIKKER_MODAL })}
                                >
                                    <FormattedMessage id="fordeling.knapp.videre" />
                                </Button>

                                <Button
                                    variant="secondary"
                                    size="small"
                                    onClick={() => dispatch({ type: ActionType.SKJUL_BEKREFTELSEMODAL })}
                                >
                                    <FormattedMessage id="skjema.knapp.avbryt" />
                                </Button>
                            </Modal.Footer>
                        </Modal>
                    )}

                    {visErDuSikkerModal && (
                        <ErDuSikkerModal
                            modalKey="modalerdusikkersendinn"
                            melding="modal.erdusikker.sendinn"
                            extraInfo="modal.erdusikker.sendinn.extrainfo"
                            open
                            submitKnappText="skjema.knapp.send"
                            onSubmit={() => sendInnKorrigering(values)}
                            onClose={() => {
                                dispatch({ type: ActionType.SKJUL_ER_DU_SIKKER_MODAL });
                            }}
                        />
                    )}
                </>
            )}
        </Formik>
    );
};

export default KorrigeringAvInntektsmeldingForm;
