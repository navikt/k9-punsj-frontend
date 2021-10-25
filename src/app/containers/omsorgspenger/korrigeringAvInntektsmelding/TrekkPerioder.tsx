import VerticalSpacer from 'app/components/VerticalSpacer';
import { Periodepaneler } from 'app/containers/pleiepenger/Periodepaneler';
import Panel from 'nav-frontend-paneler';
import { CheckboksPanel, SkjemaGruppe } from 'nav-frontend-skjema';
import React from 'react';
import { useIntl } from 'react-intl';

export default function TrekkPerioder(): JSX.Element {
    const intl = useIntl()
    return (
        <>
            <CheckboksPanel
                label="Trekk perioder med fravær"
                value="skjema.omsorgstilbud.checkboks"
                onChange={(e) => ''}
                checked={false}
            />
            <VerticalSpacer eightPx />
            <Panel className="listepanel">
                <SkjemaGruppe
                    legend={
                        <h4 className="korrigering-legend">Perioder arbeidsgiver ønsker å trekke krav om refusjon</h4>
                    }
                >
                        <div className="soknadsperiodecontainer">
                        <Periodepaneler
                            intl={intl}
                            periods={[{fom: '', tom: ''}]}
                            panelid={(i) => `søknadsperioder_${i}`}
                            initialPeriode={{fom: '', tom: ''}}
                            editSoknad={(perioder) => ''}
                            editSoknadState={(perioder) => ''}
                            textLeggTil="skjema.perioder.legg_til"
                            textFjern="skjema.perioder.fjern"
                            feilkodeprefiks="ytelse.søknadsperiode"
                            getErrorMessage={() => ''}
                            kanHaFlere
                        />
                    </div>
                </SkjemaGruppe>
            </Panel>
        </>
    );
}
