import { validerOMSSoknad } from 'app/state/actions/OMSPunchFormActions';
import intlHelper from 'app/utils/intlUtils';
import { Form, Formik } from 'formik';
import { AlertStripeInfo } from 'nav-frontend-alertstriper';
import { Hovedknapp } from 'nav-frontend-knapper';
import Panel from 'nav-frontend-paneler';
import React from 'react';
import { useIntl } from 'react-intl';
import ActionType from './korrigeringAvInntektsmeldingActions';
import './KorrigeringAvInntektsmeldingForm.less';
import {
    KorrigeringAvInntektsmeldingFormFields,
    KorrigeringAvInntektsmeldingFormValues,
} from './KorrigeringAvInntektsmeldingFormFieldsValues';
import korrigeringAvInntektsmeldingReducer from './korrigeringAvInntektsmeldingReducer';
import LeggTilDelvisFravær from './LeggTilDelvisFravær';
import LeggTilHelePerioder from './LeggTilHelePerioder';
import TrekkPerioder from './TrekkPerioder';
import VirksomhetPanel from './VirksomhetPanel';
import { OMSSoknadUt } from '../../../models/types/OMSSoknadUt';

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
    });
    const { åpnePaneler, isLoading } = state;
    const togglePaneler = (panel: { [key: string]: boolean }) =>
        dispatch({ type: ActionType.SET_ÅPNE_PANELER, åpnePaneler: { ...åpnePaneler, ...panel } });

    const validerSøknad = (values: KorrigeringAvInntektsmeldingFormValues) => {
        dispatch({ type: ActionType.VALIDER_SØKNAD_START });
        const soknad = new OMSSoknadUt(values, søknadId, søkerId, journalposter);
        validerOMSSoknad(soknad, (response, data) => {
            if (response.status === 202) {
                dispatch({ type: ActionType.VALIDER_SØKNAD_SUCCESS });
            } else if (response.status === 400) {
                dispatch({ type: ActionType.VALIDER_SØKNAD_ERROR });
            }
        });
    };

    return (
        <Formik
            initialValues={{
                [KorrigeringAvInntektsmeldingFormFields.Virksomhet]: '',
                [KorrigeringAvInntektsmeldingFormFields.ArbeidsforholdId]: '',
                [KorrigeringAvInntektsmeldingFormFields.Trekkperioder]: [{ fom: '', tom: '' }],
                [KorrigeringAvInntektsmeldingFormFields.PerioderMedRefusjonskrav]: [{ fom: '', tom: '' }],
                [KorrigeringAvInntektsmeldingFormFields.DagerMedDelvisFravær]: [{ dato: '', timer: '' }],
            }}
            onSubmit={(values, actions) => {
                validerSøknad(values);
                console.log({ values, actions });
                actions.setSubmitting(false);
            }}
        >
            <Form>
                <Panel border>
                    <h3>{intlHelper(intl, 'omsorgspenger.korrigeringAvInntektsmelding.header')}</h3>
                    <AlertStripeInfo>
                        {intlHelper(intl, 'omsorgspenger.korrigeringAvInntektsmelding.header.info')}
                    </AlertStripeInfo>
                    <VirksomhetPanel søkerId={søkerId} />

                    <TrekkPerioder
                        isPanelOpen={åpnePaneler.trekkperioderPanel}
                        togglePanel={() => togglePaneler({ trekkperioderPanel: !åpnePaneler.trekkperioderPanel })}
                    />
                    <LeggTilHelePerioder
                        isPanelOpen={åpnePaneler.leggTilHelePerioderPanel}
                        togglePanel={() =>
                            togglePaneler({ leggTilHelePerioderPanel: !åpnePaneler.leggTilHelePerioderPanel })
                        }
                    />
                    <LeggTilDelvisFravær
                        isPanelOpen={åpnePaneler.leggTilDelvisFravær}
                        togglePanel={() => togglePaneler({ leggTilDelvisFravær: !åpnePaneler.leggTilDelvisFravær })}
                    />
                </Panel>
                <div className="korrigering__buttonContainer">
                    <Hovedknapp disabled={isLoading}>Send inn</Hovedknapp>
                </div>
            </Form>
        </Formik>
    );
};

export default KorrigeringAvInntektsmeldingForm;
