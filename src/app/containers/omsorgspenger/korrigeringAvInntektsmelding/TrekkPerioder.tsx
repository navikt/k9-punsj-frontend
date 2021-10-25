import React from 'react';
import { useIntl } from 'react-intl';
import { AlertStripeInfo } from 'nav-frontend-alertstriper';
import Panel from 'nav-frontend-paneler';
import { CheckboksPanel, SkjemaGruppe } from 'nav-frontend-skjema';
import VerticalSpacer from 'app/components/VerticalSpacer';
import { Periodepaneler } from 'app/containers/pleiepenger/Periodepaneler';
import intlHelper from 'app/utils/intlUtils';


export default function TrekkPerioder(): JSX.Element {
    const intl = useIntl();
    return (
        <>
            <CheckboksPanel
                label={intlHelper(intl, 'omsorgspenger.korrigeringAvInntektsmelding.trekkPeriode.checkbox')}
                value="skjema.omsorgstilbud.checkboks"
                onChange={(e) => ''}
                checked={false}
            />
            <VerticalSpacer eightPx />
            <Panel className="listepanel">
                <SkjemaGruppe
                    legend={
                        <h4 className="korrigering-legend">{intlHelper(intl, 'omsorgspenger.korrigeringAvInntektsmelding.trekkPeriode.legend')}</h4>
                    }
                >
                    <AlertStripeInfo>
                        {intlHelper(intl, 'omsorgspenger.korrigeringAvInntektsmelding.trekkPeriode.info')}
                    </AlertStripeInfo>
                    <div className="soknadsperiodecontainer">
                        <Periodepaneler
                            intl={intl}
                            periods={[{ fom: '', tom: '' }]}
                            panelid={(i) => `søknadsperioder_${i}`}
                            initialPeriode={{ fom: '', tom: '' }}
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
