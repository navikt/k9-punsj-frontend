import Panel from 'nav-frontend-paneler';
import { SkjemaGruppe } from 'nav-frontend-skjema';
import React from 'react';
import VirksomhetPanel from './VirksomhetPanel';

import "./KorrigeringAvInntektsmeldingForm.less"

export default function KorrigeringAvInntektsmeldingForm() {
    return (
        <div>
            <Panel border>
                <h3>Korrigering av inntektsmelding omsorgspenger</h3>
                <SkjemaGruppe legend={<h4 className='korrigering-legend'>Korriger fravær i inntektsmelding</h4>}>
                    <VirksomhetPanel arbeidsgivere={[]} />
                </SkjemaGruppe>
            </Panel>
        </div>
    );
}
