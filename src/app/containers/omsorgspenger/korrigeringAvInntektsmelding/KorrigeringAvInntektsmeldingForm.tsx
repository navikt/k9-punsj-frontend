import React from 'react';
import { useIntl } from 'react-intl';
import Panel from 'nav-frontend-paneler';
import { AlertStripeInfo } from 'nav-frontend-alertstriper';
import intlHelper from 'app/utils/intlUtils';
import VirksomhetPanel from './VirksomhetPanel';
import TrekkPerioder from './TrekkPerioder';
import LeggTilHelePerioder from './LeggTilHelePerioder';
import LeggTilDelvisFravær from './LeggTilDelvisFravær';
import './KorrigeringAvInntektsmeldingForm.less';

export default function KorrigeringAvInntektsmeldingForm(): JSX.Element {
    const intl = useIntl();
    return (
        <Panel border>
            <h3>{intlHelper(intl, 'omsorgspenger.korrigeringAvInntektsmelding.header')}</h3>
            <AlertStripeInfo>
                {intlHelper(intl, 'omsorgspenger.korrigeringAvInntektsmelding.header.info')}
            </AlertStripeInfo>
            <VirksomhetPanel arbeidsgivere={[]} />
            <TrekkPerioder />
            <LeggTilHelePerioder />
            <LeggTilDelvisFravær />
        </Panel>
    );
}
