import {NumberSelect} from 'app/components/number-select/NumberSelect';
import {
    GetErrorMessage,
    PeriodeComponent,
    UpdatePeriodeinfoInSoknad,
    UpdatePeriodeinfoInSoknadState
}                     from 'app/containers/pleiepenger/Periodepaneler';
import {Ukedag}       from 'app/models/enums';
import {
    ITilsyn,

    UkedagNumber
}                     from 'app/models/types';
import {
    convertNumberToUkedag,
    durationToString,
    hoursFromString,
    isWeekdayWithinPeriod,
    minutesFromString
}                     from 'app/utils';
import intlHelper     from 'app/utils/intlUtils';
import {SkjemaGruppe} from 'nav-frontend-skjema';
import * as React     from 'react';
import {
    Col,
    Container,
    Row
}                     from 'react-bootstrap';
import {IntlShape}    from 'react-intl';
import {PeriodeinfoV2} from "../../models/types/PeriodeInfoV2";

export const pfTilsyn: PeriodeComponent<ITilsyn> = (
    tilsyn: PeriodeinfoV2<ITilsyn>,
    periodeindex: number,
    updatePeriodeinfoInSoknad: UpdatePeriodeinfoInSoknad<ITilsyn>,
    updatePeriodeinfoInSoknadState: UpdatePeriodeinfoInSoknadState<ITilsyn>,
    feilprefiks: string,
    getErrorMessage: GetErrorMessage,
    intl: IntlShape
) => {

    return <Container className="tilsyntabell"><Row noGutters={true}>
        {Object.keys(Ukedag)
               .map(ukedag => Number(ukedag) as UkedagNumber)
               .filter(ukedag => isNaN(Number(Ukedag[ukedag])))
               .filter(ukedag => ukedag < 5)
               .map(ukedag => {
                   const ukedagstr = convertNumberToUkedag(ukedag);
                   const duration = tilsyn?.[ukedagstr];
                   const hours = hoursFromString(duration);
                   const minutes = minutesFromString(duration);
                   const isWeekdayOutOfPeriod = !isWeekdayWithinPeriod(ukedag, tilsyn.periode);
                   return <Col className="tilsyntabell_ukedag" key={ukedag}>
                       <SkjemaGruppe feil={getErrorMessage(`${feilprefiks}.${ukedagstr}`)}><Container>
                           <Row noGutters={true}><Col>{intlHelper(intl, `Ukedag.${ukedag}`)}</Col></Row>
                           <Row noGutters={true}>
                               <Col>
                                   <NumberSelect
                                       label={intlHelper(intl, 'skjema.tilsyn.timer')}
                                       value={hours}
                                       className="tilsyn-timer"
                                       onChange={event => {
                                           const newHours = +event.target.value;
                                           const newMinutes = newHours === 24 ? 0 : minutes;
                                           updatePeriodeinfoInSoknadState({[ukedagstr]: durationToString(newHours, newMinutes)}, true);
                                           updatePeriodeinfoInSoknad({[ukedagstr]: durationToString(newHours, newMinutes)});
                                       }}
                                       disabled={isWeekdayOutOfPeriod}
                                       to={24}
                                   />
                               </Col>
                               <Col>
                                   <NumberSelect
                                       label={intlHelper(intl, 'skjema.tilsyn.minutter')}
                                       value={minutes}
                                       className="tilsyn-minutter"
                                       onChange={event => {
                                           const newMinutes = +event.target.value;
                                           updatePeriodeinfoInSoknadState({[ukedagstr]: durationToString(hours, newMinutes)}, true);
                                           updatePeriodeinfoInSoknad({[ukedagstr]: durationToString(hours, newMinutes)});
                                       }}
                                       disabled={hours === 24 || isWeekdayOutOfPeriod}
                                       to={59}
                                   />
                               </Col>
                           </Row>
                       </Container></SkjemaGruppe>
                   </Col>;
               })}
    </Row></Container>;
};
