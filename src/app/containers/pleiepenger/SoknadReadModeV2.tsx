import {PersonBox}                                                   from 'app/components/person-box/PersonBox';
import {JaNeiVetikke, TimeFormat}                                    from 'app/models/enums';
import {Arbeid, Periode, Soknad, Tilleggsinformasjon, Tilsynsordning} from 'app/models/types';
import {datetime}                                                    from 'app/utils';
import intlHelper                                                    from 'app/utils/intlUtils';
import classNames                                                    from 'classnames';
import * as React                                                    from 'react';
import {Col, Container, Row}                                         from 'react-bootstrap';
import {injectIntl, WrappedComponentProps}                           from 'react-intl';
import {SoknadV2} from "../../models/types/Soknadv2";
import {SoknadPeriode} from "../../models/types/HentSoknad";

interface ISoknadReadModeProps {
    soknad: SoknadV2;
}

class SoknadReadMode extends React.Component<WrappedComponentProps & ISoknadReadModeProps> {

    render() {
        const {intl, soknad} = this.props;
        /*       const dobbelSoknad = mappe.genererDobbelSoknad();
               const {soknad1, soknad2} = dobbelSoknad;
               const {harToSokere} = dobbelSoknad;
               return (
                   <Container className={classNames('read-modal soknad-read-mode', harToSokere ? 'dobbel' : 'enkel')}>
                       {harToSokere && <Row>
                           <Col/>
                           <Col><PersonBox header={intlHelper(intl, 'soker1')} ident={mappe.idents[0]}/></Col>
                           <Col><PersonBox header={intlHelper(intl, 'soker2')} ident={mappe.idents[1]}/></Col>
                       </Row>}
                       <Row className="felles">
                           <Col>{intlHelper(intl, 'mappe.lesemodus.mottakelsesdato')}</Col>
                           {this.mottakelsesdato(soknad1.datoMottatt)}
                           {harToSokere && this.mottakelsesdato(soknad2!.datoMottatt)}
                       </Row>
                       <Row>
                           <Col>{intlHelper(intl, 'mappe.lesemodus.perioder')}</Col>
                           {this.soknadsperioder(soknad1.perioder)}
                           {harToSokere && this.soknadsperioder(soknad2!.perioder)}
                       </Row>
                       <Row className="felles">
                           <Col>{intlHelper(intl, 'mappe.lesemodus.spraak')}</Col>
                           <Col>{intlHelper(intl, `locale.${soknad1.spraak}`)}</Col>
                           {harToSokere && <Col>{intlHelper(intl, `locale.${soknad2!.spraak}`)}</Col>}
                       </Row>
                       <Row className="felles">
                           <Col>{intlHelper(intl, 'mappe.lesemodus.barn')}</Col>
                           <Col>{soknad1.getFnrOrFdato()}</Col>
                           {harToSokere && <Col>{soknad2!.getFnrOrFdato()}</Col>}
                       </Row>
                       <Row>
                           <Col>{intlHelper(intl, 'mappe.lesemodus.arbeid')}</Col>
                           {this.arbeid(soknad1.arbeid)}
                           {harToSokere && this.arbeid(soknad2!.arbeid)}
                       </Row>
                       <Row className="felles">
                           <Col>{intlHelper(intl, 'mappe.lesemodus.tilsyn')}</Col>
                           {this.tilsynsordning(soknad1.tilsynsordning)}
                           {harToSokere && this.tilsynsordning(soknad2!.tilsynsordning)}
                       </Row>
                       <Row className="felles">
                           <Col>{intlHelper(intl, 'mappe.lesemodus.beredskap')}</Col>
                           {this.tilleggsinfo(soknad1.beredskap, 'mappe.lesemodus.beredskap.beskrivelse')}
                           {harToSokere && this.tilleggsinfo(soknad2!.beredskap, 'mappe.lesemodus.beredskap.beskrivelse')}
                       </Row>
                       <Row className="felles">
                           <Col>{intlHelper(intl, 'mappe.lesemodus.nattevaak')}</Col>
                           {this.tilleggsinfo(soknad1.nattevaak, 'mappe.lesemodus.nattevaak.beskrivelse')}
                           {harToSokere && this.tilleggsinfo(soknad2!.nattevaak, 'mappe.lesemodus.nattevaak.beskrivelse')}
                       </Row>
                   </Container>
               ); */
        return (
            <Container className={classNames('read-modal soknad-read-mode', 'enkel')}>
                <Row className="felles">
                    <Col>{intlHelper(intl, 'mappe.lesemodus.mottakelsesdato')}</Col>
                    {this.mottakelsesdato(soknad.datoMottatt)}
                </Row>
                <Row>
                    <Col>{intlHelper(intl, 'mappe.lesemodus.perioder')}</Col>
                    {this.soknadsperioder([soknad.ytelse.søknadsPeriode])}
                </Row>
                <Row className="felles">
                    <Col>{intlHelper(intl, 'mappe.lesemodus.barn')}</Col>
                    <Col>{soknad.ytelse.getFnrOrFdato()}</Col>
                </Row>
                <Row>
                    <Col>{intlHelper(intl, 'mappe.lesemodus.arbeid')}</Col>
                    {this.arbeid(soknad.ytelse.arbeidAktivitet)}
                </Row>
                <Row className="felles">
                    <Col>{intlHelper(intl, 'mappe.lesemodus.tilsyn')}</Col>
                    {this.tilsynsordning(soknad.ytelse.tilsynsordning)}
                </Row>
                <Row className="felles">
                    <Col>{intlHelper(intl, 'mappe.lesemodus.beredskap')}</Col>
                    {this.tilleggsinfo(soknad.ytelse.beredskap, 'mappe.lesemodus.beredskap.beskrivelse')}
                </Row>
                <Row className="felles">
                    <Col>{intlHelper(intl, 'mappe.lesemodus.nattevaak')}</Col>
                    {this.tilleggsinfo(soknad.ytelse.nattevaak, 'mappe.lesemodus.nattevaak.beskrivelse')}
                </Row>
            </Container>
        );
    }

    private mottakelsesdato = (dato: string) => <Col>{datetime(this.props.intl, TimeFormat.DATE_WITH_MONTH_NAME, dato)}</Col>;

    private soknadsperioder = (sokandsperioder: SoknadPeriode[]) => <Col><ul>{sokandsperioder.map((p, i) => <li key={i}>{p.fom + '-' + p.tom}</li>)}</ul></Col>;

    private arbeid = (arbeid: Arbeid) => {
        const {intl} = this.props;
        return <Col>{!!arbeid.numberOfWorkPeriods() && <ul>
            {arbeid.arbeidstaker.map((a,i) => <li key={i}>
                <p>{a.description(intl)}</p>
                {a.skalJobbeProsent.length && <ul>{a.skalJobbeProsent.map((tg,j) => <li key={j}>{tg.description(intl)}</li>)}</ul>}
            </li>)}
            {arbeid.selvstendigNaeringsdrivende.map((a, i) => <li key={i}>{a.description(intl)}</li>)}
            {arbeid.frilanser.map((a,i) => <li key={i}>{a.description(intl)}</li>)}
        </ul>}</Col>
    };

    private tilleggsinfo = (tilleggsinformasjon: Tilleggsinformasjon[], intlCode: string) => {
        const {intl} = this.props;
        return <Col>{!!tilleggsinformasjon.length && <ul>
            {tilleggsinformasjon.map((t,i) => <li key={i}>{intlHelper(
                intl,
                intlCode,
                {...t.periode.generateStringsForDescription(intl)}
            )}</li>)}
        </ul>}</Col>;
    };

    private tilsynsordning = (tilsynsordning: Tilsynsordning) => {
        const {intl} = this.props;
        return <Col>{tilsynsordning.iTilsynsordning === JaNeiVetikke.JA
            ? <ul>{tilsynsordning.opphold.map((t,i) => <li key={i}>{t.description(intl)}</li>)}</ul>
            : intlHelper(intl, tilsynsordning.iTilsynsordning)}</Col>;
    }
}


export default injectIntl(SoknadReadMode);
