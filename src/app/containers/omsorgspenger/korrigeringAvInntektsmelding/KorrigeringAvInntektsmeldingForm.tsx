import { validerOMSSoknad, updateOMSSoknad } from 'app/state/actions/OMSPunchFormActions';
import intlHelper from 'app/utils/intlUtils';
import { Form, Formik } from 'formik';
import { AlertStripeInfo } from 'nav-frontend-alertstriper';
import { Hovedknapp } from 'nav-frontend-knapper';
import ModalWrapper from 'nav-frontend-modal';
import Panel from 'nav-frontend-paneler';
import React from 'react';
import { useIntl } from 'react-intl';
import { OMSSoknadUt } from '../../../models/types/OMSSoknadUt';
import BekreftInnsendingModal from './BekreftInnsendingModal';
import ActionType from './korrigeringAvInntektsmeldingActions';
import './korrigeringAvInntektsmeldingForm.less';
import {
    KorrigeringAvInntektsmeldingFormFields,
    KorrigeringAvInntektsmeldingFormValues,
} from './KorrigeringAvInntektsmeldingFormFieldsValues';
import korrigeringAvInntektsmeldingReducer from './korrigeringAvInntektsmeldingReducer';
import LeggTilDelvisFravær from './LeggTilDelvisFravær';
import LeggTilHelePerioder from './LeggTilHelePerioder';
import OpplysningerOmSøknaden from './OpplysningerOmSøknaden';
import TrekkPerioder from './TrekkPerioder';
import VirksomhetPanel from './VirksomhetPanel';

interface KorrigeringAvInntektsmeldingFormProps {
    søkerId: string;
    søknadId: string;
    journalposter: string[];
}

const KorrigeringAvInntektsmeldingForm: React.FC<KorrigeringAvInntektsmeldingFormProps> = ({
    søkerId,
    søknadId,
    journalposter,
}): JSX.Element => {
    const intl = useIntl();
    const [state, dispatch] = React.useReducer(korrigeringAvInntektsmeldingReducer, {
        åpnePaneler: {
            trekkperioderPanel: false,
            leggTilHelePerioderPanel: false,
            leggTilDelvisFravær: false,
        },
        isLoading: false,
        visBekreftelsemodal: false,
    });
    const { åpnePaneler, isLoading, visBekreftelsemodal } = state;
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

    const getIinitialPeriode = () => ({ fom: '', tom: '' });

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
                                    søknadId={søknadId}
                                    søkerId={søkerId}
                                    lukkModal={() => {
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
