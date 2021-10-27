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

export default function KorrigeringAvInntektsmeldingForm(): JSX.Element {
    const intl = useIntl();
    const [åpnePaneler, setÅpnePaneler] = useState({
        trekkperioderPanel: false,
        leggTilHelePeriderPanel: false,
        leggTilDelvisFravær: false,
    });
    const togglePaneler = (panel: { [key: string]: boolean }) => setÅpnePaneler({ ...åpnePaneler, ...panel });
    return (
        <Formik
            initialValues={{
                test: '',
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
                    <LeggTilHelePerioder />
                    <LeggTilDelvisFravær />
                </Panel>
            </Form>
        </Formik>
    );
}
