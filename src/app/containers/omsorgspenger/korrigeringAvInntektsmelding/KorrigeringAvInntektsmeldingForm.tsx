import intlHelper from 'app/utils/intlUtils';
import { Form, Formik } from 'formik';
import { AlertStripeInfo } from 'nav-frontend-alertstriper';
import Panel from 'nav-frontend-paneler';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import './KorrigeringAvInntektsmeldingForm.less';
import LeggTilDelvisFravær from './LeggTilDelvisFravær';
import LeggTilHelePerioder from './LeggTilHelePerioder';
import TrekkPerioder from './TrekkPerioder';
import VirksomhetPanel from './VirksomhetPanel';
import { KorrigeringAvInntektsmeldingFormFields } from './KorrigeringAvInntektsmeldingFormFieldsValues';

export default function KorrigeringAvInntektsmeldingForm(): JSX.Element {
    const intl = useIntl();
    const [åpnePaneler, setÅpnePaneler] = useState({
        trekkperioderPanel: false,
        leggTilHelePerioderPanel: false,
        leggTilDelvisFravær: false,
    });
    const togglePaneler = (panel: { [key: string]: boolean }) => setÅpnePaneler({ ...åpnePaneler, ...panel });
    return (
        <Formik
            initialValues={{
                [KorrigeringAvInntektsmeldingFormFields.VIRKSOMHET]: '',
                [KorrigeringAvInntektsmeldingFormFields.TREKKPERIODER]: [{ fom: '', tom: '' }],
                [KorrigeringAvInntektsmeldingFormFields.PERIODER_MED_REFUSJONSKRAV]: [{ fom: '', tom: '' }],
            }}
            onSubmit={(values, actions) => {
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
                    <VirksomhetPanel />

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
            </Form>
        </Formik>
    );
}
