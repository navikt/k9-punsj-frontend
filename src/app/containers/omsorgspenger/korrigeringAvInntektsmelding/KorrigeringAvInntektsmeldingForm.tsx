import React from 'react';
import Panel from 'nav-frontend-paneler';
import { CheckboksPanel, SkjemaGruppe } from 'nav-frontend-skjema';
import VerticalSpacer from 'app/components/VerticalSpacer';
import VirksomhetPanel from './VirksomhetPanel';

import './KorrigeringAvInntektsmeldingForm.less';
import TrekkPerioder from './TrekkPerioder';
import LeggTilHelePerioder from './LeggTilHelePerioder';
import LeggTilDelvisFravær from './LeggTilDelvisFravær';

export default function KorrigeringAvInntektsmeldingForm() {
    return (
        <div>
            <Panel border>
                <h3>Korrigering av inntektsmelding omsorgspenger</h3>
                <SkjemaGruppe legend={<h4 className="korrigering-legend">Korriger fravær i inntektsmelding</h4>}>
                    <VirksomhetPanel arbeidsgivere={[]} />
                </SkjemaGruppe>
                <TrekkPerioder />
                <LeggTilHelePerioder />
                <LeggTilDelvisFravær />
            </Panel>
        </div>
    );
}
