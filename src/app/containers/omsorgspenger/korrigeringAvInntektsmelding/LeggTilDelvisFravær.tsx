import AddCircleSvg from 'app/assets/SVG/AddCircleSVG';
import PanelProps from 'app/models/types/korrigeringAvInntektsmelding/Paneler';
import intlHelper from 'app/utils/intlUtils';
import { AlertStripeInfo } from 'nav-frontend-alertstriper';
import Panel from 'nav-frontend-paneler';
import { Input, SkjemaGruppe } from 'nav-frontend-skjema';
import React from 'react';
import { Row } from 'react-bootstrap';
import { useIntl } from 'react-intl';
import DateInput from '../../../components/skjema/DateInput';
import EkspanderbartPanel from './EkspanderbartPanel';
import './LeggTilDelvisFravær.less';

const LeggTilDelvisFravær: React.FC<PanelProps> = ({ isPanelOpen, togglePanel }): JSX.Element => {
    const intl = useIntl();
    return (
        <>
            <EkspanderbartPanel
                label={intlHelper(intl, 'omsorgspenger.korrigeringAvInntektsmelding.leggTilDelvisFravær.checkbox')}
                isPanelOpen={isPanelOpen}
                togglePanel={togglePanel}
            >
                <Panel className="listepanel delvisFravaer">
                    <SkjemaGruppe
                        legend={
                            <h4 className="korrigering-legend">
                                {intlHelper(
                                    intl,
                                    'omsorgspenger.korrigeringAvInntektsmelding.leggTilDelvisFravær.legend'
                                )}
                            </h4>
                        }
                    >
                        <AlertStripeInfo>
                            {intlHelper(intl, 'omsorgspenger.korrigeringAvInntektsmelding.leggTilDelvisFravær.info')}
                        </AlertStripeInfo>
                        <div className="delvisFravaer__inputfelter">
                            <DateInput
                                className="dateInput"
                                value=""
                                onChange={() => ''}
                                label={intlHelper(intl, 'skjema.dato')}
                            />
                            <Input label={intlHelper(intl, 'skjema.perioder.timer')} bredde="XS" />
                        </div>
                    </SkjemaGruppe>
                    <Row noGutters>
                        <button id="leggtilperiode" className="leggtilperiode" type="button" onClick={() => ''}>
                            <div className="leggtilperiodeIcon">
                                <AddCircleSvg title="leggtil" />
                            </div>
                            {intlHelper(intl, 'skjema.dag.legg_til')}
                        </button>
                    </Row>
                </Panel>
            </EkspanderbartPanel>
        </>
    );
};

export default LeggTilDelvisFravær;