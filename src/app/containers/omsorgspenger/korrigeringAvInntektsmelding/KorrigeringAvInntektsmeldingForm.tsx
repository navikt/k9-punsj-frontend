import React from 'react';
import Panel from 'nav-frontend-paneler';
import { CheckboksPanel, SkjemaGruppe } from 'nav-frontend-skjema';
import VerticalSpacer from 'app/components/VerticalSpacer';
import VirksomhetPanel from './VirksomhetPanel';

import './KorrigeringAvInntektsmeldingForm.less';

export default function KorrigeringAvInntektsmeldingForm() {
    return (
        <div>
            <Panel border>
                <h3>Korrigering av inntektsmelding omsorgspenger</h3>
                <SkjemaGruppe legend={<h4 className="korrigering-legend">Korriger fravær i inntektsmelding</h4>}>
                    <VirksomhetPanel arbeidsgivere={[]} />
                </SkjemaGruppe>
                <CheckboksPanel
                    label="Trekk perioder med fravær"
                    value="skjema.omsorgstilbud.checkboks"
                    onChange={(e) => ''}
                    checked={false}
                />
                <VerticalSpacer eightPx />
                <CheckboksPanel
                    label="Legg til hele dager/perioder med fravær"
                    value="skjema.omsorgstilbud.checkboks"
                    onChange={(e) => ''}
                    checked={false}
                />
                <VerticalSpacer eightPx />
                <CheckboksPanel
                    label="Legg til dager med delvis fravær"
                    value="skjema.omsorgstilbud.checkboks"
                    onChange={(e) => ''}
                    checked={false}
                />
            </Panel>
        </div>
    );
}
