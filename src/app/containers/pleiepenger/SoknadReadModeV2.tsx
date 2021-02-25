import {PersonBox}                                                   from 'app/components/person-box/PersonBox';
import {JaNeiVetikke, TimeFormat}                                    from 'app/models/enums';
import {Arbeid, Periode, Soknad, Tilleggsinformasjon, Tilsynsordning} from 'app/models/types';
import {datetime}                                                    from 'app/utils';
import intlHelper                                                    from 'app/utils/intlUtils';
import classNames                                                    from 'classnames';
import * as React                                                    from 'react';
import {Col, Container, Row}                                         from 'react-bootstrap';
import {injectIntl, WrappedComponentProps}                           from 'react-intl';
import {ArbeidV2, SoknadV2, TilleggsinformasjonV2} from "../../models/types/Soknadv2";
import {SoknadPeriode} from "../../models/types/HentSoknad";

interface ISoknadReadModeProps {
    soknad: SoknadV2;
}

class SoknadReadMode extends React.Component<WrappedComponentProps & ISoknadReadModeProps> {

    render() {
        const {intl, soknad} = this.props;
        return (
            <Container className={classNames('read-modal soknad-read-mode', 'enkel')}>
                <Row className="felles">
                    <Col>{intlHelper(intl, 'mappe.lesemodus.mottakelsesdato')}</Col>
                    {this.mottakelsesdato(soknad.datoMottatt)}
                </Row>
                <Row>
                    <Col>{intlHelper(intl, 'mappe.lesemodus.perioder')}</Col>
                    {this.soknadsperioder([soknad.ytelse.søknadsperiode])}
                </Row>
                <Row className="felles">
                    <Col>{intlHelper(intl, 'mappe.lesemodus.barn')}</Col>
                    <Col>{soknad.ytelse.barn.norskIdentitetsnummer ? soknad.ytelse.barn.norskIdentitetsnummer : soknad.ytelse.barn.foedselsdato}</Col>
                </Row>
                <Row>
                    <Col>{intlHelper(intl, 'mappe.lesemodus.arbeid')}</Col>
                    {this.arbeid(soknad.ytelse.arbeidAktivitet)}
                </Row>
                <Row className="felles">
                    <Col>{intlHelper(intl, 'mappe.lesemodus.tilsyn')}</Col>
                    {this.tilsynsordning(soknad.ytelse.tilsynsordning)}
                </Row>

            </Container>
        );
    }

    private mottakelsesdato = (dato: string) => <Col>{datetime(this.props.intl, TimeFormat.DATE_WITH_MONTH_NAME, dato)}</Col>;

    private soknadsperioder = (sokandsperioder: SoknadPeriode[]) => <Col><ul>{sokandsperioder.map((p, i) => <li key={i}>{p.fom + '-' + p.tom}</li>)}</ul></Col>;

    private arbeid = (arbeid: ArbeidV2) => {
        const {intl} = this.props;
        return <Col>{!!arbeid.numberOfWorkPeriods() && <ul>
            {arbeid.arbeidstaker.map((a,i) => <li key={i}>
                <p>{a.description(intl)}</p>
                {a.skalJobbeProsent.length && <ul>{a.skalJobbeProsent.map((tg,j) => <li key={j}>{tg.description(intl)}</li>)}</ul>}
            </li>)}
            {arbeid.selvstendigNaeringsdrivende.map((a, i) => <li key={i}>{a.description(intl)}</li>)}
            {<li key={"frilanser"}>{arbeid.frilanser.description(intl)}</li>}
        </ul>}</Col>
    };

    private tilleggsinfo = (tilleggsinformasjon: TilleggsinformasjonV2[], intlCode: string) => {
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
