import { Periodepaneler } from 'app/containers/pleiepenger/Periodepaneler';
import PanelProps from 'app/models/types/korrigeringAvInntektsmelding/Paneler';
import intlHelper from 'app/utils/intlUtils';
import { AlertStripeInfo } from 'nav-frontend-alertstriper';
import Panel from 'nav-frontend-paneler';
import { SkjemaGruppe } from 'nav-frontend-skjema';
import React from 'react';
import { useIntl } from 'react-intl';
import EkspanderbartPanel from './EkspanderbartPanel';
import { Periodepanel } from './Periodepanel';
import { KorrigeringAvInntektsmeldingFormFields } from './KorrigeringAvInntektsmeldingFormFieldsValues';

const LeggTilHelePerioder: React.FC<PanelProps> = ({ isPanelOpen, togglePanel }): JSX.Element => {
    const intl = useIntl();
    return (
        <>
            <EkspanderbartPanel
                label={intlHelper(intl, 'omsorgspenger.korrigeringAvInntektsmelding.leggTilHeleDager.checkbox')}
                isPanelOpen={isPanelOpen}
                togglePanel={togglePanel}
            >
                <Panel className="listepanel">
                    <SkjemaGruppe
                        legend={
                            <h4 className="korrigering-legend">
                                {intlHelper(intl, 'omsorgspenger.korrigeringAvInntektsmelding.leggTilHeleDager.legend')}
                            </h4>
                        }
                        className="korrigering__skjemagruppe"
                    >
                        <AlertStripeInfo className="korrigering__infostripe">
                            {intlHelper(intl, 'omsorgspenger.korrigeringAvInntektsmelding.leggTilHeleDager.info')}
                        </AlertStripeInfo>
                        <div className="soknadsperiodecontainer">
                            <Periodepanel name={KorrigeringAvInntektsmeldingFormFields.PerioderMedRefusjonskrav} />
                        </div>
                    </SkjemaGruppe>
                </Panel>
            </EkspanderbartPanel>
        </>
    );
};

export default LeggTilHelePerioder;
