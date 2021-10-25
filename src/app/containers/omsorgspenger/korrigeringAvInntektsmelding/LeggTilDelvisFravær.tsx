import AddCircleSvg from 'app/assets/SVG/AddCircleSVG';
import VerticalSpacer from 'app/components/VerticalSpacer';
import { Periodepaneler } from 'app/containers/pleiepenger/Periodepaneler';
import intlHelper from 'app/utils/intlUtils';
import { Datepicker } from 'nav-datovelger';
import Panel from 'nav-frontend-paneler';
import { CheckboksPanel, Input, SkjemaGruppe } from 'nav-frontend-skjema';
import React from 'react';
import { Row } from 'react-bootstrap';
import { useIntl } from 'react-intl';
import DateInput from '../../../components/skjema/DateInput';
import './LeggTilDelvisFravær.less';

export default function LeggTilDelvisFravær(): JSX.Element {
    const intl = useIntl();
    return (
        <>
            <CheckboksPanel
                label="Trekk perioder med fravær"
                value="skjema.omsorgstilbud.checkboks"
                onChange={(e) => ''}
                checked={false}
            />
            <VerticalSpacer eightPx />
            <Panel className="listepanel delvisFravaer">
                <SkjemaGruppe
                    legend={
                        <h4 className="korrigering-legend">Perioder arbeidsgiver ønsker å trekke krav om refusjon</h4>
                    }
                >
                    <div className="delvisFravaer__inputfelter">
                        <DateInput className="dateInput" value="" onChange={() => ''} label="Dato" />
                        <Input label="Timer" bredde="XS" />
                    </div>
                </SkjemaGruppe>
                <Row noGutters>
                    <button id="leggtilperiode" className="leggtilperiode" type="button" onClick={() => ''}>
                        <div className="leggtilperiodeIcon">
                            <AddCircleSvg title="leggtil" />
                        </div>
                        Legg til ny dag
                    </button>
                </Row>
            </Panel>
        </>
    );
}
