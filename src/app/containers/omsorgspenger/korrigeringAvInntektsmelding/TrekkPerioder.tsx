import { Periodepaneler } from 'app/containers/pleiepenger/Periodepaneler';
import intlHelper from 'app/utils/intlUtils';
import { AlertStripeInfo } from 'nav-frontend-alertstriper';
import Panel from 'nav-frontend-paneler';
import { SkjemaGruppe } from 'nav-frontend-skjema';
import React from 'react';
import { useIntl } from 'react-intl';
import EkspanderbartPanel from './EkspanderbartPanel';

interface TrekkPerioderProps {
    isPanelOpen: boolean;
    togglePanel: () => void;
}

const TrekkPerioder: React.FC<TrekkPerioderProps> = ({ isPanelOpen, togglePanel }): JSX.Element => {
    const intl = useIntl();
    return (
        <EkspanderbartPanel
            label={intlHelper(intl, 'omsorgspenger.korrigeringAvInntektsmelding.trekkPeriode.checkbox')}
            isPanelOpen={isPanelOpen}
            togglePanel={togglePanel}
        >
            <Panel className="listepanel">
                <SkjemaGruppe
                    legend={
                        <h4 className="korrigering-legend">
                            {intlHelper(intl, 'omsorgspenger.korrigeringAvInntektsmelding.trekkPeriode.legend')}
                        </h4>
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
        </EkspanderbartPanel>
    );
};

export default TrekkPerioder;
