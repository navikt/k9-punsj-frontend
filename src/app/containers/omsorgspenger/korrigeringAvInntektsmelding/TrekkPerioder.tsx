import { SkjemaGruppe } from 'nav-frontend-skjema';
import React from 'react';
import { useIntl } from 'react-intl';

import { Alert, Panel } from '@navikt/ds-react';

import PanelProps from 'app/models/types/korrigeringAvInntektsmelding/Paneler';
import intlHelper from 'app/utils/intlUtils';

import EkspanderbartPanel from './EkspanderbartPanel';
import { KorrigeringAvInntektsmeldingFormFields } from './KorrigeringAvInntektsmeldingFormFieldsValues';
import { Periodepanel } from './Periodepanel';

const TrekkPerioder: React.FC<PanelProps> = ({ isPanelOpen, togglePanel }): JSX.Element => {
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
                    className="korrigering__skjemagruppe"
                >
                    <Alert size="small" variant="info" className="korrigering__infostripe">
                        {intlHelper(intl, 'omsorgspenger.korrigeringAvInntektsmelding.trekkPeriode.info')}
                    </Alert>
                    <div className="soknadsperiodecontainer">
                        <Periodepanel name={KorrigeringAvInntektsmeldingFormFields.Trekkperioder} />
                    </div>
                </SkjemaGruppe>
            </Panel>
        </EkspanderbartPanel>
    );
};

export default TrekkPerioder;
